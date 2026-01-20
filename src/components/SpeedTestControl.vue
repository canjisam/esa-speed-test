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
        @click="toggleIntervalSettings"
        :class="{ 'active': showIntervalSettings }"
      >
        调整间隔
        <el-icon class="arrow-icon" :class="{ 'rotate': showIntervalSettings }">
          <ArrowDown />
        </el-icon>
      </el-button>
    </div>

    <transition name="expand">
      <div v-if="showIntervalSettings" class="interval-settings">
        <div class="current-value">
          <span class="value-label">{{ tempRefreshInterval }}s</span>
        </div>
        
        <div class="slider-container">
          <el-slider
            v-model="tempRefreshInterval"
            :min="5"
            :max="60"
            :step="5"
            :show-tooltip="false"
            size="small"
            @change="handleSliderChange"
          />
        </div>
        
        <div class="preset-buttons">
          <el-button
            v-for="preset in presets"
            :key="preset.value"
            size="small"
            :type="tempRefreshInterval === preset.value ? 'primary' : 'default'"
            @click="applyPreset(preset.value)"
          >
            {{ preset.label }}
          </el-button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
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
const showIntervalSettings = ref(false)
const tempRefreshInterval = ref(props.refreshInterval)
let testInterval = null

// 预设间隔
const presets = [
  { label: '5s', value: 5 },
  { label: '10s', value: 10 },
  { label: '30s', value: 30 },
  { label: '60s', value: 60 }
]

// 切换间隔设置面板
const toggleIntervalSettings = () => {
  showIntervalSettings.value = !showIntervalSettings.value
}

// 处理滑块变化
const handleSliderChange = (value) => {
  tempRefreshInterval.value = value
  emit('interval-change', value)
  
  if (isTesting.value) {
    stopAutoTest()
    startAutoTest()
  }
}

// 应用预设值
const applyPreset = (value) => {
  tempRefreshInterval.value = value
  emit('interval-change', value)
  
  if (isTesting.value) {
    stopAutoTest()
    startAutoTest()
  }
}

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
  height: 30%;
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

.control-actions .el-button.active {
  background: linear-gradient(135deg, rgba(0, 245, 255, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%);
  border-color: var(--neon-cyan);
  box-shadow: 0 0 15px rgba(0, 245, 255, 0.2);
}

.arrow-icon {
  margin-left: 4px;
  transition: transform 0.3s;
  font-size: 12px;
}

.arrow-icon.rotate {
  transform: rotate(180deg);
}

/* 展开动画 */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 200px;
  opacity: 1;
}

/* 内联设置面板（保持缩小尺寸） */
.interval-settings {
  margin-top: 3px;
  padding-top: 5px;
  border-top: 1px solid var(--border-color);
}

.current-value {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
  padding: 3px;
  background: linear-gradient(135deg, rgba(0, 245, 255, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%);
  border-radius: 4px;
  border: 1px solid rgba(0, 245, 255, 0.3);
  box-shadow: 0 0 8px rgba(0, 245, 255, 0.15);
}

.value-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--neon-cyan);
  font-family: 'SF Mono', 'Monaco', monospace;
  text-shadow: 0 0 8px rgba(0, 245, 255, 0.5);
}

.slider-container {
  margin-bottom: 5px;
  padding: 0 2px;
}

.preset-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2px;
}

.preset-buttons .el-button {
  padding: 2px 3px;
  font-size: 5px;
  font-weight: 500;
  transition: all 0.3s;
}

.preset-buttons .el-button:hover {
  transform: translateY(-0.5px);
  box-shadow: 0 2px 4px rgba(0, 245, 255, 0.3);
}

.preset-buttons .el-button--primary {
  background: linear-gradient(135deg, #00f5ff 0%, #10b981 100%);
  border-color: transparent;
  box-shadow: 0 0 6px rgba(0, 245, 255, 0.4);
}
</style>