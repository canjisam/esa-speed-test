<template>
  <div class="home">
    <div class="header">
      <h1>全球边缘节点实时测速面板</h1>
      <div class="header-actions">
        <el-button :icon="Bell" @click="openAlertPanel">
          告警通知
          <el-badge v-if="alertCount > 0" :value="alertCount" class="alert-badge" />
        </el-button>
        <el-button :icon="Document" @click="openReportPanel">测速报告</el-button>
        <el-button type="primary" :icon="Setting" @click="openConfig">告警配置</el-button>
      </div>
    </div>
    <div class="content">
      <div class="sidebar-left">
        <NodeList 
          :nodes="nodesStore.allNodes" 
          :selected-node="nodesStore.selectedNode"
          @node-select="handleNodeSelect"
        />
        <RecommendationPanel/>
      </div>
      <div class="center-content">
        <MapContainer ref="mapContainerRef" />
      </div>
      <div class="sidebar-right">
        <SpeedTestControl 
          :refresh-interval="refreshInterval"
          @test-start="handleTestStart"
          @test-complete="handleTestComplete"
          @test-progress="handleTestProgress"
          @interval-change="handleIntervalChange"
        />
        <LatencyChart 
          :node-id="selectedChartNodeId"
          @node-change="handleChartNodeChange"
        />
      </div>
    </div>
    
    <!-- 对话框 -->
    <AlertConfig ref="alertConfigRef" />
    <el-dialog
      v-model="alertDialogVisible"
      title="告警通知"
      width="600px"
    >
      <AlertPanel ref="alertPanelRef" />
    </el-dialog>
    <el-dialog
      v-model="reportDialogVisible"
      title="测速报告"
      width="800px"
    >
      <ReportPanel />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Setting, Bell, Document } from '@element-plus/icons-vue'
import MapContainer from '../components/MapContainer.vue'
import NodeList from '../components/NodeList.vue'
import SpeedTestControl from '../components/SpeedTestControl.vue'
import LatencyChart from '../components/LatencyChart.vue'
import AlertPanel from '../components/AlertPanel.vue'
import AlertConfig from '../components/AlertConfig.vue'
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
const alertDialogVisible = ref(false)
const reportDialogVisible = ref(false)
const alertCount = computed(() => alertPanelRef.value?.alerts?.length || 0)

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

// 打开告警通知面板
const openAlertPanel = () => {
  alertDialogVisible.value = true
}

// 打开测速报告面板
const openReportPanel = () => {
  reportDialogVisible.value = true
}
</script>

<style scoped>
.home {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 12px;
  box-sizing: border-box;
  background: #f0f2f5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 4px;
}

h1 {
  margin: 0;
  font-size: 18px;
  color: #333;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.header-actions {
  display: flex;
  gap: 6px;
}

.alert-badge {
  margin-left: 4px;
}

.content {
  flex: 1;
  display: flex;
  gap: 12px;
  min-height: 0;
}

.sidebar-left {
  width: 30%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
}

.center-content {
  width: 40%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.sidebar-right {
  width: 30%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
}

/* 响应式布局 */
@media screen and (max-width: 1440px) {
  .home {
    padding: 10px;
  }
  
  .content {
    gap: 10px;
  }
  
  .sidebar-left,
  .sidebar-right {
    gap: 8px;
  }
}

@media screen and (max-width: 1200px) {
  .sidebar-left {
    width: 32%;
  }
  
  .center-content {
    width: 36%;
  }
  
  .sidebar-right {
    width: 32%;
  }
}

@media screen and (max-width: 992px) {
  .content {
    flex-direction: column;
  }
  
  .sidebar-left,
  .center-content,
  .sidebar-right {
    width: 100%;
    height: auto;
  }
  
  .sidebar-left {
    height: 45%;
  }
  
  .center-content {
    height: 25%;
    min-height: 300px;
  }
  
  .sidebar-right {
    height: 30%;
  }
}

@media screen and (max-width: 768px) {
  .home {
    padding: 8px;
  }
  
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 10px;
  }
  
  h1 {
    font-size: 16px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .sidebar-left {
    height: 40%;
  }
  
  .center-content {
    height: 30%;
    min-height: 250px;
  }
  
  .sidebar-right {
    height: 30%;
  }
}
</style>