<template>
  <div class="home">
    <div class="bg-effects">
      <div class="grid-overlay"></div>
      <div class="scanline"></div>
      <div class="glow-spots"></div>
    </div>
    <div class="header">
      <h1>
        <span class="title-icon">◈</span>
        全球边缘节点实时测速面板
        <span class="title-glow"></span>
      </h1>
      <div class="header-actions">
        <el-select
          v-model="selectedLocation"
          placeholder="选择位置"
          @change="handleLocationChange"
          style="width: 140px; margin-right: 10px;"
        >
          <el-option label="中国" value="china" />
          <el-option label="美国" value="usa" />
          <el-option label="日本" value="japan" />
          <el-option label="欧洲" value="europe" />
          <el-option label="新加坡" value="singapore" />
        </el-select>
        <el-button :icon="Bell" @click="openAlertPanel" class="header-btn">
          告警通知
          <el-badge v-if="alertCount > 0" :value="alertCount" class="alert-badge" />
        </el-button>
        <el-button :icon="Document" @click="openReportPanel" class="header-btn">测速报告</el-button>
        <el-button type="primary" :icon="Setting" @click="openConfig" class="header-btn primary">告警配置</el-button>
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
      width="900px"
    >
      <ReportPanel />
    </el-dialog>
    
    <!-- 版权信息 -->
    <div class="footer" :class="{ 'footer-collapsed': isFooterCollapsed }">
      <div class="footer-toggle" @click="toggleFooter">
        <span class="toggle-icon">{{ isFooterCollapsed ? '▲' : '▼' }}</span>
      </div>
      <div class="footer-content" v-show="!isFooterCollapsed">
        <p>© 2025 canjisam. All rights reserved.</p>
        <p class="footer-links">
          <a href="https://github.com/canjisam/esa-speed-test" target="_blank">GitHub</a>
          <span>|</span>
          <a href="https://canjisam.github.io/esa-speed-test/" target="_blank">在线演示</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
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
import { getUserLocation } from '../services/recommendation'

const nodesStore = useNodesStore()
const mapContainerRef = ref(null)
const alertPanelRef = ref(null)
const alertConfigRef = ref(null)
const refreshInterval = ref(10)
const selectedChartNodeId = ref(null)
const alertDialogVisible = ref(false)
const reportDialogVisible = ref(false)
const alertCount = computed(() => alertPanelRef.value?.alerts?.length || 0)
const isFooterCollapsed = ref(false)
const selectedLocation = ref('china')

// 预定义位置
const locations = {
  china: { lat: 35.8617, lng: 104.1954, name: '中国' },
  usa: { lat: 37.0902, lng: -95.7129, name: '美国' },
  japan: { lat: 36.2048, lng: 138.2529, name: '日本' },
  europe: { lat: 54.5260, lng: 15.2551, name: '欧洲' },
  singapore: { lat: 1.3521, lng: 103.8198, name: '新加坡' }
}

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

// 切换版权信息显示
const toggleFooter = () => {
  isFooterCollapsed.value = !isFooterCollapsed.value
}

// 处理位置变化
const handleLocationChange = (locationKey) => {
  const location = locations[locationKey]
  if (location && mapContainerRef.value && mapContainerRef.value.setUserLocation) {
    mapContainerRef.value.setUserLocation(location.lat, location.lng, location.name)
    ElMessage.success(`已切换到 ${location.name}`)
  }
}

// 组件挂载时设置初始位置
onMounted(async () => {
  try {
    // 使用 IP 定位获取用户真实位置
    const userLoc = await getUserLocation()
    
    if (userLoc && mapContainerRef.value && mapContainerRef.value.setUserLocation) {
      const locationName = userLoc.city ? `${userLoc.city}, ${userLoc.country}` : userLoc.country || '我的位置'
      mapContainerRef.value.setUserLocation(userLoc.latitude, userLoc.longitude, locationName)
      
      // 更新选择器的值（如果匹配预设位置）
      const matchedLocation = Object.entries(locations).find(([key, loc]) => 
        Math.abs(loc.lat - userLoc.latitude) < 5 && Math.abs(loc.lng - userLoc.longitude) < 5
      )
      if (matchedLocation) {
        selectedLocation.value = matchedLocation[0]
      }
      
      console.log('已定位到:', locationName, userLoc)
    }
  } catch (error) {
    console.error('获取用户位置失败，使用默认位置:', error)
    // 失败时使用默认位置
    const initialLocation = locations[selectedLocation.value]
    if (initialLocation && mapContainerRef.value && mapContainerRef.value.setUserLocation) {
      mapContainerRef.value.setUserLocation(initialLocation.lat, initialLocation.lng, initialLocation.name)
    }
  }
})
</script>

