/**
 * 节点推荐服务
 * 实现智能节点推荐算法
 */

import { calculateHealthScore } from './alert'
import { getSpeedTestHistory } from './storage'

/**
 * 计算两个地理坐标之间的距离（Haversine 公式）
 * @param {number} lat1 - 纬度1
 * @param {number} lon1 - 经度1
 * @param {number} lat2 - 纬度2
 * @param {number} lon2 - 经度2
 * @returns {number} - 距离（千米）
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // 地球半径（千米）
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg) {
  return deg * (Math.PI / 180)
}

/**
 * 获取用户位置（基于 IP 定位）
 * @returns {Promise<Object>} - 用户位置信息
 */
export async function getUserLocation() {
  try {
    // 使用免费的 IP 定位服务
    const response = await fetch('https://ipapi.co/json/')
    const data = await response.json()
    
    return {
      latitude: data.latitude,
      longitude: data.longitude,
      city: data.city,
      region: data.region,
      country: data.country_name,
      ip: data.ip
    }
  } catch (error) {
    console.error('获取用户位置失败:', error)
    // 返回默认位置（北京）
    return {
      latitude: 39.9042,
      longitude: 116.4074,
      city: '北京',
      region: '北京',
      country: '中国',
      ip: 'unknown'
    }
  }
}

/**
 * 计算推荐得分
 * @param {Object} node - 节点对象
 * @param {Object} userLocation - 用户位置
 * @param {Object} weights - 权重配置
 * @returns {Object} - 推荐得分和原因
 */
export function calculateRecommendationScore(node, userLocation, weights = {}) {
  const defaultWeights = {
    latency: 0.4,      // 延迟权重
    stability: 0.3,    // 稳定性权重
    distance: 0.2,     // 距离权重
    availability: 0.1  // 可用性权重
  }
  
  const w = { ...defaultWeights, ...weights }
  const reasons = []
  
  // 1. 延迟评分（40%）
  const latencyScore = calculateLatencyScore(node.latency)
  reasons.push({
    factor: '延迟',
    score: latencyScore,
    weight: w.latency,
    value: `${node.latency}ms`,
    reason: node.latency < 50 ? '延迟极低' : node.latency < 100 ? '延迟较低' : '延迟一般'
  })
  
  // 2. 稳定性评分（30%）
  const history = getSpeedTestHistory(node.id, 20)
  const stabilityScore = calculateStabilityScore(history)
  reasons.push({
    factor: '稳定性',
    score: stabilityScore,
    weight: w.stability,
    value: `${stabilityScore}分`,
    reason: stabilityScore > 80 ? '非常稳定' : stabilityScore > 60 ? '较为稳定' : '稳定性一般'
  })
  
  // 3. 距离评分（20%）
  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    node.lat,
    node.lng
  )
  const distanceScore = calculateDistanceScore(distance)
  reasons.push({
    factor: '距离',
    score: distanceScore,
    weight: w.distance,
    value: `${Math.round(distance)}km`,
    reason: distance < 500 ? '距离较近' : distance < 2000 ? '距离适中' : '距离较远'
  })
  
  // 4. 可用性评分（10%）
  const availabilityScore = node.status === 'online' ? 100 : 0
  reasons.push({
    factor: '可用性',
    score: availabilityScore,
    weight: w.availability,
    value: node.status === 'online' ? '在线' : '离线',
    reason: node.status === 'online' ? '节点在线' : '节点离线'
  })
  
  // 计算总分
  const totalScore = Math.round(
    latencyScore * w.latency +
    stabilityScore * w.stability +
    distanceScore * w.distance +
    availabilityScore * w.availability
  )
  
  return {
    nodeId: node.id,
    nodeName: node.name,
    totalScore,
    reasons,
    distance: Math.round(distance),
    latency: node.latency,
    stability: stabilityScore,
    status: node.status
  }
}

/**
 * 计算延迟评分
 * @param {number} latency - 延迟时间
 * @returns {number} - 评分（0-100）
 */
function calculateLatencyScore(latency) {
  if (latency === 0) return 0
  if (latency < 30) return 100
  if (latency < 50) return 95
  if (latency < 100) return 85
  if (latency < 150) return 70
  if (latency < 200) return 50
  if (latency < 300) return 30
  return 10
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
  
  const mean = latencies.reduce((sum, val) => sum + val, 0) / latencies.length
  const variance = latencies.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / latencies.length
  const stdDev = Math.sqrt(variance)
  
  if (stdDev < 10) return 100
  if (stdDev < 20) return 90
  if (stdDev < 30) return 80
  if (stdDev < 50) return 60
  if (stdDev < 80) return 40
  return 20
}

/**
 * 计算距离评分
 * @param {number} distance - 距离（千米）
 * @returns {number} - 评分（0-100）
 */
function calculateDistanceScore(distance) {
  if (distance < 500) return 100
  if (distance < 1000) return 90
  if (distance < 2000) return 70
  if (distance < 5000) return 50
  if (distance < 10000) return 30
  return 10
}

/**
 * 推荐最优节点
 * @param {Array} nodes - 节点数组
 * @param {Object} userLocation - 用户位置
 * @param {Object} options - 选项
 * @returns {Object} - 推荐结果
 */
export function recommendBestNode(nodes, userLocation, options = {}) {
  const { topN = 3, weights = {} } = options
  
  // 计算所有节点的推荐得分
  const recommendations = nodes
    .filter(node => node.status === 'online') // 只推荐在线节点
    .map(node => calculateRecommendationScore(node, userLocation, weights))
    .sort((a, b) => b.totalScore - a.totalScore) // 按得分降序排序
    .slice(0, topN) // 取前 N 个
  
  // 生成推荐理由
  const topRecommendation = recommendations[0]
  let recommendationReason = ''
  
  if (topRecommendation) {
    const bestFactor = topRecommendation.reasons
      .sort((a, b) => b.score * b.weight - a.score * a.weight)[0]
    
    recommendationReason = `推荐 ${topRecommendation.nodeName}，因为它${bestFactor.reason}（${bestFactor.value}）`
  }
  
  return {
    recommendations,
    topRecommendation: topRecommendation || null,
    recommendationReason,
    userLocation
  }
}

/**
 * 基于地区推荐节点
 * @param {Array} nodes - 节点数组
 * @param {string} region - 地区
 * @returns {Object} - 推荐结果
 */
export function recommendByRegion(nodes, region) {
  const regionNodes = nodes.filter(node => node.region === region)
  
  if (regionNodes.length === 0) {
    return {
      recommendations: [],
      topRecommendation: null,
      recommendationReason: `没有找到 ${region} 地区的节点`
    }
  }
  
  // 按延迟和稳定性排序
  const sortedNodes = regionNodes
    .map(node => ({
      ...node,
      healthScore: calculateHealthScore(node, getSpeedTestHistory(node.id, 20))
    }))
    .sort((a, b) => b.healthScore - a.healthScore)
  
  const topNode = sortedNodes[0]
  
  return {
    recommendations: sortedNodes.slice(0, 3),
    topRecommendation: topNode,
    recommendationReason: `${region} 地区推荐 ${topNode.name}，健康度评分 ${topNode.healthScore}分`
  }
}