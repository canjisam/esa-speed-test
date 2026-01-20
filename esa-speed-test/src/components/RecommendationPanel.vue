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
      </div>
      
      <!-- 推荐轮播图 -->
      <div class="carousel-container">
        <el-carousel
          :interval="5000"
          type="card"
          height="150px"
          indicator-position="outside"
        >
          <el-carousel-item
            v-for="(rec, index) in recommendations.recommendations"
            :key="rec.nodeId"
            class="carousel-item"
          >
            <div
              class="recommendation-card"
              :class="{ 'top-recommendation': index === 0 }"
              @mouseenter="hoveredIndex = index"
              @mouseleave="hoveredIndex = -1"
            >
              <!-- 基础信息 -->
              <div class="card-basic">
                <div class="card-rank">
                  <span v-if="index === 0">🥇</span>
                  <span v-else-if="index === 1">🥈</span>
                  <span v-else-if="index === 2">🥉</span>
                  <span v-else>{{ index + 1 }}</span>
                </div>
                <div class="card-title">{{ rec.nodeName }}</div>
                <div class="card-score">
                  <span class="score-label">推荐得分:</span>
                  <span class="score-value">{{ rec.totalScore }}分</span>
                </div>
              </div>
              
              <!-- 悬停显示的详细信息 -->
              <div class="card-details" :class="{ 'visible': hoveredIndex === index }">
                <div class="detail-reasons">
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
                <div class="card-actions">
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
          </el-carousel-item>
        </el-carousel>
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
const hoveredIndex = ref(-1)

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
  border-radius: 5px;
  padding: 8px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
  height: 30%;
  display: flex;
  flex-direction: column;
}

.recommendation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  flex-shrink: 0;
}

.recommendation-header h3 {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: #333;
}

.recommendation-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.user-location {
  padding: 4px 6px;
  background: #f0f9ff;
  border-radius: 3px;
  margin-bottom: 4px;
  flex-shrink: 0;
}

.location-info {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  color: #333;
}

.carousel-container {
  flex: 1;
  min-height: 0;
}

.carousel-item {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}

.recommendation-card {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 6px;
  padding: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e8e8e8;
}

.recommendation-card:hover {
  border-color: #1890ff;
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(24, 144, 255, 0.2);
}

.recommendation-card.top-recommendation {
  border-color: #52c41a;
  background: linear-gradient(135deg, #f6ffed 0%, #ffffff 100%);
}

.recommendation-card.top-recommendation:hover {
  border-color: #52c41a;
  box-shadow: 0 3px 10px rgba(82, 196, 26, 0.2);
}

.card-basic {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.card-rank {
  font-size: 18px;
  margin-bottom: 2px;
}

.card-title {
  font-size: 12px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}

.card-score {
  font-size: 10px;
  color: #666;
}

.score-label {
  margin-right: 2px;
}

.score-value {
  font-size: 14px;
  font-weight: 600;
  color: #52c41a;
}

.card-details {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.98);
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: all 0.3s ease;
}

.card-details.visible {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
}

.detail-label {
  color: #666;
  font-weight: 500;
}

.detail-value {
  font-weight: 600;
  color: #333;
  font-size: 12px;
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

.detail-reasons {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 6px;
  background: #f5f5f5;
  border-radius: 3px;
  flex: 1;
  overflow-y: auto;
}

.reason-item {
  font-size: 10px;
  display: flex;
  gap: 4px;
  align-items: center;
}

.reason-factor {
  font-weight: 600;
  color: #333;
  min-width: 40px;
}

.reason-value {
  color: #1890ff;
  font-weight: 500;
}

.reason-desc {
  color: #666;
  font-size: 9px;
}

.card-actions {
  display: flex;
  gap: 3px;
  margin-top: auto;
  padding-top: 4px;
  flex-shrink: 0;
}

.card-actions .el-button {
  padding: 4px 8px;
  height: 24px;
  font-size: 10px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
}

/* 轮播图指示器样式 */
:deep(.el-carousel__indicators) {
  transform: translateY(4px);
}

:deep(.el-carousel__indicator) {
  padding: 3px 2px;
}

:deep(.el-carousel__button) {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
</style>