<style scoped>
.home {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: var(--spacing-lg);
  box-sizing: border-box;
  background: 
    radial-gradient(ellipse at 20% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(0, 245, 255, 0.03) 0%, transparent 70%),
    var(--bg-primary);
  animation: slideIn 0.5s ease-out;
  position: relative;
  overflow: hidden;
}

/* 背景特效层 */
.bg-effects {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.grid-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.8;
}

.scanline {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.02) 2px,
    rgba(0, 0, 0, 0.02) 4px
  );
  animation: scanline 8s linear infinite;
}

@keyframes scanline {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
}

.glow-spots {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 15% 30%, rgba(0, 245, 255, 0.03) 0%, transparent 25%),
    radial-gradient(circle at 85% 70%, rgba(139, 92, 246, 0.03) 0%, transparent 25%),
    radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.02) 0%, transparent 50%);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-lg) var(--spacing-xl);
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  backdrop-filter: blur(20px);
  box-shadow: 
    var(--shadow-md),
    var(--shadow-glow),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  position: relative;
  z-index: 1;
  transition: all var(--transition-normal);
}

.header:hover {
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 
    var(--shadow-lg),
    0 0 40px rgba(59, 130, 246, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  position: relative;
}

.title-icon {
  color: var(--neon-cyan);
  font-size: 24px;
  text-shadow: 0 0 20px var(--neon-cyan-glow);
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

.title-glow {
  position: absolute;
  left: -10px;
  right: -10px;
  top: 50%;
  transform: translateY(-50%);
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
  z-index: -1;
}

.header-actions {
  display: flex;
  gap: var(--spacing-md);
}

.header-btn {
  padding: 10px 18px;
  font-size: 13px;
  border-radius: var(--border-radius-md);
}

.header-btn.primary {
  padding: 10px 20px;
}

.alert-badge {
  margin-left: 6px;
}

.content {
  flex: 1;
  display: flex;
  gap: var(--spacing-lg);
  min-height: 0;
  position: relative;
  z-index: 1;
}

.sidebar-left {
  width: 26%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  min-height: 0;
}

.center-content {
  width: 48%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.sidebar-right {
  width: 26%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  min-height: 0;
}

/* 响应式布局 */
@media screen and (max-width: 1600px) {
  .home {
    padding: var(--spacing-md);
  }
  
  .sidebar-left,
  .sidebar-right {
    width: 28%;
  }
  
  .center-content {
    width: 44%;
  }
}

@media screen and (max-width: 1440px) {
  .content {
    gap: var(--spacing-md);
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
    height: 42%;
  }
  
  .center-content {
    height: 28%;
    min-height: 320px;
  }
  
  .sidebar-right {
    height: 30%;
  }
}

@media screen and (max-width: 768px) {
  .home {
    padding: var(--spacing-sm);
  }
  
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-md);
    padding: var(--spacing-md);
  }
  
  h1 {
    font-size: 18px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }
  
  .header-btn {
    padding: 8px 14px;
    font-size: 12px;
  }
  
  .sidebar-left {
    height: 38%;
  }
  
  .center-content {
    height: 32%;
    min-height: 280px;
  }
  
  .sidebar-right {
    height: 30%;
  }
}

/* 版权信息 */
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 11px;
  background:transparent;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  z-index: 1;
  transition: all var(--transition-normal);

}

.footer-collapsed {
  padding: 4px 20px;
  height: 1px;
  cursor: pointer;
  background: transparent;
}

.footer:hover {
  background: rgba(10, 14, 23, 0.95);
  border-top-color: rgba(255, 255, 255, 0.1);
}

.footer-toggle {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 50%;
  margin-top: -8px;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 12px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  transition: all var(--transition-fast);
}

.footer-toggle:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: var(--neon-cyan);
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
}

.toggle-icon {
  color: var(--neon-cyan);
  font-size: 12px;
  display: block;
  line-height: 1;
}

.footer-content {
  transition: all var(--transition-normal);
}

.footer p {
  margin: 2px 0;
}

.footer-links {
  margin-top: 2px;
  font-size: 10px;
}

.footer-links a {
  color: rgba(0, 245, 255, 0.7);
  text-decoration: none;
  transition: all var(--transition-fast);
  padding: 0 3px;
}

.footer-links a:hover {
  color: var(--neon-cyan);
  text-shadow: 0 0 8px rgba(0, 245, 255, 0.5);
}

.footer-links span {
  margin: 0 6px;
  color: rgba(255, 255, 255, 0.2);
}
</style>
