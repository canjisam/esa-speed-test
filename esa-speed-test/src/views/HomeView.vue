<template>
  <div class="home">
    <div class="header">
      <h1>全球边缘节点实时测速面板</h1>
    </div>
    <div class="content">
      <div class="sidebar-left">
        <SpeedTestControl 
          :refresh-interval="refreshInterval"
          @test-start="handleTestStart"
          @test-complete="handleTestComplete"
          @test-progress="handleTestProgress"
          @interval-change="handleIntervalChange"
        />
        <NodeList 
          :nodes="nodesStore.allNodes" 
          :selected-node="nodesStore.selectedNode"
          @node-select="handleNodeSelect"
        />
      </div>
      <div class="main-content">
        <MapContainer ref="mapContainerRef" />
        <LatencyChart 
          :node-id="selectedChartNodeId"
          @node-change="handleChartNodeChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import MapContainer from '../components/MapContainer.vue'
import NodeList from '../components/NodeList.vue'
import SpeedTestControl from '../components/SpeedTestControl.vue'
import LatencyChart from '../components/LatencyChart.vue'
import { useNodesStore } from '../stores/nodes'

const nodesStore = useNodesStore()
const mapContainerRef = ref(null)
const refreshInterval = ref(10)
const selectedChartNodeId = ref(null)

// 监听选中的节点，同步到图表
watch(() => nodesStore.selectedNode, (node) => {
  if (node) {
    selectedChartNodeId.value = node.id
  }
})

// 处理节点选择
const handleNodeSelect = (node) => {
  nodesStore.setSelectedNode(node)
  // 通知地图组件定位到选中的节点
  if (mapContainerRef.value && mapContainerRef.value.focusOnNode) {
    mapContainerRef.value.focusOnNode(node)
  }
}

// 处理图表节点变化
const handleChartNodeChange = (nodeId) => {
  selectedChartNodeId.value = nodeId
  const node = nodesStore.getNode(nodeId)
  if (node) {
    nodesStore.setSelectedNode(node)
    if (mapContainerRef.value && mapContainerRef.value.focusOnNode) {
      mapContainerRef.value.focusOnNode(node)
    }
  }
}

// 处理测速开始
const handleTestStart = () => {
  console.log('测速开始')
}

// 处理测速完成
const handleTestComplete = (result) => {
  console.log('测速完成:', result)
  ElMessage.success('测速完成')
}

// 处理测速进度
const handleTestProgress = (progress) => {
  console.log('测速进度:', progress)
}

// 处理间隔变更
const handleIntervalChange = (newInterval) => {
  refreshInterval.value = newInterval
}
</script>

<style scoped>
.home {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-sizing: border-box;
  background: #f0f2f5;
}

.header {
  margin-bottom: 20px;
}

h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
  font-weight: 600;
}

.content {
  flex: 1;
  display: flex;
  gap: 20px;
  min-height: 0;
}

.sidebar-left {
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 0;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 0;
}
</style>