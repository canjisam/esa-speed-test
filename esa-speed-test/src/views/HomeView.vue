<template>
  <div class="home">
    <div class="header">
      <h1>全球边缘节点实时测速面板</h1>
      <div class="header-actions">
        <el-button type="primary" :icon="Setting" @click="openConfig">告警配置</el-button>
      </div>
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
        <AlertPanel ref="alertPanelRef" />
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
        <NodeComparison />
        <RecommendationPanel />
        <ReportPanel />
      </div>
    </div>
    
    <AlertConfig ref="alertConfigRef" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Setting } from '@element-plus/icons-vue'
import MapContainer from '../components/MapContainer.vue'
import NodeList from '../components/NodeList.vue'
import SpeedTestControl from '../components/SpeedTestControl.vue'
import LatencyChart from '../components/LatencyChart.vue'
import AlertPanel from '../components/AlertPanel.vue'
import AlertConfig from '../components/AlertConfig.vue'
import NodeComparison from '../components/NodeComparison.vue'
import RecommendationPanel from '../components/RecommendationPanel.vue'
import ReportPanel from '../components/ReportPanel.vue'
import { useNodesStore } from '../stores/nodes'
import { detectAlerts, detectStatusChange } from '../services/alert'
import { saveSpeedTestRecord } from '../services/storage'

const nodesStore = useNodesStore()
const mapContainerRef = ref(null)
const alertPanelRef = ref(null)
const alertConfigRef = ref(null)
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
  // 检测状态变化和告警
  if (progress.nodeId) {
    const node = nodesStore.getNode(progress.nodeId)
    if (node) {
      // 获取历史数据
      const history = nodesStore.speedTestHistory.filter(h => h.nodeId === progress.nodeId)
      
      // 检测状态变化
      const statusChanges = detectStatusChange(node)
      if (statusChanges && alertPanelRef.value) {
        statusChanges.forEach(change => {
          alertPanelRef.value.addAlert({
            type: 'status_change',
            nodeId: node.id,
            nodeName: node.name,
            severity: change.severity,
            message: `${node.name} 状态变化: ${change.from} → ${change.to}`,
            timestamp: Date.now()
          })
        })
      }
      
      // 检测告警
      const alerts = detectAlerts(node, history)
      if (alerts.length > 0 && alertPanelRef.value) {
        alerts.forEach(alert => {
          alertPanelRef.value.addAlert(alert)
        })
      }
      
      // 保存测速记录
      saveSpeedTestRecord(node.id, {
        latency: node.latency,
        status: node.status,
        load: node.load
      })
    }
  }
}

// 处理间隔变更
const handleIntervalChange = (newInterval) => {
  refreshInterval.value = newInterval
}

// 打开告警配置
const openConfig = () => {
  if (alertConfigRef.value) {
    alertConfigRef.value.open()
  }
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 10px;
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