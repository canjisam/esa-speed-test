/**
 * 测速服务
 * 使用阿里云真实节点进行测速
 */

import { getAllNodes } from '../config/nodesConfig.js'

// 测速配置
const CONFIG = {
  timeout: 5000,
  measureCount: 3,
  maxRetries: 2,
  retryDelay: 1000,
  maxConcurrent: 5
}

/**
 * 单次测速
 * @param {string} url - 测速目标 URL
 * @returns {Promise<number>} - 延迟时间（毫秒）
 */
async function measureOnce(url) {
  const startTime = performance.now()
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout)
    
    // 使用 HEAD 请求减少数据传输
    await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache',
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    const endTime = performance.now()
    return Math.round(endTime - startTime)
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`测速超时（${CONFIG.timeout}ms）`)
    }
    throw error
  }
}

/**
 * 多次测速取平均值
 * @param {string} url - 测速目标 URL
 * @returns {Promise<{latency: number, success: boolean, error?: string}>}
 */
async function measureMultiple(url) {
  const results = []
  let errors = 0
  
  for (let i = 0; i < CONFIG.measureCount; i++) {
    try {
      const latency = await measureOnce(url)
      results.push(latency)
    } catch (error) {
      errors++
      console.warn(`测速失败 (${i + 1}/${CONFIG.measureCount}):`, error.message)
    }
  }
  
  if (results.length === 0) {
    return {
      latency: 0,
      success: false,
      error: '所有测速尝试均失败'
    }
  }
  
  const sortedResults = results.sort((a, b) => a - b)
  const trimmedResults = sortedResults.slice(1, -1)
  const averageLatency = trimmedResults.length > 0
    ? Math.round(trimmedResults.reduce((sum, val) => sum + val, 0) / trimmedResults.length)
    : results[0]
  
  return {
    latency: averageLatency,
    success: true,
    attempts: CONFIG.measureCount,
    successes: results.length,
    failures: errors
  }
}

/**
 * 带重试的测速
 * @param {string} url - 测速目标 URL
 * @returns {Promise<{latency: number, success: boolean, error?: string}>}
 */
async function measureWithRetry(url) {
  let lastError = null
  
  for (let attempt = 0; attempt <= CONFIG.maxRetries; attempt++) {
    try {
      const result = await measureMultiple(url)
      if (result.success) {
        return result
      }
      lastError = result.error
    } catch (error) {
      lastError = error.message
    }
    
    if (attempt < CONFIG.maxRetries) {
      await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay))
    }
  }
  
  return {
    latency: 0,
    success: false,
    error: lastError || '测速失败'
  }
}

/**
 * 测速单个节点
 * @param {Object} node - 节点对象
 * @param {Function} onProgress - 进度回调
 * @returns {Promise<Object>} 测速结果
 */
export async function testNode(node, onProgress) {
  onProgress?.({ nodeId: node.id, status: 'measuring' })
  
  const result = await measureWithRetry(node.url)
  
  return {
    nodeId: node.id,
    latency: result.latency,
    success: result.success,
    error: result.error,
    timestamp: Date.now()
  }
}

/**
 * 批量测速
 * @param {Array} nodes - 节点数组
 * @param {Function} onProgress - 进度回调
 * @returns {Promise<Array>} 测速结果数组
 */
export async function batchSpeedTest(nodes, onProgress) {
  const results = []
  const total = nodes.length
  
  for (let i = 0; i < total; i++) {
    const node = nodes[i]
    onProgress?.({
      nodeId: node.id,
      status: 'measuring',
      progress: i / total,
      total,
      completed: i
    })
    
    const result = await testNode(node)
    results.push(result)
    
    onProgress?.({
      nodeId: node.id,
      status: 'completed',
      progress: (i + 1) / total,
      total,
      completed: i + 1
    })
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 50))
  }
  
  return results
}

/**
 * 计算节点状态
 * @param {number} latency - 延迟时间（毫秒）
 * @returns {string} - 状态：online, congested, offline
 */
export function calculateNodeStatus(latency) {
  if (latency === 0) {
    return 'offline'
  } else if (latency < 150) {
    return 'online'
  } else if (latency < 300) {
    return 'congested'
  } else {
    return 'offline'
  }
}

/**
 * 生成模拟测速数据（用于演示）
 * @param {Object} node - 节点对象
 * @returns {Object} - 测速结果
 */
export function generateMockSpeedTest(node) {
  const baseLatency = node.latency || 100
  const variance = Math.random() * 40 - 20
  const latency = Math.max(10, Math.round(baseLatency + variance))
  const success = Math.random() > 0.05
  
  return {
    nodeId: node.id,
    latency: success ? latency : 0,
    success,
    error: success ? undefined : '连接超时',
    timestamp: Date.now()
  }
}

/**
 * 获取当前配置
 * @returns {Object}
 */
export function getConfig() {
  return { ...CONFIG }
}

/**
 * 获取所有节点
 * @returns {Array}
 */
export function getAllTestNodes() {
  return getAllNodes()
}