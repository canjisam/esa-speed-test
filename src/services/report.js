/**
 * 测速报告服务
 * 处理测速数据统计、报告生成和导出
 */

import { getSpeedTestHistory } from './storage'

/**
 * 计算节点统计数据
 * @param {Object} node - 节点对象
 * @param {number} days - 统计天数
 * @returns {Object} - 统计数据
 */
export function calculateNodeStatistics(node, days = 7) {
  const history = getSpeedTestHistory(node.id, 1000)
  const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000)
  const recentHistory = history.filter(h => h.timestamp > cutoffTime && h.latency > 0)
  
  if (recentHistory.length === 0) {
    return {
      nodeId: node.id,
      nodeName: node.name,
      days,
      totalTests: 0,
      averageLatency: 0,
      minLatency: 0,
      maxLatency: 0,
      medianLatency: 0,
      stdDev: 0,
      stability: 0,
      successRate: 0,
      uptime: 0
    }
  }
  
  const latencies = recentHistory.map(h => h.latency)
  
  // 平均延迟
  const averageLatency = Math.round(
    latencies.reduce((sum, val) => sum + val, 0) / latencies.length
  )
  
  // 最小延迟
  const minLatency = Math.min(...latencies)
  
  // 最大延迟
  const maxLatency = Math.max(...latencies)
  
  // 中位数延迟
  const sorted = [...latencies].sort((a, b) => a - b)
  const medianLatency = sorted.length % 2 === 0
    ? Math.round((sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2)
    : sorted[Math.floor(sorted.length / 2)]
  
  // 标准差
  const variance = latencies.reduce((sum, val) => {
    return sum + Math.pow(val - averageLatency, 2)
  }, 0) / latencies.length
  const stdDev = Math.round(Math.sqrt(variance))
  
  // 稳定性（标准差越小，稳定性越高）
  const stability = Math.max(0, Math.min(100, 100 - (stdDev / 2)))
  
  // 成功率
  const successCount = recentHistory.filter(h => h.status === 'success').length
  const successRate = Math.round((successCount / recentHistory.length) * 100)
  
  // 可用性（基于延迟）
  const onlineCount = recentHistory.filter(h => h.latency < 300).length
  const uptime = Math.round((onlineCount / recentHistory.length) * 100)
  
  return {
    nodeId: node.id,
    nodeName: node.name,
    region: node.region,
    country: node.country,
    days,
    totalTests: recentHistory.length,
    averageLatency,
    minLatency,
    maxLatency,
    medianLatency,
    stdDev,
    stability: Math.round(stability),
    successRate,
    uptime
  }
}

/**
 * 生成测速报告
 * @param {Array} nodes - 节点数组
 * @param {number} days - 统计天数
 * @returns {Object} - 报告数据
 */
export function generateReport(nodes, days = 7) {
  const nodeStats = nodes.map(node => calculateNodeStatistics(node, days))
  
  // 总体统计
  const totalTests = nodeStats.reduce((sum, stat) => sum + stat.totalTests, 0)
  const avgLatency = nodeStats.reduce((sum, stat) => sum + stat.averageLatency, 0) / nodes.length
  const avgStability = nodeStats.reduce((sum, stat) => sum + stat.stability, 0) / nodes.length
  const avgSuccessRate = nodeStats.reduce((sum, stat) => sum + stat.successRate, 0) / nodes.length
  const avgUptime = nodeStats.reduce((sum, stat) => sum + stat.uptime, 0) / nodes.length
  
  // 按地区分组统计
  const regionStats = {}
  nodes.forEach(node => {
    if (!regionStats[node.region]) {
      regionStats[node.region] = []
    }
    regionStats[node.region].push(calculateNodeStatistics(node, days))
  })
  
  Object.keys(regionStats).forEach(region => {
    const stats = regionStats[region]
    regionStats[region] = {
      count: stats.length,
      averageLatency: Math.round(stats.reduce((sum, s) => sum + s.averageLatency, 0) / stats.length),
      stability: Math.round(stats.reduce((sum, s) => sum + s.stability, 0) / stats.length),
      uptime: Math.round(stats.reduce((sum, s) => sum + s.uptime, 0) / stats.length)
    }
  })
  
  return {
    reportTime: Date.now(),
    days,
    summary: {
      totalNodes: nodes.length,
      totalTests,
      averageLatency: Math.round(avgLatency),
      averageStability: Math.round(avgStability),
      averageSuccessRate: Math.round(avgSuccessRate),
      averageUptime: Math.round(avgUptime)
    },
    regionStats,
    nodeStats: nodeStats.sort((a, b) => a.averageLatency - b.averageLatency)
  }
}

