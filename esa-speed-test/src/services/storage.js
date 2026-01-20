/**
 * 历史数据存储服务
 * 使用 LocalStorage 存储测速历史数据
 */

// 存储键
const STORAGE_KEYS = {
  SPEED_TEST_HISTORY: 'esa-speed-test-history',
  NODE_DATA: 'esa-node-data',
  USER_PREFERENCES: 'esa-user-preferences'
}

// 数据保留天数
const RETENTION_DAYS = 7

/**
 * 保存测速历史记录
 * @param {string} nodeId - 节点ID
 * @param {Object} record - 测速记录
 */
export function saveSpeedTestRecord(nodeId, record) {
  try {
    const key = `${STORAGE_KEYS.SPEED_TEST_HISTORY}-${nodeId}`
    const history = getSpeedTestHistory(nodeId)
    
    history.push({
      ...record,
      timestamp: Date.now()
    })
    
    // 清理过期数据（保留最近7天）
    const cutoffTime = Date.now() - (RETENTION_DAYS * 24 * 60 * 60 * 1000)
    const validHistory = history.filter(item => item.timestamp > cutoffTime)
    
    // 限制最多保存1000条记录
    const limitedHistory = validHistory.slice(-1000)
    
    localStorage.setItem(key, JSON.stringify(limitedHistory))
    
    return true
  } catch (error) {
    console.error('保存测速历史失败:', error)
    return false
  }
}

/**
 * 获取测速历史记录
 * @param {string} nodeId - 节点ID
 * @param {number} limit - 限制数量
 * @returns {Array} - 历史记录
 */
export function getSpeedTestHistory(nodeId, limit = 100) {
  try {
    const key = `${STORAGE_KEYS.SPEED_TEST_HISTORY}-${nodeId}`
    const data = localStorage.getItem(key)
    
    if (!data) return []
    
    const history = JSON.parse(data)
    return limit > 0 ? history.slice(-limit) : history
  } catch (error) {
    console.error('获取测速历史失败:', error)
    return []
  }
}

/**
 * 清空指定节点的测速历史
 * @param {string} nodeId - 节点ID
 */
export function clearSpeedTestHistory(nodeId) {
  try {
    const key = `${STORAGE_KEYS.SPEED_TEST_HISTORY}-${nodeId}`
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error('清空测速历史失败:', error)
    return false
  }
}

/**
 * 清空所有测速历史
 */
export function clearAllSpeedTestHistory() {
  try {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(STORAGE_KEYS.SPEED_TEST_HISTORY)) {
        localStorage.removeItem(key)
      }
    })
    return true
  } catch (error) {
    console.error('清空所有测速历史失败:', error)
    return false
  }
}

/**
 * 获取所有节点的测速历史统计
 * @returns {Object} - 统计信息
 */
export function getSpeedTestStatistics() {
  try {
    const keys = Object.keys(localStorage)
    const nodeKeys = keys.filter(key => key.startsWith(STORAGE_KEYS.SPEED_TEST_HISTORY))
    
    const stats = {
      totalNodes: nodeKeys.length,
      totalRecords: 0,
      oldestRecord: null,
      newestRecord: null,
      nodes: {}
    }
    
    nodeKeys.forEach(key => {
      const nodeId = key.replace(`${STORAGE_KEYS.SPEED_TEST_HISTORY}-`, '')
      const history = JSON.parse(localStorage.getItem(key) || '[]')
      
      if (history.length > 0) {
        const timestamps = history.map(h => h.timestamp)
        const oldest = Math.min(...timestamps)
        const newest = Math.max(...timestamps)
        
        stats.totalRecords += history.length
        stats.nodes[nodeId] = {
          count: history.length,
          oldest,
          newest
        }
        
        if (!stats.oldestRecord || oldest < stats.oldestRecord) {
          stats.oldestRecord = oldest
        }
        
        if (!stats.newestRecord || newest > stats.newestRecord) {
          stats.newestRecord = newest
        }
      }
    })
    
    return stats
  } catch (error) {
    console.error('获取测速统计失败:', error)
    return {
      totalNodes: 0,
      totalRecords: 0,
      oldestRecord: null,
      newestRecord: null,
      nodes: {}
    }
  }
}

/**
 * 保存节点数据
 * @param {Array} nodes - 节点数组
 */
export function saveNodeData(nodes) {
  try {
    localStorage.setItem(STORAGE_KEYS.NODE_DATA, JSON.stringify(nodes))
    return true
  } catch (error) {
    console.error('保存节点数据失败:', error)
    return false
  }
}

