<template>
  <div class="alert-panel">
    <div class="alert-header">
      <h3>告警通知</h3>
      <div class="header-actions">
        <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="item">
          <el-button size="small" @click="togglePanel" :icon="Bell">
            {{ showPanel ? '收起' : '展开' }}
          </el-button>
        </el-badge>
        <el-button size="small" @click="markAllRead" :disabled="unreadCount === 0">
          全部已读
        </el-button>
        <el-button size="small" @click="clearAll" :icon="Delete">
          清空
        </el-button>
      </div>
    </div>
    
    <el-collapse-transition>
      <div v-show="showPanel" class="alert-content">
        <div v-if="alerts.length === 0" class="empty-state">
          <el-empty description="暂无告警" />
        </div>
        
        <div v-else class="alert-list">
          <div
            v-for="alert in alerts"
            :key="alert.id"
            class="alert-item"
            :class="[
              `alert-${alert.severity}`,
              { 'alert-read': alert.read }
            ]"
          >
            <div class="alert-icon">
              <el-icon v-if="alert.severity === 'high'"><Warning /></el-icon>
              <el-icon v-else-if="alert.severity === 'medium'"><InfoFilled /></el-icon>
              <el-icon v-else><SuccessFilled /></el-icon>
            </div>
            
            <div class="alert-message">
              <div class="alert-title">{{ alert.message }}</div>
              <div class="alert-time">{{ formatTime(alert.timestamp) }}</div>
            </div>
            
            <div class="alert-actions">
              <el-button
                size="small"
                type="primary"
                link
                @click="handleViewNode(alert)"
              >
                查看
              </el-button>
              <el-button
                size="small"
                link
                @click="handleMarkRead(alert)"
                v-if="!alert.read"
              >
                标记已读
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-collapse-transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Bell, Delete, Warning, InfoFilled, SuccessFilled } from '@element-plus/icons-vue'
import { getAlertHistory, addAlertHistory, clearAlertHistory } from '../services/alert'
import { useNodesStore } from '../stores/nodes'

const nodesStore = useNodesStore()
const showPanel = ref(true)
const alerts = ref([])

// 未读告警数量
const unreadCount = computed(() => {
  return alerts.value.filter(a => !a.read).length
})

// 格式化时间
const formatTime = (timestamp) => {
  const now = Date.now()
  const diff = now - timestamp
  
  if (diff < 60000) {
    return '刚刚'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)} 分钟前`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)} 小时前`
  } else {
    const date = new Date(timestamp)
    return date.toLocaleDateString('zh-CN')
  }
}

// 切换面板显示
const togglePanel = () => {
  showPanel.value = !showPanel.value
}

// 标记所有已读
const markAllRead = () => {
  alerts.value.forEach(alert => {
    alert.read = true
  })
  ElMessage.success('已标记所有告警为已读')
}

// 清空所有告警
const clearAll = () => {
  alerts.value = []
  clearAlertHistory()
  ElMessage.success('已清空所有告警')
}

// 查看节点
const handleViewNode = (alert) => {
  const node = nodesStore.getNode(alert.nodeId)
  if (node) {
    nodesStore.setSelectedNode(node)
    // 标记为已读
    handleMarkRead(alert)
  }
}

// 标记已读
const handleMarkRead = (alert) => {
  alert.read = true
}

// 添加告警
const addAlert = (alert) => {
  const newAlert = {
    ...alert,
    read: false
  }
  alerts.value.unshift(newAlert)
  
  // 限制最多显示 50 条
  if (alerts.value.length > 50) {
    alerts.value = alerts.value.slice(0, 50)
  }
  
  // 保存到历史
  addAlertHistory(newAlert)
  
  // 显示通知
  if (alert.severity === 'high') {
    ElMessage({
      message: alert.message,
      type: 'error',
      duration: 5000
    })
  } else if (alert.severity === 'medium') {
    ElMessage({
      message: alert.message,
      type: 'warning',
      duration: 3000
    })
  }
}

// 加载告警历史
const loadAlerts = () => {
  const history = getAlertHistory(50)
  alerts.value = history.map(alert => ({
    ...alert,
    read: true // 历史告警默认为已读
  }))
}

// 刷新告警（供外部调用）
const refreshAlerts = () => {
  loadAlerts()
}

// 暴露方法
defineExpose({
  addAlert,
  refreshAlerts
})

onMounted(() => {
  loadAlerts()
})
</script>

<style scoped>
.alert-panel {
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--shadow-md), var(--shadow-glow);
  backdrop-filter: blur(20px);
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.alert-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  text-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
}

.header-actions {
  display: flex;
  gap: 8px;
}

.alert-content {
  min-height: 200px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.alert-list {
  max-height: 400px;
  overflow-y: auto;
}

.alert-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  background: var(--bg-tertiary);
  border-left: 4px solid var(--neon-blue);
  transition: all 0.3s ease;
}

.alert-item:hover {
  background: rgba(59, 130, 246, 0.1);
}

.alert-item.alert-high {
  border-left-color: var(--status-offline);
  background: rgba(239, 68, 68, 0.1);
}

.alert-item.alert-high:hover {
  background: rgba(239, 68, 68, 0.15);
}

.alert-item.alert-medium {
  border-left-color: var(--status-congested);
  background: rgba(245, 158, 11, 0.1);
}

.alert-item.alert-medium:hover {
  background: rgba(245, 158, 11, 0.15);
}

.alert-item.alert-low {
  border-left-color: var(--status-online);
  background: rgba(16, 185, 129, 0.1);
}

.alert-item.alert-low:hover {
  background: rgba(16, 185, 129, 0.15);
}

.alert-item.alert-read {
  opacity: 0.6;
}

.alert-icon {
  margin-right: 12px;
  font-size: 20px;
}

.alert-high .alert-icon {
  color: var(--status-offline);
  text-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
}

.alert-medium .alert-icon {
  color: var(--status-congested);
  text-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
}

.alert-low .alert-icon {
  color: var(--status-online);
  text-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
}

.alert-message {
  flex: 1;
  min-width: 0;
}

.alert-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.alert-time {
  font-size: 12px;
  color: var(--text-muted);
}

.alert-actions {
  display: flex;
  gap: 8px;
  margin-left: 12px;
}

/* 滚动条样式 */
.alert-list::-webkit-scrollbar {
  width: 6px;
}

.alert-list::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: 3px;
}

.alert-list::-webkit-scrollbar-thumb {
  background: var(--neon-blue);
  border-radius: 3px;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
}

.alert-list::-webkit-scrollbar-thumb:hover {
  background: var(--neon-cyan);
  box-shadow: 0 0 15px rgba(0, 245, 255, 0.5);
}
</style>