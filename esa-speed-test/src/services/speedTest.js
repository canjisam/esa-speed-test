/**
 * 测速服务
 * 使用 Fetch API 测量节点延迟
 */

// 测速配置
const CONFIG = {
  // 测量次数
  measureCount: 3,
  // 超时时间（毫秒）
  timeout: 5000,
  // 最大重试次数
  maxRetries: 2,
  // 重试间隔（毫秒）
  retryDelay: 1000,
  // 并发限制
  maxConcurrent: 5
}

// 测速队列
const queue = []
let isProcessing = false
let concurrentCount = 0

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
      mode: 'no-cors', // 允许跨域请求
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
  
  // 如果所有测量都失败，返回错误
  if (results.length === 0) {
    return {
      latency: 0,
      success: false,
      error: '所有测速尝试均失败'
    }
  }
  
  // 计算平均值（去掉最高和最低值）
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
    
    // 如果不是最后一次尝试，等待后重试
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
 * 处理测速队列
 */
async function processQueue() {
  if (isProcessing || queue.length === 0 || concurrentCount >= CONFIG.maxConcurrent) {
    return
  }
  
  isProcessing = true
  
  while (queue.length > 0 && concurrentCount < CONFIG.maxConcurrent) {
    const task = queue.shift()
    concurrentCount++
    
    // 异步执行任务
    task()
      .then(() => {
        concurrentCount--
      })
      .catch((error) => {
        console.error('测速任务执行失败:', error)
        concurrentCount--
      })
  }
  
  isProcessing = false
}

/**
 * 添加测速任务到队列
 * @param {Object} node - 节点对象
 * @param {Function} onProgress - 进度回调
 * @param {Function} onComplete - 完成回调
 */
export function addSpeedTestTask(node, onProgress, onComplete) {
  const task = async () => {
    try {
      onProgress?.({ nodeId: node.id, status: 'measuring' })
      
      // 使用节点的经纬度生成一个用于测速的 URL
      // 注意：这里使用一个公开的 CDN 节点作为示例
      // 实际应用中应该使用真实的 ESA 节点地址
      const testUrl = `https://www.google.com/generate_204`
      
      const result = await measureWithRetry(testUrl)
      
      onComplete?.({
        nodeId: node.id,
        latency: result.latency,
        success: result.success,
        error: result.error,
        timestamp: Date.now()
      })
    } catch (error) {
      onComplete?.({
        nodeId: node.id,
        latency: 0,
        success: false,
        error: error.message,
        timestamp: Date.now()
      })
    }
  }
  
  queue.push(task)
  processQueue()
}

/**
 * 批量测速
 * @param {Array} nodes - 节点数组
 * @param {Function} onProgress - 进度回调
 * @param {Function} onComplete - 完成回调
 */
export function batchSpeedTest(nodes, onProgress, onComplete) {
  let completed = 0
  const total = nodes.length
  const results = []
  
  nodes.forEach((node, index) => {
    addSpeedTestTask(
      node,
      (progress) => {
        onProgress?.({
          ...progress,
          progress: completed / total,
          total,
          completed
        })
      },
      (result) => {
        results[index] = result
        completed++
        
        onProgress?.({
          nodeId: node.id,
          status: 'completed',
          progress: completed / total,
          total,
          completed
        })
        
        // 所有任务完成
        if (completed === total) {
          onComplete?.(results)
        }
      }
    )
  })
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
  // 基于节点的基础延迟添加随机波动
  const baseLatency = node.latency || 100
  const variance = Math.random() * 40 - 20 // ±20ms 波动
  const latency = Math.max(10, Math.round(baseLatency + variance))
  
  // 模拟偶尔的测速失败
  const success = Math.random() > 0.05 // 95% 成功率
  
  return {
    nodeId: node.id,
    latency: success ? latency : 0,
    success,
    error: success ? undefined : '连接超时',
    timestamp: Date.now()
  }
}