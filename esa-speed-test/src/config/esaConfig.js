/**
 * ESA配置管理
 * 从环境变量读取配置，确保敏感信息不泄露到代码中
 */

// ESA节点列表（示例，可根据实际情况修改）
export const ESA_NODES = [
  {
    id: 'esa-cn-hangzhou',
    name: 'ESA 杭州',
    region: '亚太',
    country: '中国',
    city: '杭州',
    lat: 30.25,
    lng: 120.17,
    url: 'https://esa-cn-hangzhou.example.com/test'
  },
  {
    id: 'esa-cn-shanghai',
    name: 'ESA 上海',
    region: '亚太',
    country: '中国',
    city: '上海',
    lat: 31.23,
    lng: 121.47,
    url: 'https://esa-cn-shanghai.example.com/test'
  },
  {
    id: 'esa-cn-beijing',
    name: 'ESA 北京',
    region: '亚太',
    country: '中国',
    city: '北京',
    lat: 39.90,
    lng: 116.40,
    url: 'https://esa-cn-beijing.example.com/test'
  },
  {
    id: 'esa-hk',
    name: 'ESA 香港',
    region: '亚太',
    country: '中国',
    city: '香港',
    lat: 22.28,
    lng: 114.17,
    url: 'https://esa-hk.example.com/test'
  },
  {
    id: 'sea-singapore',
    name: 'ESA 新加坡',
    region: '亚太',
    country: '新加坡',
    city: '新加坡',
    lat: 1.35,
    lng: 103.81,
    url: 'https://sea-singapore.example.com/test'
  },
  {
    id: 'sea-tokyo',
    name: 'ESA 东京',
    region: '亚太',
    country: '日本',
    city: '东京',
    lat: 35.68,
    lng: 139.76,
    url: 'https://sea-tokyo.example.com/test'
  },
  {
    id: 'na-us-west',
    name: 'ESA 美西',
    region: '北美',
    country: '美国',
    city: '硅谷',
    lat: 37.38,
    lng: -122.08,
    url: 'https://na-us-west.example.com/test'
  },
  {
    id: 'na-us-east',
    name: 'ESA 美东',
    region: '北美',
    country: '美国',
    city: '弗吉尼亚',
    lat: 38.90,
    lng: -77.02,
    url: 'https://na-us-east.example.com/test'
  },
  {
    id: 'eu-frankfurt',
    name: 'ESA 法兰克福',
    region: '欧洲',
    country: '德国',
    city: '法兰克福',
    lat: 50.11,
    lng: 8.68,
    url: 'https://eu-frankfurt.example.com/test'
  },
  {
    id: 'eu-london',
    name: 'ESA 伦敦',
    region: '欧洲',
    country: '英国',
    city: '伦敦',
    lat: 51.50,
    lng: -0.12,
    url: 'https://eu-london.example.com/test'
  }
]

// ESA API配置
export const ESA_API_CONFIG = {
  // 阿里云ESA API端点
  endpoint: 'https://esa.cn-hangzhou.aliyuncs.com',
  
  // API版本
  apiVersion: '2024-01-01',
  
  // 测速超时时间（毫秒）
  timeout: 5000,
  
  // 测速次数
  measureCount: 3,
  
  // 最大重试次数
  maxRetries: 2,
  
  // 重试间隔（毫秒）
  retryDelay: 1000,
  
  // 并发限制
  maxConcurrent: 5
}

/**
 * 获取环境变量配置
 * @returns {Object} 配置对象
 */
export function getESAConfig() {
  return {
    appId: import.meta.env.VITE_ESA_APP_ID || '',
    accessKeyId: import.meta.env.VITE_ESA_ACCESS_KEY_ID || '',
    accessKeySecret: import.meta.env.VITE_ESA_ACCESS_KEY_SECRET || '',
    testUrl: import.meta.env.VITE_ESA_TEST_URL || '',
    timeout: parseInt(import.meta.env.VITE_ESA_TEST_TIMEOUT) || ESA_API_CONFIG.timeout,
    measureCount: parseInt(import.meta.env.VITE_ESA_TEST_COUNT) || ESA_API_CONFIG.measureCount
  }
}

/**
 * 验证配置是否完整
 * @param {Object} config - 配置对象
 * @returns {boolean} 是否有效
 */
export function validateESAConfig(config) {
  return !!(config.appId && config.accessKeyId && config.accessKeySecret)
}

/**
 * 获取节点URL
 * @param {string} nodeId - 节点ID
 * @returns {string|null} 节点URL
 */
export function getNodeUrl(nodeId) {
  const node = ESA_NODES.find(n => n.id === nodeId)
  return node ? node.url : null
}

/**
 * 获取所有节点
 * @returns {Array} 节点列表
 */
export function getAllNodes() {
  return ESA_NODES
}

/**
 * 根据地区获取节点
 * @param {string} region - 地区名称
 * @returns {Array} 节点列表
 */
export function getNodesByRegion(region) {
  return ESA_NODES.filter(n => n.region === region)
}