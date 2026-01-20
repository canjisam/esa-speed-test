<template>
  <div class="speed-test-control">
    <div class="control-header">
      <h3>实时测速</h3>
      <el-switch
        v-model="isTesting"
        @change="handleToggleTest"
        size="small"
      />
    </div>
    
    <div class="control-info">
      <div class="info-row">
        <span class="info-label">更新:</span>
        <span class="info-value">{{ lastUpdateTime }}</span>
        <span class="info-divider">|</span>
        <span class="info-label">间隔:</span>
        <span class="info-value">{{ refreshInterval }}s</span>
      </div>
      
      <div class="progress-section">
        <div class="progress-row">
          <span class="progress-label">进度</span>
          <span class="progress-value">{{ testProgress }}%</span>
        </div>
        <el-progress 
          :percentage="testProgress" 
          :status="testProgress === 100 ? 'success' : ''"
          :stroke-width="4"
          :show-text="false"
        />
      </div>
    </div>

    <div class="control-actions">
      <el-button 
        type="primary" 
        size="small"
        @click="handleManualTest"
        :loading="isTesting"
        :disabled="isTesting"
      >
        立即测速
      </el-button>
      
      <el-button 
        size="small"
        @click="handleRefreshIntervalChange"
      >
        调整间隔
      </el-button>
    </div>

    <el-dialog
      v-model="showIntervalDialog"
      title="设置刷新间隔"
      width="280px"
    >
      <el-slider
        v-model="tempRefreshInterval"
        :min="5"
        :max="60"
        :step="5"
        :marks="{ 5: '5s', 30: '30s', 60: '60s' }"
      />
      <template #footer>
        <div class="dialog-actions">
          <el-button size="small" @click="showIntervalDialog = false">取消</el-button>
          <el-button size="small" type="primary" @click="confirmIntervalChange">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
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

const formatTime = (timestamp) => {
  if (!timestamp) return '从未'
  const date = new Date(timestamp)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

const handleToggleTest = (value) => {
  if (value) {
    startAutoTest()
    ElMessage.success('已开启自动测速')
  } else {
    stopAutoTest()
    ElMessage.info('已停止自动测速')
  }
}

const startAutoTest = () => {
  emit('test-start')
  isTesting.value = true
  runSpeedTest()
  testInterval = setInterval(() => {
    runSpeedTest()
  }, props.refreshInterval * 1000)
}

const stopAutoTest = () => {
  isTesting.value = false
  if (testInterval) {
    clearInterval(testInterval)
    testInterval = null
  }
}

const runSpeedTest = async () => {
  const nodes = nodesStore.allNodes
  let completed = 0
  const total = nodes.length
  
  testProgress.value = 0
  
  for (const node of nodes) {
    const result = generateMockSpeedTest(node)
    
    nodesStore.updateNode(node.id, {
      latency: result.latency,
      status: calculateNodeStatus(result.latency),
      lastTestTime: result.timestamp
    })
    
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
    
    await new Promise(resolve => setTimeout(resolve, 50))
  }
  
  lastUpdateTime.value = formatTime(Date.now())
  emit('test-complete', { success: true })
}

const handleManualTest = () => {
  runSpeedTest()
}

const handleRefreshIntervalChange = () => {
  tempRefreshInterval.value = props.refreshInterval
  showIntervalDialog.value = true
}

const confirmIntervalChange = () => {
  showIntervalDialog.value = false
  emit('interval-change', tempRefreshInterval.value)
  
  if (isTesting.value) {
    stopAutoTest()
    startAutoTest()
  }
  
  ElMessage.success(`刷新间隔: ${tempRefreshInterval.value}秒`)
}

onUnmounted(() => {
  stopAutoTest()
})
</script>

<style scoped>
.speed-test-control {
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: 10px;
  box-shadow: var(--shadow-sm), var(--shadow-glow);
  height: 26%;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(20px);
}

.control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.control-header h3 {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.control-info {
  flex: 1;
  margin-bottom: 8px;
  overflow-y: auto;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  margin-bottom: 8px;
}

.info-label {
  color: var(--text-muted);
}

.info-value {
  color: var(--neon-cyan);
  font-weight: 500;
  font-family: 'SF Mono', monospace;
}

.info-divider {
  color: var(--border-color);
}

.progress-section {
  background: var(--bg-tertiary);
  border-radius: var(--border-radius-sm);
  padding: 8px;
}

.progress-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.progress-label {
  font-size: 10px;
  color: var(--text-secondary);
}

.progress-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--neon-cyan);
  font-family: 'SF Mono', monospace;
}

.control-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.control-actions .el-button {
  flex: 1;
  padding: 6px 10px;
  font-size: 11px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.dialog-actions .el-button {
  padding: 6px 12px;
  font-size: 12px;
}
</style>