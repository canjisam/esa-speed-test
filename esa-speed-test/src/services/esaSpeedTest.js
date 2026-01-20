/**
 * ESA测速服务
 * 封装ESA测速相关的高级功能
 */

import { esaClient } from './esaClient.js'
import { getESAConfig, validateESAConfig, getAllNodes } from '../config/esaConfig.js'

/**
 * ESA测速服务类
 */
class ESASpeedTestService {
  constructor() {
    this.config = getESAConfig()
    this.isInitialized = false
  }
  
  /**
   * 初始化服务
   * @param {Object} config - 配置对象
   * @returns {boolean} 是否初始化成功
   */
  initialize(config = {}) {
    this.config = { ...this.config, ...config }
    this.isInitialized = validateESAConfig(this.config)
    
    if (this.isInitialized) {
      esaClient.updateConfig(this.config)
      console.log('ESA测速服务初始化成功')
    } else {
      console.warn('ESA测速服务初始化失败：配置不完整')
    }
    
    return this.isInitialized
  }
  
  /**
   * 检查服务是否可用
   * @returns {boolean}
   */
  isAvailable() {
    return this.isInitialized
  }
  
  /**
   * 获取所有ESA节点
   * @returns {Array}
   */
  getNodes() {
    return getAllNodes()
  }
  
  /**
   * 测速指定节点
   * @param {string} nodeId - 节点ID
   * @returns {Promise<Object>}
   */
  async testNode(nodeId) {
    if (!this.isInitialized) {
      throw new Error('ESA测速服务未初始化')
    }
    
    return await esaClient.testNode(nodeId)
  }
  
  /**
   * 批量测速
   * @param {Array<string>} nodeIds - 节点ID数组
   * @param {Object} options - 选项
   * @param {Function} options.onProgress - 进度回调
   * @param {number} options.concurrency - 并发数
   * @returns {Promise<Array>}
   */
  async batchTest(nodeIds, options = {}) {
    if (!this.isInitialized) {
      throw new Error('ESA测速服务未初始化')
    }
    
    const { onProgress, concurrency } = options
    return await esaClient.concurrentBatchTest(nodeIds, concurrency, onProgress)
  }
  
  /**
   * 测速所有节点
   * @param {Object} options - 选项
   * @returns {Promise<Array>}
   */
  async testAllNodes(options = {}) {
    const nodes = this.getNodes()
    const nodeIds = nodes.map(n => n.id)
    return await this.batchTest(nodeIds, options)
  }
  
  /**
   * 根据地区测速
   * @param {string} region - 地区名称
   * @param {Object} options - 选项
   * @returns {Promise<Array>}
   */
  async testByRegion(region, options = {}) {
    const nodes = getAllNodes().filter(n => n.region === region)
    const nodeIds = nodes.map(n => n.id)
    return await this.batchTest(nodeIds, options)
  }
  
  /**
   * 获取测速统计
   * @param {Array} results - 测速结果数组
   * @returns {Object}
   */
  getStatistics(results) {
    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)
    
    if (successful.length === 0) {
      return {
        total: results.length,
        successful: 0,
        failed: results.length,
        averageLatency: 0,
        minLatency: 0,
        maxLatency: 0,
        successRate: 0
      }
    }
    
    const latencies = successful.map(r => r.latency)
    const averageLatency = Math.round(
      latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length
    )
    const minLatency = Math.min(...latencies)
    const maxLatency = Math.max(...latencies)
    
    return {
      total: results.length,
      successful: successful.length,
      failed: failed.length,
      averageLatency,
      minLatency,
      maxLatency,
      successRate: (successful.length / results.length * 100).toFixed(2)
    }
  }
  
  /**
   * 排序节点（按延迟）
   * @param {Array} results - 测速结果数组
   * @param {string} order - 排序顺序 'asc' | 'desc'
   * @returns {Array}
   */
  sortNodes(results, order = 'asc') {
    return results
      .filter(r => r.success)
      .sort((a, b) => {
        return order === 'asc' ? a.latency - b.latency : b.latency - a.latency
      })
  }
  
  /**
   * 获取最佳节点
   * @param {Array} results - 测速结果数组
   * @param {number} topN - 返回前N个
   * @returns {Array}
   */
  getBestNodes(results, topN = 3) {
    return this.sortNodes(results, 'asc').slice(0, topN)
  }
}

// 导出单例
export const esaSpeedTestService = new ESASpeedTestService()

// 导出类供外部使用
export { ESASpeedTestService }