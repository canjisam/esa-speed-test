<template>
  <div class="node-list-container">
    <div class="filter-section">
      <el-select
        v-model="selectedRegion"
        placeholder="筛选地区"
        clearable
        @change="handleFilterChange"
        style="width: 150px; margin-right: 10px;"
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
        style="width: 150px;"
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
        <div class="node-status-indicator" :style="{ backgroundColor: getStatusColor(node.status) }"></div>
        <div class="node-info">
          <div class="node-name">{{ node.name }}</div>
          <div class="node-details">
            <span class="node-region">{{ node.region }}</span>
            <span class="node-latency">{{ node.latency }} ms</span>
            <span class="node-load">{{ node.load }}%</span>
          </div>
        </div>
        <div class="node-status-badge" :style="{ backgroundColor: getStatusColor(node.status) }">
          {{ getStatusText(node.status) }}
        </div>
      </div>
    </div>

    <div class="statistics">
      <div class="stat-item">
        <span class="stat-label">总节点:</span>
        <span class="stat-value">{{ nodes.length }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">在线:</span>
        <span class="stat-value online">{{ onlineCount }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">拥堵:</span>
        <span class="stat-value congested">{{ congestedCount }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">离线:</span>
        <span class="stat-value offline">{{ offlineCount }}</span>
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
    online: '#52c41a',
    offline: '#ff4d4f',
    congested: '#faad14'
  }
  return colors[status] || '#1890ff'
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

// 处理筛选变化
const handleFilterChange = () => {
  // 筛选变化时可以添加其他逻辑
}

// 处理节点点击
const handleNodeClick = (node) => {
  emit('node-select', node)
}
</script>

<style scoped>
.node-list-container {
  width: 320px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.filter-section {
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
}

.node-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.node-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background: #f5f5f5;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.node-item:hover {
  background: #e6f7ff;
  transform: translateX(4px);
}

.node-item.active {
  background: #e6f7ff;
  border: 2px solid #1890ff;
}

.node-status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 12px;
  flex-shrink: 0;
}

.node-info {
  flex: 1;
  min-width: 0;
}

.node-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
}

.node-details {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #666;
}

.node-region {
  flex-shrink: 0;
}

.node-latency {
  flex-shrink: 0;
}

.node-load {
  flex-shrink: 0;
}

.node-status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
  font-weight: 500;
  flex-shrink: 0;
}

.statistics {
  padding: 16px;
  border-top: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-around;
  background: #fafafa;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.stat-value.online {
  color: #52c41a;
}

.stat-value.congested {
  color: #faad14;
}

.stat-value.offline {
  color: #ff4d4f;
}

/* 滚动条样式 */
.node-list::-webkit-scrollbar {
  width: 6px;
}

.node-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.node-list::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.node-list::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>