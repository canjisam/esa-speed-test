/**
 * ESA测速客户端
 * 实现阿里云ESA节点的测速功能
 */

import { getESAConfig, getNodeUrl, ESA_API_CONFIG } from '../config/esaConfig.js'

/**
 * 阿里云API签名工具
 */
class AliyunSignature {
  /**
   * 生成HMAC-SHA1签名
   * @param {string} key - 密钥
   * @param {string} data - 待签名数据
   * @returns {Promise<string>} 签名结果
   */
  static async hmacSha1(key, data) {
    const encoder = new TextEncoder()
    const keyData = encoder.encode(key)
    const dataBytes = encoder.encode(data)
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    )
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBytes)
    return btoa(String.fromCharCode(...new Uint8Array(signature)))
  }
  
  /**
   * 生成签名字符串
   * @param {string} method - HTTP方法
   * @param {string} path - 请求路径
   * @param {Object} params - 查询参数
   * @param {Object} headers - 请求头
   * @returns {string} 签名字符串
   */
  static buildStringToSign(method, path, params, headers) {
    const canonicalizedQueryString = Object.keys(params)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&')
    
    const canonicalizedHeaders = Object.keys(headers)
      .filter(key => key.toLowerCase().startsWith('x-acs-'))
      .sort()
      .map(key => `${key.toLowerCase()}:${headers[key].trim()}`)
      .join('\n')
    
    return `${method}\n${path}\n${canonicalizedQueryString}\n${canonicalizedHeaders}`
  }
}

/**
 * ESA测速客户端类
 */
class ESASpeedTestClient {
  constructor() {
    this.config = getESAConfig()
    this.timeout = ESA_API_CONFIG.timeout
    this.measureCount = ESA_API_CONFIG.measureCount
  }
  
  /**
   * 更新配置
   * @param {Object} newConfig - 新配置
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig }
  }
  
  /**
   * 单次测速
   * @param {string} url - 测速URL
   * @returns {Promise<number>} 延迟时间（毫秒）
   */
  async measureOnce(url) {
    const startTime = performance.now()
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)
      
      // 使用HEAD请求减少数据传输
      const response = await fetch(url, {
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
        throw new Error(`测速超时（${this.timeout}ms）`)
      }
      throw error
    }
  }
  
  /**
   * 多次测速取平均值
   * @param {string} url - 测速URL
   * @returns {Promise<{latency: number, success: boolean, error?: string, details: Object}>}
   */
  async measureMultiple(url) {
    const results = []
    let errors = 0
    
    for (let i = 0; i < this.measureCount; i++) {
      try {
        const latency = await this.measureOnce(url)
        results.push(latency)
      } catch (error) {
        errors++
        console.warn(`测速失败 (${i + 1}/${this.measureCount}):`, error.message)
      }
    }
    
    // 如果所有测量都失败，返回错误
    if (results.length === 0) {
      return {
        latency: 0,
        success: false,
        error: '所有测速尝试均失败',
        details: {
          attempts: this.measureCount,
          successes: 0,
          failures: errors
        }
      }
    }
    
    // 计算统计数据
    const sortedResults = results.sort((a, b) => a - b)
    const min = sortedResults[0]
    const max = sortedResults[sortedResults.length - 1]
    const avg = Math.round(results.reduce((sum, val) => sum + val, 0) / results.length)
    
    // 去掉最高和最低值后计算平均值
    const trimmedResults = sortedResults.slice(1, -1)
    const trimmedAvg = trimmedResults.length > 0
      ? Math.round(trimmedResults.reduce((sum, val) => sum + val, 0) / trimmedResults.length)
      : avg
    
    return {
      latency: trimmedAvg,
      success: true,
      details: {
        attempts: this.measureCount,
        successes: results.length,
        failures: errors,
        min,
        max,
        avg,
        trimmedAvg
      }
    }
  }
  
  /**
   * 带重试的测速
   * @param {string} url - 测速URL
   * @param {number} maxRetries - 最大重试次数
   * @returns {Promise<{latency: number, success: boolean, error?: string}>}
   */
  async measureWithRetry(url, maxRetries = ESA_API_CONFIG.maxRetries) {
    let lastError = null
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.measureMultiple(url)
        if (result.success) {
          return result
        }
        lastError = result.error
      } catch (error) {
        lastError = error.message
      }
      
      // 如果不是最后一次尝试，等待后重试
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, ESA_API_CONFIG.retryDelay))
      }
    }
    
    return {
      latency: 0,
      success: false,
      error: lastError || '测速失败'
    }
  }
  
  /**
   * 测速指定节点
   * @param {string} nodeId - 节点ID
   * @returns {Promise<{latency: number, success: boolean, error?: string, timestamp: number}>}
   */
  async testNode(nodeId) {
    const url = getNodeUrl(nodeId)
    
    if (!url) {
      return {
        latency: 0,
        success: false,
        error: `未找到节点: ${nodeId}`,
        timestamp: Date.now()
      }
    }
    
    const result = await this.measureWithRetry(url)
    
    return {
      ...result,
      nodeId,
      timestamp: Date.now()
    }
  }
  
  /**
   * 批量测速
   * @param {Array<string>} nodeIds - 节点ID数组
   * @param {Function} onProgress - 进度回调
   * @returns {Promise<Array>} 测速结果数组
   */
  async batchTest(nodeIds, onProgress) {
    const results = []
    const total = nodeIds.length
    
    // 顺序测速（避免并发过多）
    for (let i = 0; i < total; i++) {
      const nodeId = nodeIds[i]
      const result = await this.testNode(nodeId)
      results.push(result)
      
      // 调用进度回调
      onProgress?.({
        nodeId,
        progress: (i + 1) / total,
        completed: i + 1,
        total,
        result
      })
    }
    
    return results
  }
  
  /**
   * 并发批量测速
   * @param {Array<string>} nodeIds - 节点ID数组
   * @param {number} concurrency - 并发数
   * @param {Function} onProgress - 进度回调
   * @returns {Promise<Array>} 测速结果数组
   */
  async concurrentBatchTest(nodeIds, concurrency = ESA_API_CONFIG.maxConcurrent, onProgress) {
    const results = new Array(nodeIds.length)
    const total = nodeIds.length
    let completed = 0
    
    const testNode = async (index, nodeId) => {
      try {
        const result = await this.testNode(nodeId)
        results[index] = result
        
        completed++
        onProgress?.({
          nodeId,
          progress: completed / total,
          completed,
          total,
          result
        })
      } catch (error) {
        results[index] = {
          latency: 0,
          success: false,
          error: error.message,
          nodeId,
          timestamp: Date.now()
        }
        
        completed++
        onProgress?.({
          nodeId,
          progress: completed / total,
          completed,
          total,
          error: error.message
        })
      }
    }
    
    // 分批执行
    for (let i = 0; i < nodeIds.length; i += concurrency) {
      const batch = nodeIds.slice(i, i + concurrency)
      const batchPromises = batch.map((nodeId, batchIndex) => 
        testNode(i + batchIndex, nodeId)
      )
      await Promise.all(batchPromises)
    }
    
    return results
  }
}

// 导出单例
export const esaClient = new ESASpeedTestClient()

// 导出类供外部使用
export { ESASpeedTestClient }
