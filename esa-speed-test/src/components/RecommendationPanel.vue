<template>
  <div class="recommendation-panel">
    <div class="recommendation-header">
      <h3>智能推荐</h3>
      <el-button size="mini" @click="getRecommendations" :icon="Refresh" circle />
    </div>
    
    <div v-if="recommendations" class="recommendation-content">
      <div class="user-location">
        <el-icon class="location-icon"><Location /></el-icon>
        <span>{{ userLocation.city }}, {{ userLocation.country }}</span>
      </div>
      
      <div class="carousel-container">
        <el-carousel
          :interval="5000"
          type="card"
          height="100px"
          indicator-position="none"
        >
          <el-carousel-item
            v-for="(rec, index) in recommendations.recommendations"
            :key="rec.nodeId"
            class="carousel-item"
          >
            <div
              class="recommendation-card"
              :class="{ 'top-recommendation': index === 0 }"
            >
              <div class="card-rank">{{ index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1 }}</div>
              <div class="card-title">{{ rec.nodeName }}</div>
              <div class="card-score">{{ rec.totalScore }}分</div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>
    </div>
    
    <div v-else class="empty-state">
      <el-empty description="暂无推荐" :image-size="40" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Location } from '@element-plus/icons-vue'
import { useNodesStore } from '../stores/nodes'
import { getUserLocation, recommendBestNode } from '../services/recommendation'

const nodesStore = useNodesStore()
const recommendations = ref(null)
const userLocation = ref({ city: '未知', country: '未知' })

const getRecommendations = async () => {
  try {
    ElMessage.info('获取推荐...')
    userLocation.value = await getUserLocation()
    recommendations.value = recommendBestNode(
      nodesStore.allNodes,
      userLocation.value,
      { topN: 3 }
    )
    ElMessage.success('推荐已更新')
  } catch (error) {
    ElMessage.error('获取推荐失败')
  }
}

const handleConnect = (rec) => {
  const node = nodesStore.getNode(rec.nodeId)
  if (node) {
    nodesStore.setSelectedNode(node)
    ElMessage.success(`已选择 ${rec.nodeName}`)
  }
}

onMounted(() => {
  getRecommendations()
})
</script>

<style scoped>
.recommendation-panel {
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: 10px;
  box-shadow: var(--shadow-sm), var(--shadow-glow);
  height: 27%;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(20px);
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
  color: var(--text-primary);
}

.recommendation-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  gap: 6px;
}

.user-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: var(--text-secondary);
  padding: 4px 6px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: var(--border-radius-sm);
  flex-shrink: 0;
}

.location-icon {
  font-size: 12px;
  color: var(--neon-cyan);
}

.carousel-container {
  flex: 1;
  min-height: 0;
}

.carousel-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
}

.recommendation-card {
  width: 100%;
  height: 100%;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  padding: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  transition: all 0.3s ease;
}

.recommendation-card:hover {
  border-color: var(--neon-cyan);
}

.recommendation-card.top-recommendation {
  border-color: var(--neon-green);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, var(--bg-tertiary) 100%);
}

.card-rank {
  font-size: 14px;
}

.card-title {
  font-size: 10px;
  font-weight: 500;
  color: var(--text-primary);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.card-score {
  font-size: 12px;
  font-weight: 600;
  color: var(--neon-green);
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

:deep(.el-empty__description p) {
  font-size: 11px;
}

:deep(.el-carousel__item--card) {
  border-radius: var(--border-radius-sm) !important;
}

:deep(.el-carousel__item--card.is-active) {
  border-color: var(--neon-cyan) !important;
}
</style>
