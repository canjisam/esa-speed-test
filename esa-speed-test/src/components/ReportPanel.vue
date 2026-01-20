<template>
  <div class="report-panel">
    <div class="report-header">
      <h3>测速报告</h3>
      <div class="header-actions">
        <el-select v-model="selectedDays" size="small" style="width: 120px; margin-right: 10px;">
          <el-option label="最近1天" :value="1" />
          <el-option label="最近3天" :value="3" />
          <el-option label="最近7天" :value="7" />
          <el-option label="最近30天" :value="30" />
        </el-select>
        <el-button size="small" @click="generateReport" :icon="Refresh">生成报告</el-button>
        <el-button size="small" type="primary" @click="exportReport" :icon="Download">导出CSV</el-button>
      </div>
    </div>
    
    <div v-if="report" class="report-content">
      <!-- 报告摘要 -->
      <div class="report-summary">
        <div class="summary-card">
          <div class="summary-title">节点总数</div>
          <div class="summary-value">{{ report.summary.totalNodes }}</div>
        </div>
        <div class="summary-card">
          <div class="summary-title">总测试次数</div>
          <div class="summary-value">{{ report.summary.totalTests }}</div>
        </div>
        <div class="summary-card">
          <div class="summary-title">平均延迟</div>
          <div class="summary-value">{{ report.summary.averageLatency }} ms</div>
        </div>
        <div class="summary-card">
          <div class="summary-title">平均稳定性</div>
          <div class="summary-value">{{ report.summary.averageStability }}%</div>
        </div>
        <div class="summary-card">
          <div class="summary-title">平均成功率</div>
          <div class="summary-value">{{ report.summary.averageSuccessRate }}%</div>
        </div>
        <div class="summary-card">
          <div class="summary-title">平均可用性</div>
          <div class="summary-value">{{ report.summary.averageUptime }}%</div>
        </div>
      </div>
      
      <!-- 地区统计 -->
      <div class="region-stats">
        <h4>地区统计</h4>
        <el-table :data="regionStatsList" stripe style="width: 100%">
          <el-table-column prop="region" label="地区" width="120" />
          <el-table-column prop="count" label="节点数" width="80" />
          <el-table-column prop="averageLatency" label="平均延迟" width="120">
            <template #default="{ row }">
              <span :class="getLatencyClass(row.averageLatency)">{{ row.averageLatency }} ms</span>
            </template>
          </el-table-column>
          <el-table-column prop="stability" label="稳定性" width="100">
            <template #default="{ row }">
              <el-progress :percentage="row.stability" :stroke-width="8" />
            </template>
          </el-table-column>
          <el-table-column prop="uptime" label="可用性" width="100">
            <template #default="{ row }">
              <el-progress :percentage="row.uptime" :stroke-width="8" />
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- 节点详情 -->
      <div class="node-details">
        <h4>节点详情</h4>
        <el-table :data="report.nodeStats" stripe style="width: 100%" max-height="400">
          <el-table-column prop="nodeName" label="节点名称" width="150" />
          <el-table-column prop="region" label="地区" width="80" />
          <el-table-column prop="totalTests" label="测试次数" width="80" />
          <el-table-column prop="averageLatency" label="平均延迟" width="100" sortable>
            <template #default="{ row }">
              <span :class="getLatencyClass(row.averageLatency)">{{ row.averageLatency }} ms</span>
            </template>
          </el-table-column>
          <el-table-column prop="minLatency" label="最小延迟" width="100" />
          <el-table-column prop="maxLatency" label="最大延迟" width="100" />
          <el-table-column prop="medianLatency" label="中位数延迟" width="120" />
          <el-table-column prop="stdDev" label="标准差" width="80" />
          <el-table-column prop="stability" label="稳定性" width="100">
            <template #default="{ row }">
              <el-progress :percentage="row.stability" :stroke-width="6" />
            </template>
          </el-table-column>
          <el-table-column prop="successRate" label="成功率" width="100">
            <template #default="{ row }">
              <el-progress :percentage="row.successRate" :stroke-width="6" />
            </template>
          </el-table-column>
          <el-table-column prop="uptime" label="可用性" width="100">
            <template #default="{ row }">
              <el-progress :percentage="row.uptime" :stroke-width="6" />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    
    <div v-else class="empty-state">
      <el-empty description="点击生成报告查看数据" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Download } from '@element-plus/icons-vue'
import { useNodesStore } from '../stores/nodes'
import { generateReport, exportReportToCSV, downloadCSV } from '../services/report'

const nodesStore = useNodesStore()
const selectedDays = ref(7)
const report = ref(null)

// 地区统计列表
const regionStatsList = computed(() => {
  if (!report.value) return []
  return Object.entries(report.value.regionStats).map(([region, stats]) => ({
    region,
    ...stats
  }))
})

// 获取延迟样式类
const getLatencyClass = (latency) => {
  if (latency < 100) return 'latency-excellent'
  if (latency < 150) return 'latency-good'
  if (latency < 200) return 'latency-fair'
  return 'latency-poor'
}

// 生成报告
const generateReport = () => {
  try {
    report.value = generateReport(nodesStore.allNodes, selectedDays.value)
    ElMessage.success('报告生成成功')
  } catch (error) {
    console.error('生成报告失败:', error)
    ElMessage.error('生成报告失败')
  }
}

// 导出报告
const exportReport = () => {
  if (!report.value) {
    ElMessage.warning('请先生成报告')
    return
  }
  
  try {
    const csvContent = exportReportToCSV(report.value)
    const filename = `speed-test-report-${new Date().toISOString().split('T')[0]}.csv`
    downloadCSV(csvContent, filename)
    ElMessage.success('报告导出成功')
  } catch (error) {
    console.error('导出报告失败:', error)
    ElMessage.error('导出报告失败')
  }
}
</script>

<style scoped>
.report-panel {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.report-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.report-content {
  max-height: 600px;
  overflow-y: auto;
}

.report-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.summary-card {
  padding: 16px;
  background: #f5f5f5;
  border-radius: 6px;
  text-align: center;
}

.summary-title {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.region-stats,
.node-details {
  margin-bottom: 24px;
}

.region-stats h4,
.node-details h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.latency-excellent {
  color: #52c41a;
  font-weight: 600;
}

.latency-good {
  color: #1890ff;
  font-weight: 600;
}

.latency-fair {
  color: #faad14;
  font-weight: 600;
}

.latency-poor {
  color: #ff4d4f;
  font-weight: 600;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

/* 滚动条样式 */
.report-content::-webkit-scrollbar {
  width: 6px;
}

.report-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.report-content::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.report-content::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>