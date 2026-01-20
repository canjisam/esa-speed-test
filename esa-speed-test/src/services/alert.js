/**
 * 告警服务
 * 处理节点状态监控、告警检测和通知
 */

// 默认告警配置
const DEFAULT_CONFIG = {
  // 延迟阈值（毫秒）
  latencyThresholds: {
    online: 150,
    congested: 300,
    offline: 300
  },
  // 丢包率阈值（百分比）
  packetLossThresholds: {
    online: 5,
    congested: 15,
    offline: 15
  },
  // 健康度评分权重
  healthScoreWeights: {
    latency: 0.4,      // 延迟权重
    packetLoss: 0.3,   // 丢包率权重
    stability: 0.2,    // 稳定性权重
    uptime: 0.1        // 可用性权重
  },
  // 告警开关
  alerts: {
    nodeOffline: true,    // 节点离线告警
    latencyHigh: true,    // 高延迟告警
    latencySpike: true,   // 延迟突增告警
    stabilityLow: true    // 稳定性低告警
  },
  // 延迟突增检测阈值（相对于平均值的倍数）
  latencySpikeThreshold: 2.0,
  // 稳定性低阈值（标准差）
  stabilityThreshold: 50
}

// 告警配置
let alertConfig = { ...DEFAULT_CONFIG }

// 告警历史
const alertHistory = []

// 节点状态缓存
const nodeStatusCache = new Map()

/**
 * 计算节点状态
 * @param {number} latency - 延迟时间（毫秒）
 * @param {number} packetLoss - 丢包率（百分比，0-100）
 * @returns {string} - 状态：online, congested, offline
 */
export function calculateNodeStatus(latency, packetLoss = 0) {
  // 如果延迟为0，视为离线
  if (latency === 0) {
    return 'offline'
  }
  
  // 根据延迟和丢包率判断状态
  const thresholds = alertConfig.latencyThresholds
  const packetThresholds = alertConfig.packetLossThresholds
  
  // 离线判断
  if (latency >= thresholds.offline || packetLoss >= packetThresholds.offline) {
    return 'offline'
  }
  
  // 拥堵判断
  if (latency >= thresholds.congested || packetLoss >= packetThresholds.congested) {
    return 'congested'
  }
  
  // 在线
  return 'online'
}

/**
 * 计算节点健康度评分（0-100）
 * @param {Object} nodeData - 节点数据
 * @param {Array} history - 历史数据
 * @returns {number} - 健康度评分
 */
export function calculateHealthScore(nodeData, history = []) {
  const weights = alertConfig.healthScoreWeights
  let score = 0
  
  // 1. 延迟评分（40%）
  const latencyScore = calculateLatencyScore(nodeData.latency)
  score += latencyScore * weights.latency
  
  // 2. 丢包率评分（30%）
  const packetLossScore = calculatePacketLossScore(nodeData.packetLoss || 0)
  score += packetLossScore * weights.packetLoss
  
  // 3. 稳定性评分（20%）
  const stabilityScore = calculateStabilityScore(history)
  score += stabilityScore * weights.stability
  
  // 4. 可用性评分（10%）
  const uptimeScore = nodeData.status === 'online' ? 100 : 0
  score += uptimeScore * weights.uptime
  
  return Math.round(score)
}

/**
 * 计算延迟评分
 * @param {number} latency - 延迟时间
 * @returns {number} - 评分（0-100）
 */
function calculateLatencyScore(latency) {
  if (latency === 0) return 0
  if (latency < 50) return 100
  if (latency < 100) return 90
  if (latency < 150) return 80
  if (latency < 200) return 60
  if (latency < 300) return 40
  return 20
}

/**
 * 计算丢包率评分
 * @param {number} packetLoss - 丢包率
 * @returns {number} - 评分（0-100）
 */
function calculatePacketLossScore(packetLoss) {
  if (packetLoss === 0) return 100
  if (packetLoss < 1) return 95
  if (packetLoss < 3) return 85
  if (packetLoss < 5) return 70
  if (packetLoss < 10) return 50
  return 20
}

/**
 * 计算稳定性评分
 * @param {Array} history - 历史数据
 * @returns {number} - 评分（0-100）
 */
function calculateStabilityScore(history) {
  if (history.length < 3) return 50
  
  const latencies = history.map(h => h.latency).filter(l => l > 0)
  if (latencies.length < 3) return 50
  
  // 计算标准差
  const mean = latencies.reduce((sum, val) => sum + val, 0) / latencies.length
  const variance = latencies.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / latencies.length
  const stdDev = Math.sqrt(variance)
  
  // 标准差越小，稳定性越高
  if (stdDev < 10) return 100
  if (stdDev < 20) return 90
  if (stdDev < 30) return 80
  if (stdDev < 50) return 60
  if (stdDev < 80) return 40
  return 20
}

/**
 * 检测状态变化
 * @param {Object} node - 节点对象
 * @returns {Object|null} - 变化信息或 null
 */
export function detectStatusChange(node) {
  const cache = nodeStatusCache.get(node.id)
  if (!cache) {
    nodeStatusCache.set(node.id, { status: node.status, latency: node.latency })
    return null
  }
  
  const changes = []
  
  // 状态变化
  if (cache.status !== node.status) {
    changes.push({
      type: 'status',
      from: cache.status,
      to: node.status,
      severity: getChangeSeverity(cache.status, node.status)
    })
  }
  
  // 延迟突增检测
  if (cache.latency > 0 && node.latency > 0) {
    const ratio = node.latency / cache.latency
    if (ratio >= alertConfig.latencySpikeThreshold) {
      changes.push({
        type: 'latency_spike',
        from: cache.latency,
        to: node.latency,
        severity: 'high'
      })
    }
  }
  
  // 更新缓存
  nodeStatusCache.set(node.id, { status: node.status, latency: node.latency })
  
  return changes.length > 0 ? changes : null
}

