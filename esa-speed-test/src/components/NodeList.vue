<template>
  <div class="node-list-container">
    <div class="filter-section">
      <div class="filter-bg"></div>
      <el-select
        v-model="selectedRegion"
        placeholder="筛选地区"
        clearable
        @change="handleFilterChange"
        style="width: 140px; margin-right: 10px;"
      >
        <el-option label="全部地区" value="" />
        <el-option label="亚太" value="亚太" />
        <el-option label="北美" value="北美" />
        <el-option label="欧洲" value="欧洲" />
        <el-option label="南美" value="南美" />
        <el-option label="中东" value="中东" />
        <el-option label="非洲" value="非洲" />
      </el-select>

      <el-select
        v-model="selectedStatus"
        placeholder="筛选状态"
        clearable
        @change="handleFilterChange"
        style="width: 140px;"
      >
        <el-option label="全部状态" value="" />
        <el-option label="在线" value="online" />
        <el-option label="拥堵" value="congested" />
        <el-option label="离线" value="offline" />
      </el-select>
    </div>

    <div class="node-list">
      <div
        v-for="node in filteredNodes"
        :key="node.id"
        class="node-item"
        :class="{ active: selectedNode?.id === node.id }"
        @click="handleNodeClick(node)"
      >
        <div class="node-glow" :style="{ background: getStatusGlow(node.status) }"></div>
        <div class="node-status-indicator" :style="{ backgroundColor: getStatusColor(node.status) }"></div>
        <div class="node-info">
          <div class="node-name">{{ node.name }}</div>
          <div class="node-details">
            <span class="node-region">{{ node.region }}</span>
            <span class="node-latency" :class="getLatencyClass(node.latency)">{{ node.latency }} ms</span>
            <span class="node-load">{{ node.load }}%</span>
          </div>
        </div>
        <div class="node-status-badge" :style="{ background: getStatusGradient(node.status) }">
          {{ getStatusText(node.status) }}
        </div>
      </div>
    </div>

    <div class="statistics">
      <div class="stat-item">
        <div class="stat-icon">◈</div>
        <div class="stat-content">
          <span class="stat-label">总节点</span>
          <span class="stat-value">{{ nodes.length }}</span>
        </div>
      </div>
      <div class="stat-item online">
        <div class="stat-icon">●</div>
        <div class="stat-content">
          <span class="stat-label">在线</span>
          <span class="stat-value">{{ onlineCount }}</span>
        </div>
      </div>
      <div class="stat-item congested">
        <div class="stat-icon">●</div>
        <div class="stat-content">
          <span class="stat-label">拥堵</span>
          <span class="stat-value">{{ congestedCount }}</span>
        </div>
      </div>
      <div class="stat-item offline">
        <div class="stat-icon">●</div>
        <div class="stat-content">
          <span class="stat-label">离线</span>
          <span class="stat-value">{{ offlineCount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  nodes: {
    type: Array,
    required: true
  },
  selectedNode: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['node-select'])

const selectedRegion = ref('')
const selectedStatus = ref('')

// 过滤后的节点列表
const filteredNodes = computed(() => {
  let result = [...props.nodes]

  if (selectedRegion.value) {
    result = result.filter(node => node.region === selectedRegion.value)
  }

  if (selectedStatus.value) {
    result = result.filter(node => node.status === selectedStatus.value)
  }

  return result
})

// 统计数据
const onlineCount = computed(() => props.nodes.filter(n => n.status === 'online').length)
const congestedCount = computed(() => props.nodes.filter(n => n.status === 'congested').length)
const offlineCount = computed(() => props.nodes.filter(n => n.status === 'offline').length)

// 获取状态颜色
const getStatusColor = (status) => {
  const colors = {
    online: '#10b981',
    offline: '#ef4444',
    congested: '#f59e0b'
  }
  return colors[status] || '#3b82f6'
}

// 获取状态渐变
const getStatusGradient = (status) => {
  const gradients = {
    online: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    offline: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    congested: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  }
  return gradients[status] || 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
}

// 获取状态发光
const getStatusGlow = (status) => {
  const glows = {
    online: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
    offline: 'radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 70%)',
    congested: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)'
  }
  return glows[status] || 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)'
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

// 获取延迟样式类
const getLatencyClass = (latency) => {
  if (latency === 0) return 'latency-offline'
  if (latency < 150) return 'latency-online'
  if (latency < 300) return 'latency-congested'
  return 'latency-offline'
}

// 处理筛选变化
const handleFilterChange = () => {}

// 处理节点点击
const handleNodeClick = (node) => {
  emit('node-select', node)
}
</script>

