<template>
  <div class="latency-chart">
    <div class="chart-header">
      <h3>
        <span class="header-icon">📊</span>
        延迟趋势
      </h3>
      <el-select
        v-model="selectedNodeId"
        placeholder="选择节点"
        size="small"
        style="width: 200px"
        @change="handleNodeChange"
      >
        <el-option
          v-for="node in nodes"
          :key="node.id"
          :label="node.name"
          :value="node.id"
        />
      </el-select>
    </div>
    <div ref="chartRef" class="chart-container"></div>
    <div class="chart-stats">
      <div class="stat-item">
        <span class="stat-label">平均</span>
        <span class="stat-value avg">{{ avgLatency }}ms</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">最大</span>
        <span class="stat-value max">{{ maxLatency }}ms</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">最小</span>
        <span class="stat-value min">{{ minLatency }}ms</span>
      </div>
    </div>
    <div class="chart-legend">
      <div class="legend-item">
        <span class="legend-color online"></span>
        <span class="legend-text">在线 (&lt;150ms)</span>
      </div>
      <div class="legend-item">
        <span class="legend-color congested"></span>
        <span class="legend-text">拥堵 (150-300ms)</span>
      </div>
      <div class="legend-item">
        <span class="legend-color offline"></span>
        <span class="legend-text">离线 (≥300ms)</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import * as echarts from 'echarts'
import { useNodesStore } from '../stores/nodes'

const props = defineProps({
  nodeId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['node-change'])

const nodesStore = useNodesStore()
const chartRef = ref(null)
const chartInstance = ref(null)
const selectedNodeId = ref(props.nodeId)

const nodes = computed(() => nodesStore.allNodes)
const speedTestHistory = computed(() => nodesStore.speedTestHistory)

// 计算统计数据
const avgLatency = computed(() => {
  const history = getNodeHistory(selectedNodeId.value)
  const latencies = history.map(r => r.latency).filter(l => l > 0)
  if (latencies.length === 0) return 0
  return Math.round(latencies.reduce((sum, val) => sum + val, 0) / latencies.length)
})

const maxLatency = computed(() => {
  const history = getNodeHistory(selectedNodeId.value)
  const latencies = history.map(r => r.latency).filter(l => l > 0)
  return latencies.length > 0 ? Math.max(...latencies) : 0
})

const minLatency = computed(() => {
  const history = getNodeHistory(selectedNodeId.value)
  const latencies = history.map(r => r.latency).filter(l => l > 0)
  return latencies.length > 0 ? Math.min(...latencies) : 0
})

// 获取节点的测速历史数据
const getNodeHistory = (nodeId) => {
  return speedTestHistory.value
    .filter(record => record.nodeId === nodeId)
    .slice(-20)
}

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return

  chartInstance.value = echarts.init(chartRef.value)
  updateChart()
}