/**
 * 获取节点数据
 * @returns {Array} - 节点数组
 */
export function getNodeData() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.NODE_DATA)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('获取节点数据失败:', error)
    return []
  }
}

/**
 * 保存用户偏好设置
 * @param {Object} preferences - 偏好设置
 */
export function saveUserPreferences(preferences) {
  try {
    const current = getUserPreferences()
    const updated = { ...current, ...preferences }
    localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updated))
    return true
  } catch (error) {
    console.error('保存用户偏好失败:', error)
    return false
  }
}

/**
 * 获取用户偏好设置
 * @returns {Object} - 偏好设置
 */
export function getUserPreferences() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES)
    return data ? JSON.parse(data) : {}
  } catch (error) {
    console.error('获取用户偏好失败:', error)
    return {}
  }
}

/**
 * 清理过期数据
 */
export function cleanupExpiredData() {
  try {
    const cutoffTime = Date.now() - (RETENTION_DAYS * 24 * 60 * 60 * 1000)
    
    // 清理测速历史
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(STORAGE_KEYS.SPEED_TEST_HISTORY)) {
        const history = JSON.parse(localStorage.getItem(key) || '[]')
        const validHistory = history.filter(item => item.timestamp > cutoffTime)
        
        if (validHistory.length === 0) {
          localStorage.removeItem(key)
        } else {
          localStorage.setItem(key, JSON.stringify(validHistory))
        }
      }
    })
    
    return true
  } catch (error) {
    console.error('清理过期数据失败:', error)
    return false
  }
}

/**
 * 导出数据
 * @param {string} type - 数据类型：all, history, nodes, preferences
 * @returns {string} - JSON 字符串
 */
export function exportData(type = 'all') {
  try {
    const data = {}
    
    if (type === 'all' || type === 'history') {
      data.history = {}
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(STORAGE_KEYS.SPEED_TEST_HISTORY)) {
          const nodeId = key.replace(`${STORAGE_KEYS.SPEED_TEST_HISTORY}-`, '')
          data.history[nodeId] = JSON.parse(localStorage.getItem(key))
        }
      })
    }
    
    if (type === 'all' || type === 'nodes') {
      data.nodes = getNodeData()
    }
    
    if (type === 'all' || type === 'preferences') {
      data.preferences = getUserPreferences()
    }
    
    data.exportTime = Date.now()
    data.version = '1.0'
    
    return JSON.stringify(data, null, 2)
  } catch (error) {
    console.error('导出数据失败:', error)
    return null
  }
}

/**
 * 导入数据
 * @param {string} jsonData - JSON 字符串
 * @returns {boolean} - 是否成功
 */
export function importData(jsonData) {
  try {
    const data = JSON.parse(jsonData)
    
    if (data.history) {
      Object.entries(data.history).forEach(([nodeId, history]) => {
        const key = `${STORAGE_KEYS.SPEED_TEST_HISTORY}-${nodeId}`
        localStorage.setItem(key, JSON.stringify(history))
      })
    }
    
    if (data.nodes) {
      saveNodeData(data.nodes)
    }
    
    if (data.preferences) {
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(data.preferences))
    }
    
    return true
  } catch (error) {
    console.error('导入数据失败:', error)
    return false
  }
}

/**
 * 获取存储使用情况
 * @returns {Object} - 存储信息
 */
export function getStorageUsage() {
  try {
    let totalSize = 0
    const keys = Object.keys(localStorage)
    
    keys.forEach(key => {
      const value = localStorage.getItem(key)
      totalSize += value.length
    })
    
    // LocalStorage 限制通常为 5MB
    const maxSize = 5 * 1024 * 1024
    const usagePercent = (totalSize / maxSize * 100).toFixed(2)
    
    return {
      totalSize,
      maxSize,
      usagePercent,
      keys: keys.length,
      available: maxSize - totalSize
    }
  } catch (error) {
    console.error('获取存储使用情况失败:', error)
    return {
      totalSize: 0,
      maxSize: 5 * 1024 * 1024,
      usagePercent: '0.00',
      keys: 0,
      available: 5 * 1024 * 1024
    }
  }
}

/**
 * 清空所有数据
 */
export function clearAllData() {
  try {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('esa-')) {
        localStorage.removeItem(key)
      }
    })
    return true
  } catch (error) {
    console.error('清空所有数据失败:', error)
    return false
  }
}