<style scoped>
.node-list-container {
  width: 100%;
  height: 68%;
  display: flex;
  flex-direction: column;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  box-shadow: 
    var(--shadow-md),
    var(--shadow-glow),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
  overflow: hidden;
  backdrop-filter: blur(20px);
  transition: all var(--transition-normal);
}

.node-list-container:hover {
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 
    var(--shadow-lg),
    0 0 45px rgba(59, 130, 246, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.filter-section {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.08) 0%, transparent 100%);
  position: relative;
  flex-shrink: 0;
}

.filter-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.05) 0%, transparent 100%);
  pointer-events: none;
}

.node-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-sm);
}

.node-item {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  margin-bottom: 8px;
  background: var(--bg-tertiary);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 1px solid transparent;
  position: relative;
  overflow: hidden;
}

.node-item:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0.05) 100%);
  border-color: rgba(59, 130, 246, 0.3);
  transform: translateX(4px);
  box-shadow: 
    0 4px 20px rgba(59, 130, 246, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.node-item.active {
  background: linear-gradient(135deg, rgba(0, 245, 255, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%);
  border: 1px solid var(--neon-cyan);
  box-shadow: 
    0 0 25px rgba(0, 245, 255, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.node-glow {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: 80px;
  height: 100%;
  opacity: 0.5;
  pointer-events: none;
}

.node-status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 12px;
  flex-shrink: 0;
  box-shadow: 
    0 0 12px currentColor,
    inset 0 0 6px rgba(255, 255, 255, 0.3);
  position: relative;
}

.node-status-indicator::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 50%;
  border: 1px solid currentColor;
  opacity: 0.4;
  animation: indicatorPulse 2s ease-in-out infinite;
}

@keyframes indicatorPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.4;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.1;
  }
}

.node-info {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.node-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
  transition: color var(--transition-fast);
}

.node-item:hover .node-name {
  color: var(--neon-cyan);
}

.node-details {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: var(--text-secondary);
}

.node-region {
  flex-shrink: 0;
  color: var(--text-muted);
}

.node-latency {
  flex-shrink: 0;
  font-weight: 600;
  font-family: 'SF Mono', 'Monaco', monospace;
  transition: all var(--transition-fast);
}

.node-latency.latency-online {
  color: var(--status-online);
  text-shadow: 0 0 12px var(--status-online-glow);
}

.node-latency.latency-congested {
  color: var(--status-congested);
  text-shadow: 0 0 12px var(--status-congested-glow);
}

.node-latency.latency-offline {
  color: var(--status-offline);
  text-shadow: 0 0 12px var(--status-offline-glow);
}

.node-load {
  flex-shrink: 0;
  color: var(--text-muted);
}

.node-status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 10px;
  color: white;
  font-weight: 600;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.statistics {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-around;
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.05) 0%, transparent 100%);
  flex-shrink: 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--border-color);
  transition: all var(--transition-normal);
}

.stat-item:hover {
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.stat-item.online {
  border-color: rgba(16, 185, 129, 0.3);
}

.stat-item.online .stat-icon {
  color: var(--status-online);
  text-shadow: 0 0 10px var(--status-online-glow);
}

.stat-item.congested {
  border-color: rgba(245, 158, 11, 0.3);
}

.stat-item.congested .stat-icon {
  color: var(--status-congested);
  text-shadow: 0 0 10px var(--status-congested-glow);
}

.stat-item.offline {
  border-color: rgba(239, 68, 68, 0.3);
}

.stat-item.offline .stat-icon {
  color: var(--status-offline);
  text-shadow: 0 0 10px var(--status-offline-glow);
}

.stat-icon {
  font-size: 12px;
  transition: all var(--transition-normal);
}

.stat-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.stat-label {
  font-size: 10px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: 'SF Mono', 'Monaco', monospace;
  text-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
}

.stat-item.online .stat-value {
  color: var(--status-online);
  text-shadow: 0 0 15px var(--status-online-glow);
}

.stat-item.congested .stat-value {
  color: var(--status-congested);
  text-shadow: 0 0 15px var(--status-congested-glow);
}

.stat-item.offline .stat-value {
  color: var(--status-offline);
  text-shadow: 0 0 15px var(--status-offline-glow);
}

/* 滚动条样式 */
.node-list::-webkit-scrollbar {
  width: 6px;
}

.node-list::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: 3px;
}

.node-list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--neon-blue) 0%, #2563eb 100%);
  border-radius: 3px;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
}

.node-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, var(--neon-cyan) 0%, #06b6d4 100%);
  box-shadow: 0 0 15px rgba(0, 245, 255, 0.5);
}
</style>
