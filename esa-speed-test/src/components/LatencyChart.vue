<template>
  <div class="latency-chart">
    <div class="chart-header">
      <h3>延迟趋势</h3>
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
        <span class="legend-text">离线 (&ge;300ms)</span>
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

// 获取节点的测速历史数据
const getNodeHistory = (nodeId) => {
  return speedTestHistory.value
    .filter(record => record.nodeId === nodeId)
    .slice(-20) // 只显示最近 20 条记录
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
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
  })
  const latencies = history.map(record => record.latency)

  // 计算统计数据
  const avgLatency = latencies.length > 0
    ? Math.round(latencies.reduce((sum, val) => sum + val, 0) / latencies.length)
    : 0
  const maxLatency = latencies.length > 0 ? Math.max(...latencies) : 0
  const minLatency = latencies.length > 0 ? Math.min(...latencies) : 0

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const param = params[0]
        return `
          <div style="padding: 10px;">
            <div style="margin-bottom: 4px; font-weight: 600; font-size: 12px;">${param.name}</div>
            <div style="font-size: 12px;">延迟: <strong style="font-size: 14px;">${param.value} ms</strong></div>
          </div>
        `
      }
    },
    grid: {
      left: '10%',
      right: '5%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: times,
      axisLabel: {
        rotate: 45,
        fontSize: 10,
        color: '#666'
      }
    },
    yAxis: {
      type: 'value',
      name: '延迟 (ms)',
      nameTextStyle: {
        fontSize: 11,
        fontWeight: 600
      },
      axisLabel: {
        formatter: '{value} ms',
        fontSize: 10,
        color: '#666'
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#e8e8e8'
        }
      }
    },
    visualMap: {
      show: false,
      pieces: [
        { gt: 0, lte: 150, color: '#52c41a' },
        { gt: 150, lte: 300, color: '#faad14' },
        { gt: 300, color: '#ff4d4f' }
      ]
    },
    series: [
      {
        name: '延迟',
        type: 'line',
        data: latencies,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 2
        },
        areaStyle: {
          opacity: 0.1
        },
        markLine: {
          silent: true,
          lineStyle: {
            width: 2
          },
          data: [
            { yAxis: 150, name: '拥堵阈值', lineStyle: { color: '#faad14', type: 'dashed' } },
            { yAxis: 300, name: '离线阈值', lineStyle: { color: '#ff4d4f', type: 'dashed' } }
          ]
        },
        markPoint: {
          symbolSize: 40,
          label: {
            fontSize: 10,
            fontWeight: 600
          },
          data: [
            { type: 'max', name: '最大值' },
            { type: 'min', name: '最小值' }
          ]
        }
      }
    ],
    title: {
      left: 'center',
      top: 5,
      text: `平均: ${avgLatency}ms | 最大: ${maxLatency}ms | 最小: ${minLatency}ms`,
      textStyle: {
        fontSize: 12,
        fontWeight: 600,
        color: '#666'
      }
    }
  }

  chartInstance.value.setOption(option)
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
})

// 响应式调整
const handleResize = () => {
  if (chartInstance.value) {
    chartInstance.value.resize()
  }
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
  
  // 如果有选中的节点，自动选择第一个
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
  background: white;
  border-radius: 6px;
  padding: 12px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
  height: 70%;
  display: flex;
  flex-direction: column;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.chart-header h3 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.chart-container {
  width: 100%;
  height: 100%;
  min-height: 200px;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid #e8e8e8;
  flex-shrink: 0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #666;
  font-weight: 500;
}

.legend-color {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.legend-color.online {
  background: #52c41a;
}

.legend-color.congested {
  background: #faad14;
}

.legend-color.offline {
  background: #ff4d4f;
}
</style>