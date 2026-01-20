<template>
  <div class="speed-test-control">
    <div class="control-header">
      <h3>实时测速</h3>
      <el-switch
        v-model="isTesting"
        @change="handleToggleTest"
        active-text="测速中"
        inactive-text="已停止"
        :active-icon="VideoPlay"
        :inactive-icon="VideoPause"
      />
    </div>
    
    <div class="control-info">
      <div class="info-item">
        <span class="info-label">上次更新:</span>
        <span class="info-value">{{ lastUpdateTime }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">刷新间隔:</span>
        <span class="info-value">{{ refreshInterval }}秒</span>
      </div>
      <div class="info-item">
        <span class="info-label">测速进度:</span>
        <el-progress 
          :percentage="testProgress" 
          :status="testProgress === 100 ? 'success' : ''"
          :stroke-width="6"
        />
      </div>
    </div>

    <div class="control-actions">
      <el-button 
        type="primary" 
        :icon="Refresh" 
        @click="handleManualTest"
        :loading="isTesting"
        :disabled="isTesting"
      >
        立即测速
      </el-button>
      
      <el-button 
        :icon="RefreshRight" 
        @click="handleRefreshIntervalChange"
      >
        调整间隔
      </el-button>
    </div>

    <el-dialog
      v-model="showIntervalDialog"
      title="设置刷新间隔"
      width="300px"
    >
      <el-slider
        v-model="tempRefreshInterval"
        :min="5"
        :max="60"
        :step="5"
        show-input
        :marks="{ 5: '5s', 30: '30s', 60: '60s' }"
      />
      <template #footer>
        <el-button @click="showIntervalDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmIntervalChange">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { VideoPlay, VideoPause, Refresh, RefreshRight } from '@element-plus/icons-vue'
import { useNodesStore } from '../stores/nodes'
import { generateMockSpeedTest, calculateNodeStatus } from '../services/speedTest'

const props = defineProps({
  refreshInterval: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits(['test-start', 'test-complete', 'test-progress'])

const nodesStore = useNodesStore()
const isTesting = ref(false)
const testProgress = ref(0)
const lastUpdateTime = ref('从未')
const showIntervalDialog = ref(false)
const tempRefreshInterval = ref(props.refreshInterval)
let testInterval = null

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return '从未'
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN')
}

// 切换测速状态
const handleToggleTest = (value) => {
  if (value) {
    startAutoTest()
    ElMessage.success('已开启自动测速')
  } else {
    stopAutoTest()
    ElMessage.info('已停止自动测速')
  }
}

// 启动自动测速
const startAutoTest = () => {
  emit('test-start')
  isTesting.value = true
  runSpeedTest()
  testInterval = setInterval(() => {
    runSpeedTest()
  }, props.refreshInterval * 1000)
}

// 停止自动测速
const stopAutoTest = () => {
  isTesting.value = false
  if (testInterval) {
    clearInterval(testInterval)
    testInterval = null
  }
}

// 执行测速
const runSpeedTest = async () => {
  const nodes = nodesStore.allNodes
  let completed = 0
  const total = nodes.length
  
  testProgress.value = 0
  
  // 模拟测速过程
  for (const node of nodes) {
    // 生成模拟测速数据
    const result = generateMockSpeedTest(node)
    
    // 更新节点数据
    nodesStore.updateNode(node.id, {
      latency: result.latency,
      status: calculateNodeStatus(result.latency),
      lastTestTime: result.timestamp
    })
    
    // 添加测速历史记录
    nodesStore.addSpeedTestRecord({
      nodeId: node.id,
      latency: result.latency,
      status: result.success ? 'success' : 'failed'
    })
    
    completed++
    testProgress.value = Math.round((completed / total) * 100)
    
    emit('test-progress', {
      nodeId: node.id,
      progress: testProgress.value,
      total,
      completed
    })
    
    // 模拟网络延迟，避免所有节点同时更新
    await new Promise(resolve => setTimeout(resolve, 50))
  }
  
  lastUpdateTime.value = formatTime(Date.now())
  emit('test-complete', { success: true })
}

// 手动测速
const handleManualTest = () => {
  runSpeedTest()
}

// 调整刷新间隔
const handleRefreshIntervalChange = () => {
  tempRefreshInterval.value = props.refreshInterval
  showIntervalDialog.value = true
}

// 确认间隔变更
const confirmIntervalChange = () => {
  showIntervalDialog.value = false
  emit('interval-change', tempRefreshInterval.value)
  
  // 如果正在测速，重启定时器
  if (isTesting.value) {
    stopAutoTest()
    startAutoTest()
  }
  
  ElMessage.success(`刷新间隔已设置为 ${tempRefreshInterval.value} 秒`)
}

onUnmounted(() => {
  stopAutoTest()
})
</script>

<style scoped>
.speed-test-control {
  background: white;
  border-radius: 6px;
  padding: 12px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
  height: 30%;
  display: flex;
  flex-direction: column;
}

.control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  flex-shrink: 0;
}

.control-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.control-info {
  flex: 1;
  margin-bottom: 10px;
  overflow-y: auto;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 12px;
}

.info-label {
  color: #666;
}

.info-value {
  color: #333;
  font-weight: 500;
}

.control-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.control-actions .el-button {
  flex: 1;
  padding: 8px 12px;
  font-size: 12px;
}
</style>