// 更新图表
const updateChart = () => {
  if (!chartInstance.value || !selectedNodeId.value) return

  const history = getNodeHistory(selectedNodeId.value)
  const times = history.map(record => {
    const date = new Date(record.timestamp)
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  })
  const latencies = history.map(record => record.latency)

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      borderColor: 'rgba(0, 245, 255, 0.3)',
      borderWidth: 1,
      textStyle: {
        color: '#f9fafb'
      },
      padding: [12, 16],
      formatter: (params) => {
        const param = params[0]
        const status = param.value < 150 ? '在线' : param.value < 300 ? '拥堵' : '离线'
        return `
          <div style="min-width: 140px;">
            <div style="font-weight: 600; font-size: 13px; margin-bottom: 8px; color: #00f5ff;">${param.name}</div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #9ca3af;">延迟:</span>
              <span style="font-size: 16px; font-weight: 600; color: #00f5ff; text-shadow: 0 0 10px rgba(0, 245, 255, 0.4);">${param.value} ms</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #9ca3af;">状态:</span>
              <span style="font-weight: 500; color: ${param.value < 150 ? '#10b981' : param.value < 300 ? '#f59e0b' : '#ef4444'};">${status}</span>
            </div>
          </div>
        `
      }
    },
    grid: {
      left: '10%',
      right: '6%',
      bottom: '20%',
      top: '12%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: times,
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.15)',
          width: 1
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        rotate: 45,
        fontSize: 10,
        color: '#9ca3af',
        margin: 8
      }
    },
    yAxis: {
      type: 'value',
      name: 'ms',
      nameLocation: 'end',
      nameTextStyle: {
        fontSize: 10,
        color: '#6b7280',
        padding: [0, 0, 0, 8]
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        formatter: '{value}',
        fontSize: 10,
        color: '#6b7280',
        padding: [0, 0, 0, 8]
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: 'rgba(255, 255, 255, 0.06)'
        }
      },
      min: 0
    },
    visualMap: {
      show: false,
      pieces: [
        { gt: 0, lte: 150, color: '#10b981' },
        { gt: 150, lte: 300, color: '#f59e0b' },
        { gt: 300, color: '#ef4444' }
      ]
    },
    series: [
      {
        name: '延迟',
        type: 'line',
        data: latencies,
        smooth: 0.4,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: '#00f5ff',
          shadowColor: 'rgba(0, 245, 255, 0.6)',
          shadowBlur: 12
        },
        itemStyle: {
          color: '#00f5ff',
          borderColor: '#fff',
          borderWidth: 2,
          shadowColor: 'rgba(0, 245, 255, 0.8)',
          shadowBlur: 10
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 245, 255, 0.25)' },
              { offset: 0.5, color: 'rgba(0, 245, 255, 0.1)' },
              { offset: 1, color: 'rgba(0, 245, 255, 0)' }
            ]
          },
          shadowColor: 'rgba(0, 245, 255, 0.3)',
          shadowBlur: 15
        },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: {
            width: 1.5
          },
          data: [
            { 
              yAxis: 150, 
              name: '拥堵阈值', 
              label: { 
                show: true, 
                position: 'end',
                formatter: '150ms',
                fontSize: 10,
                color: '#f59e0b',
                padding: [0, 0, 4, 0]
              },
              lineStyle: { color: '#f59e0b', type: 'dashed', opacity: 0.6 }
            },
            { 
              yAxis: 300, 
              name: '离线阈值', 
              label: { 
                show: true, 
                position: 'end',
                formatter: '300ms',
                fontSize: 10,
                color: '#ef4444',
                padding: [0, 0, 4, 0]
              },
              lineStyle: { color: '#ef4444', type: 'dashed', opacity: 0.6 }
            }
          ]
        },
        markPoint: {
          symbol: 'circle',
          symbolSize: 45,
          itemStyle: {
            color: '#00f5ff',
            borderColor: '#fff',
            borderWidth: 2,
            shadowColor: 'rgba(0, 245, 255, 0.6)',
            shadowBlur: 15
          },
          label: {
            fontSize: 10,
            fontWeight: 600,
            color: '#fff'
          },
          data: [
            { type: 'max', name: '最大值', symbolOffset: [0, -10] },
            { type: 'min', name: '最小值', symbolOffset: [0, 10] }
          ]
        }
      }
    ]
  }

  chartInstance.value.setOption(option, true)
}

// 处理节点变化
const handleNodeChange = (nodeId) => {
  emit('node-change', nodeId)
  updateChart()
}

// 监听节点变化
watch(() => props.nodeId, (newNodeId) => {
  if (newNodeId) {
    selectedNodeId.value = newNodeId
    updateChart()
  }
})

// 监听测速历史变化
watch(speedTestHistory, () => {
  if (selectedNodeId.value) {
    updateChart()
  }
}, { deep: true })

// 响应式调整
const handleResize = () => {
  if (chartInstance.value) {
    chartInstance.value.resize()
  }
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
  
  if (!selectedNodeId.value && nodes.value.length > 0) {
    selectedNodeId.value = nodes.value[0].id
    updateChart()
  }
})

onUnmounted(() => {
  if (chartInstance.value) {
    chartInstance.value.dispose()
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.latency-chart {
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  box-shadow: 
    var(--shadow-md),
    var(--shadow-glow),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
  height: 68%;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(20px);
  transition: all var(--transition-normal);
}

.latency-chart:hover {
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 
    var(--shadow-lg),
    0 0 45px rgba(59, 130, 246, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  flex-shrink: 0;
}

.chart-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.header-icon {
  font-size: 18px;
}

.chart-container {
  width: 100%;
  height: 100%;
  min-height: 180px;
  flex: 1;
}

.chart-stats {
  display: flex;
  justify-content: center;
  gap: var(--spacing-xl);
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  font-family: 'SF Mono', 'Monaco', monospace;
}

.stat-value.avg {
  color: var(--neon-cyan);
  text-shadow: 0 0 15px rgba(0, 245, 255, 0.4);
}

.stat-value.max {
  color: var(--status-congested);
  text-shadow: 0 0 15px rgba(245, 158, 11, 0.4);
}

.stat-value.min {
  color: var(--status-online);
  text-shadow: 0 0 15px rgba(16, 185, 129, 0.4);
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-sm);
  flex-shrink: 0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 500;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  position: relative;
}

.legend-color::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 4px;
  opacity: 0.4;
}

.legend-color.online {
  background: var(--status-online);
  box-shadow: 0 0 12px var(--status-online-glow);
}

.legend-color.congested {
  background: var(--status-congested);
  box-shadow: 0 0 12px var(--status-congested-glow);
}

.legend-color.offline {
  background: var(--status-offline);
  box-shadow: 0 0 12px var(--status-offline-glow);
}
</style>
