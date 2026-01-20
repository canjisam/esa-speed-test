<template>
  <div class="node-comparison">
    <div class="comparison-header">
      <h3>节点性能对比</h3>
      <el-button size="small" @click="refreshData" :icon="Refresh">刷新</el-button>
    </div>
    
    <div class="comparison-content">
      <el-table :data="sortedNodes" stripe style="width: 100%">
        <el-table-column prop="name" label="节点名称" width="150" />
        <el-table-column prop="region" label="地区" width="80" />
        <el-table-column label="延迟" width="100" sortable :sort-method="sortByLatency">
          <template #default="{ row }">
            <span :class="getLatencyClass(row.latency)">{{ row.latency }} ms</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="健康度" width="120" sortable :sort-method="sortByHealthScore">
          <template #default="{ row }">
            <div class="health-score">
              <el-progress 
                :percentage="row.healthScore || 0" 
                :color="getHealthScoreColor(row.healthScore || 0)"
                :stroke-width="8"
                :show-text="false"
              />
              <span class="score-text">{{ row.healthScore || 0 }}分</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="负载" width="100">
          <template #default="{ row }">
            <el-progress 
              :percentage="row.load || 0" 
              :color="getLoadColor(row.load || 0)"
              :stroke-width="6"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button 
              size="small" 
              type="primary" 
              link
              @click="handleViewDetail(row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <div class="comparison-summary">
      <div class="summary-item">
        <span class="summary-label">平均延迟:</span>
        <span class="summary-value">{{ averageLatency }} ms</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">最低延迟:</span>
        <span class="summary-value">{{ minLatency }} ms</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">最高延迟:</span>
        <span class="summary-value">{{ maxLatency }} ms</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">在线节点:</span>
        <span class="summary-value online">{{ onlineCount }} / {{ totalCount }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { useNodesStore } from '../stores/nodes'
import { calculateHealthScore } from '../services/alert'
import { getSpeedTestHistory } from '../services/storage'

const nodesStore = useNodesStore()

// 排序后的节点列表
const sortedNodes = ref([])

// 计算统计数据
const averageLatency = computed(() => {
  const nodes = sortedNodes.value.filter(n => n.latency > 0)
  if (nodes.length === 0) return 0
  const sum = nodes.reduce((acc, n) => acc + n.latency, 0)
  return Math.round(sum / nodes.length)
})

const minLatency = computed(() => {
  const latencies = sortedNodes.value.map(n => n.latency).filter(l => l > 0)
  return latencies.length > 0 ? Math.min(...latencies) : 0
})

const maxLatency = computed(() => {
  const latencies = sortedNodes.value.map(n => n.latency).filter(l => l > 0)
  return latencies.length > 0 ? Math.max(...latencies) : 0
})

const onlineCount = computed(() => {
  return sortedNodes.value.filter(n => n.status === 'online').length
})

const totalCount = computed(() => sortedNodes.value.length)

// 获取延迟样式类
const getLatencyClass = (latency) => {
  if (latency === 0) return 'latency-offline'
  if (latency < 150) return 'latency-online'
  if (latency < 300) return 'latency-congested'
  return 'latency-offline'
}

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    online: 'success',
    offline: 'danger',
    congested: 'warning'
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    online: '在线',
    offline: '离线',
    congested: '拥堵'
  }
  return texts[status] || '未知'
}

// 获取健康度颜色
const getHealthScoreColor = (score) => {
  if (score >= 80) return '#52c41a'
  if (score >= 60) return '#faad14'
  if (score >= 40) return '#ff7a45'
  return '#ff4d4f'
}

// 获取负载颜色
const getLoadColor = (load) => {
  if (load < 50) return '#52c41a'
  if (load < 80) return '#faad14'
  return '#ff4d4f'
}

// 按延迟排序
const sortByLatency = (a, b) => {
  if (a.latency === 0 && b.latency === 0) return 0
  if (a.latency === 0) return 1
  if (b.latency === 0) return -1
  return a.latency - b.latency
}

// 按健康度排序
const sortByHealthScore = (a, b) => {
  return (b.healthScore || 0) - (a.healthScore || 0)
}

// 刷新数据
const refreshData = () => {
  const nodes = nodesStore.allNodes.map(node => {
    // 获取历史数据
    const history = getSpeedTestHistory(node.id, 20)
    
    // 计算健康度
    const healthScore = calculateHealthScore(node, history)
    
    return {
      ...node,
      healthScore
    }
  })
  
  // 按健康度降序排序
  sortedNodes.value = nodes.sort((a, b) => {
    return (b.healthScore || 0) - (a.healthScore || 0)
  })
}

// 查看详情
const handleViewDetail = (node) => {
  console.log('查看节点详情:', node)
  // 这里可以打开详情对话框或跳转到详情页面
}

// 初始化
refreshData()
</script>

<style scoped>
.node-comparison {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.comparison-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.comparison-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.comparison-content {
  margin-bottom: 16px;
}

.health-score {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-text {
  font-size: 12px;
  font-weight: 600;
  min-width: 35px;
}

.latency-online {
  color: #52c41a;
  font-weight: 600;
}

.latency-congested {
  color: #faad14;
  font-weight: 600;
}

.latency-offline {
  color: #ff4d4f;
  font-weight: 600;
}

.comparison-summary {
  display: flex;
  justify-content: space-around;
  padding-top: 16px;
  border-top: 1px solid #e8e8e8;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.summary-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.summary-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.summary-value.online {
  color: #52c41a;
}
</style>