/**
 * 导出报告为 CSV
 * @param {Object} report - 报告数据
 * @returns {string} - CSV 字符串
 */
export function exportReportToCSV(report) {
  const headers = [
    '节点名称',
    '地区',
    '国家',
    '测试次数',
    '平均延迟',
    '最小延迟',
    '最大延迟',
    '中位数延迟',
    '标准差',
    '稳定性(%)',
    '成功率(%)',
    '可用性(%)'
  ]
  
  const rows = report.nodeStats.map(stat => [
    stat.nodeName,
    stat.region,
    stat.country,
    stat.totalTests,
    stat.averageLatency,
    stat.minLatency,
    stat.maxLatency,
    stat.medianLatency,
    stat.stdDev,
    stat.stability,
    stat.successRate,
    stat.uptime
  ])
  
  // 添加报告摘要
  const summaryRows = [
    ['报告摘要'],
    ['生成时间', new Date(report.reportTime).toLocaleString('zh-CN')],
    ['统计天数', report.days],
    ['节点总数', report.summary.totalNodes],
    ['总测试次数', report.summary.totalTests],
    ['平均延迟', `${report.summary.averageLatency} ms`],
    ['平均稳定性', `${report.summary.averageStability}%`],
    ['平均成功率', `${report.summary.averageSuccessRate}%`],
    ['平均可用性', `${report.summary.averageUptime}%`],
    [''],
    ['节点详情'],
    ...rows
  ]
  
  // 转换为 CSV 格式
  const csvContent = [
    headers.join(','),
    ...summaryRows.map(row => row.join(','))
  ].join('\n')
  
  // 添加 BOM 以支持中文
  return '\uFEFF' + csvContent
}

/**
 * 下载 CSV 文件
 * @param {string} csvContent - CSV 内容
 * @param {string} filename - 文件名
 */
export function downloadCSV(csvContent, filename = 'speed-test-report.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

/**
 * 生成性能对比数据
 * @param {Array} nodes - 节点数组
 * @returns {Array} - 对比数据
 */
export function generatePerformanceComparison(nodes) {
  const stats = nodes.map(node => {
    const history = getSpeedTestHistory(node.id, 20)
    const recentHistory = history.filter(h => h.latency > 0)
    
    const avgLatency = recentHistory.length > 0
      ? Math.round(recentHistory.reduce((sum, h) => sum + h.latency, 0) / recentHistory.length)
      : 0
    
    return {
      ...node,
      avgLatency,
      testCount: recentHistory.length
    }
  })
  
  // 按平均延迟排序
  return stats.sort((a, b) => a.avgLatency - b.avgLatency)
}

/**
 * 查询测速历史
 * @param {string} nodeId - 节点ID
 * @param {Object} filters - 过滤条件
 * @returns {Array} - 历史记录
 */
export function querySpeedTestHistory(nodeId, filters = {}) {
  let history = getSpeedTestHistory(nodeId, 1000)
  
  // 时间范围过滤
  if (filters.startTime) {
    history = history.filter(h => h.timestamp >= filters.startTime)
  }
  if (filters.endTime) {
    history = history.filter(h => h.timestamp <= filters.endTime)
  }
  
  // 延迟范围过滤
  if (filters.minLatency !== undefined) {
    history = history.filter(h => h.latency >= filters.minLatency)
  }
  if (filters.maxLatency !== undefined) {
    history = history.filter(h => h.latency <= filters.maxLatency)
  }
  
  // 状态过滤
  if (filters.status) {
    history = history.filter(h => h.status === filters.status)
  }
  
  // 限制数量
  if (filters.limit) {
    history = history.slice(-filters.limit)
  }
  
  return history.reverse()
}