/**
 * 获取状态变化严重程度
 * @param {string} from - 原状态
 * @param {string} to - 新状态
 * @returns {string} - 严重程度：low, medium, high
 */
function getChangeSeverity(from, to) {
  // 从在线到离线
  if (from === 'online' && to === 'offline') return 'high'
  // 从在线到拥堵
  if (from === 'online' && to === 'congested') return 'medium'
  // 从拥堵到离线
  if (from === 'congested' && to === 'offline') return 'high'
  // 从离线到在线
  if (from === 'offline' && to === 'online') return 'low'
  // 从离线到拥堵
  if (from === 'offline' && to === 'congested') return 'low'
  // 从拥堵到在线
  if (from === 'congested' && to === 'online') return 'low'
  
  return 'low'
}

/**
 * 检测告警
 * @param {Object} node - 节点对象
 * @param {Array} history - 历史数据
 * @returns {Array} - 告警列表
 */
export function detectAlerts(node, history = []) {
  const alerts = []
  const config = alertConfig.alerts
  
  // 节点离线告警
  if (config.nodeOffline && node.status === 'offline') {
    alerts.push({
      type: 'node_offline',
      nodeId: node.id,
      nodeName: node.name,
      severity: 'high',
      message: `${node.name} 已离线`,
      timestamp: Date.now()
    })
  }
  
  // 高延迟告警
  if (config.latencyHigh && node.latency > alertConfig.latencyThresholds.congested) {
    alerts.push({
      type: 'latency_high',
      nodeId: node.id,
      nodeName: node.name,
      severity: node.latency > alertConfig.latencyThresholds.offline ? 'high' : 'medium',
      message: `${node.name} 延迟过高: ${node.latency}ms`,
      timestamp: Date.now()
    })
  }
  
  // 延迟突增告警
  if (config.latencySpike && history.length > 0) {
    const recentLatencies = history.slice(-5).map(h => h.latency).filter(l => l > 0)
    if (recentLatencies.length > 0) {
      const avgLatency = recentLatencies.reduce((sum, val) => sum + val, 0) / recentLatencies.length
      if (node.latency > avgLatency * alertConfig.latencySpikeThreshold) {
        alerts.push({
          type: 'latency_spike',
          nodeId: node.id,
          nodeName: node.name,
          severity: 'high',
          message: `${node.name} 延迟突增: ${node.latency}ms (平均: ${Math.round(avgLatency)}ms)`,
          timestamp: Date.now()
        })
      }
    }
  }
  
  // 稳定性低告警
  if (config.stabilityLow && history.length > 0) {
    const stabilityScore = calculateStabilityScore(history)
    if (stabilityScore < 60) {
      alerts.push({
        type: 'stability_low',
        nodeId: node.id,
        nodeName: node.name,
        severity: 'medium',
        message: `${node.name} 稳定性较低: ${stabilityScore}分`,
        timestamp: Date.now()
      })
    }
  }
  
  return alerts
}

/**
 * 添加告警历史
 * @param {Object} alert - 告警对象
 */
export function addAlertHistory(alert) {
  alertHistory.push({
    ...alert,
    id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  })
  
  // 只保留最近 100 条告警
  if (alertHistory.length > 100) {
    alertHistory.shift()
  }
  
  // 持久化到 localStorage
  saveAlertHistory()
}

/**
 * 获取告警历史
 * @param {number} limit - 限制数量
 * @returns {Array} - 告警历史
 */
export function getAlertHistory(limit = 50) {
  return alertHistory.slice(-limit).reverse()
}

/**
 * 清空告警历史
 */
export function clearAlertHistory() {
  alertHistory.length = 0
  saveAlertHistory()
}

/**
 * 保存告警历史到 localStorage
 */
function saveAlertHistory() {
  try {
    localStorage.setItem('esa-alert-history', JSON.stringify(alertHistory))
  } catch (error) {
    console.error('保存告警历史失败:', error)
  }
}

/**
 * 从 localStorage 加载告警历史
 */
export function loadAlertHistory() {
  try {
    const data = localStorage.getItem('esa-alert-history')
    if (data) {
      const history = JSON.parse(data)
      alertHistory.length = 0
      alertHistory.push(...history)
    }
  } catch (error) {
    console.error('加载告警历史失败:', error)
  }
}

/**
 * 更新告警配置
 * @param {Object} newConfig - 新配置
 */
export function updateAlertConfig(newConfig) {
  alertConfig = { ...alertConfig, ...newConfig }
  
  // 保存到 localStorage
  try {
    localStorage.setItem('esa-alert-config', JSON.stringify(alertConfig))
  } catch (error) {
    console.error('保存告警配置失败:', error)
  }
}

/**
 * 获取告警配置
 * @returns {Object} - 告警配置
 */
export function getAlertConfig() {
  return { ...alertConfig }
}

/**
 * 从 localStorage 加载告警配置
 */
export function loadAlertConfig() {
  try {
    const data = localStorage.getItem('esa-alert-config')
    if (data) {
      const config = JSON.parse(data)
      alertConfig = { ...DEFAULT_CONFIG, ...config }
    }
  } catch (error) {
    console.error('加载告警配置失败:', error)
  }
}

/**
 * 重置告警配置
 */
export function resetAlertConfig() {
  alertConfig = { ...DEFAULT_CONFIG }
  try {
    localStorage.setItem('esa-alert-config', JSON.stringify(alertConfig))
  } catch (error) {
    console.error('保存告警配置失败:', error)
  }
}

// 初始化时加载配置和历史
loadAlertConfig()
loadAlertHistory()