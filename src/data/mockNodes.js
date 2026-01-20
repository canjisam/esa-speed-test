/**
 * 模拟节点数据
 * 使用真实的阿里云节点配置
 */

import { ALIYUN_NODES } from '../config/nodesConfig.js'

// 初始化节点数据（添加测速相关字段）
export const mockNodes = ALIYUN_NODES.map(node => ({
  ...node,
  latency: 0,
  status: 'unknown',
  load: 0,
  lastTestTime: null
}))

// 导出原始节点配置
export { ALIYUN_NODES }