<template>
  <div class="recommendation-panel">
    <div class="recommendation-header">
      <h3>智能推荐</h3>
      <el-button size="small" @click="getRecommendations" :icon="Refresh">刷新推荐</el-button>
    </div>
    
    <div v-if="recommendations" class="recommendation-content">
      <!-- 用户位置 -->
      <div class="user-location">
        <div class="location-info">
          <el-icon><Location /></el-icon>
          <span>您的位置: {{ userLocation.city }}, {{ userLocation.country }}</span>
        </div>
        <div class="location-details">
          <span>IP: {{ userLocation.ip }}</span>
          <span>经纬度: {{ userLocation.latitude.toFixed(2) }}°N, {{ userLocation.longitude.toFixed(2) }}°E</span>
        </div>
      </div>
      
      <!-- 推荐理由 -->
      <div class="recommendation-reason">
        <el-alert
          :title="recommendations.recommendationReason"
          type="success"
          :closable="false"
          show-icon
        />
      </div>
      
      <!-- 推荐列表 -->
      <div class="recommendation-list">
        <div
          v-for="(rec, index) in recommendations.recommendations"
          :key="rec.nodeId"
          class="recommendation-item"
          :class="{ 'top-recommendation': index === 0 }"
        >
          <div class="recommendation-rank">
            <span v-if="index === 0">🥇</span>
            <span v-else-if="index === 1">🥈</span>
            <span v-else-if="index === 2">🥉</span>
            <span v-else>{{ index + 1 }}</span>
          </div>
          
          <div class="recommendation-info">
            <div class="recommendation-name">{{ rec.nodeName }}</div>
            <div class="recommendation-score">
              <span class="score-label">推荐得分:</span>
              <span class="score-value">{{ rec.totalScore }}分</span>
            </div>
          </div>
          
          <div class="recommendation-details">
            <div class="detail-item">
              <span class="detail-label">延迟:</span>
              <span class="detail-value" :class="getLatencyClass(rec.latency)">{{ rec.latency }}ms</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">距离:</span>
              <span class="detail-value">{{ rec.distance }}km</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">稳定性:</span>
              <span class="detail-value">{{ rec.stability }}分</span>
            </div>
          </div>
          
          <div class="recommendation-reasons">
            <div
              v-for="reason in rec.reasons"
              :key="reason.factor"
              class="reason-item"
            >
              <span class="reason-factor">{{ reason.factor }}:</span>
              <span class="reason-value">{{ reason.value }}</span>
              <span class="reason-desc">({{ reason.reason }})</span>
            </div>
          </div>
          
          <div class="recommendation-actions">
            <el-button
              size="small"
              type="primary"
              @click="handleConnect(rec)"
              :icon="Connection"
            >
              连接
            </el-button>
            <el-button
              size="small"
              @click="handleViewDetails(rec)"
              :icon="View"
            >
              详情
            </el-button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="empty-state">
      <el-empty description="点击刷新推荐获取建议" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Location, Connection, View } from '@element-plus/icons-vue'
import { useNodesStore } from '../stores/nodes'
import { getUserLocation, recommendBestNode } from '../services/recommendation'

const nodesStore = useNodesStore()
const recommendations = ref(null)
const userLocation = ref({})

// 获取延迟样式类
const getLatencyClass = (latency) => {
  if (latency < 100) return 'latency-excellent'
  if (latency < 150) return 'latency-good'
  if (latency < 200) return 'latency-fair'
  return 'latency-poor'
}

// 获取推荐
const getRecommendations = async () => {
  try {
    ElMessage.info('正在获取推荐...')
    
    // 获取用户位置
    userLocation.value = await getUserLocation()
    
    // 获取推荐
    recommendations.value = recommendBestNode(
      nodesStore.allNodes,
      userLocation.value,
      { topN: 3 }
    )
    
    ElMessage.success('推荐已更新')
  } catch (error) {
    console.error('获取推荐失败:', error)
    ElMessage.error('获取推荐失败')
  }
}

// 连接节点
const handleConnect = (rec) => {
  const node = nodesStore.getNode(rec.nodeId)
  if (node) {
    nodesStore.setSelectedNode(node)
    ElMessage.success(`已选择 ${rec.nodeName}`)
  }
}

// 查看详情
const handleViewDetails = (rec) => {
  const node = nodesStore.getNode(rec.nodeId)
  if (node) {
    nodesStore.setSelectedNode(node)
    ElMessage.info(`正在查看 ${rec.nodeName} 详情`)
  }
}

// 初始化时自动获取推荐
onMounted(() => {
  getRecommendations()
})
</script>

<style scoped>
.recommendation-panel {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.recommendation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.recommendation-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.recommendation-content {
  max-height: 600px;
  overflow-y: auto;
}

.user-location {
  padding: 12px;
  background: #f0f9ff;
  border-radius: 6px;
  margin-bottom: 16px;
}

.location-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.location-details {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #666;
}

.recommendation-reason {
  margin-bottom: 16px;
}

.recommendation-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recommendation-item {
  padding: 16px;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  transition: all 0.3s;
}

.recommendation-item:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

.recommendation-item.top-recommendation {
  border-color: #52c41a;
  background: linear-gradient(135deg, #f6ffed 0%, #ffffff 100%);
}

.recommendation-rank {
  font-size: 24px;
  margin-bottom: 8px;
}

.recommendation-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.recommendation-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.recommendation-score {
  font-size: 14px;
  color: #666;
}

.score-label {
  margin-right: 4px;
}

.score-value {
  font-size: 18px;
  font-weight: 600;
  color: #52c41a;
}

.recommendation-details {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
}

.detail-item {
  font-size: 12px;
}

.detail-label {
  color: #666;
  margin-right: 4px;
}

.detail-value {
  font-weight: 600;
  color: #333;
}

.latency-excellent {
  color: #52c41a;
}

.latency-good {
  color: #1890ff;
}

.latency-fair {
  color: #faad14;
}

.latency-poor {
  color: #ff4d4f;
}

.recommendation-reasons {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.reason-item {
  font-size: 12px;
  color: #666;
}

.reason-factor {
  font-weight: 600;
  color: #333;
  margin-right: 4px;
}

.reason-value {
  color: #1890ff;
  margin-right: 4px;
}

.reason-desc {
  color: #999;
}

.recommendation-actions {
  display: flex;
  gap: 8px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

/* 滚动条样式 */
.recommendation-content::-webkit-scrollbar {
  width: 6px;
}

.recommendation-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.recommendation-content::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.recommendation-content::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>