import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNodesStore = defineStore('nodes', () => {
  // 节点列表
  const nodes = ref([])

  // 当前选中的节点
  const selectedNode = ref(null)

  // 测速历史数据
  const speedTestHistory = ref([])

  // 获取所有节点
  const allNodes = computed(() => nodes.value)

  // 获取在线节点
  const onlineNodes = computed(() => 
    nodes.value.filter(node => node.status === 'online')
  )

  // 获取离线节点
  const offlineNodes = computed(() => 
    nodes.value.filter(node => node.status === 'offline')
  )

  // 获取拥堵节点
  const congestedNodes = computed(() => 
    nodes.value.filter(node => node.status === 'congested')
  )

  // 设置节点列表
  function setNodes(newNodes) {
    nodes.value = newNodes
  }

  // 获取单个节点
  function getNode(nodeId) {
    return nodes.value.find(node => node.id === nodeId)
  }

  // 添加新节点
  function addNode(nodeData) {
    const newNode = {
      id: nodeData.id || `node-${Date.now()}`,
      name: nodeData.name,
      region: nodeData.region,
      country: nodeData.country,
      lat: nodeData.lat,
      lng: nodeData.lng,
      status: nodeData.status || 'online',
      latency: nodeData.latency || 0,
      load: nodeData.load || 0,
      ...nodeData
    }
    nodes.value.push(newNode)
    return newNode
  }

  // 删除节点
  function deleteNode(nodeId) {
    const index = nodes.value.findIndex(node => node.id === nodeId)
    if (index !== -1) {
      nodes.value.splice(index, 1)
      // 如果删除的是当前选中的节点，清空选中状态
      if (selectedNode.value?.id === nodeId) {
        selectedNode.value = null
      }
      return true
    }
    return false
  }

  // 更新节点状态
  function updateNode(nodeId, updates) {
    const index = nodes.value.findIndex(node => node.id === nodeId)
    if (index !== -1) {
      nodes.value[index] = { ...nodes.value[index], ...updates }
      // 如果更新的是当前选中的节点，同步更新选中状态
      if (selectedNode.value?.id === nodeId) {
        selectedNode.value = { ...selectedNode.value, ...updates }
      }
      return nodes.value[index]
    }
    return null
  }

  // 设置选中节点
  function setSelectedNode(node) {
    selectedNode.value = node
  }

  // 添加测速历史记录
  function addSpeedTestRecord(record) {
    speedTestHistory.value.push({
      ...record,
      timestamp: Date.now()
    })
    
    // 只保留最近 100 条记录
    if (speedTestHistory.value.length > 100) {
      speedTestHistory.value.shift()
    }
  }

  // 清空历史记录
  function clearHistory() {
    speedTestHistory.value = []
  }

  return {
    nodes,
    selectedNode,
    speedTestHistory,
    allNodes,
    onlineNodes,
    offlineNodes,
    congestedNodes,
    setNodes,
    getNode,
    addNode,
    deleteNode,
    updateNode,
    setSelectedNode,
    addSpeedTestRecord,
    clearHistory
  }
})