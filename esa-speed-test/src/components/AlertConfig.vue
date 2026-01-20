<template>
  <div class="alert-config">
    <el-dialog
      v-model="showDialog"
      title="告警配置"
      width="600px"
      :before-close="handleClose"
    >
      <el-form :model="config" label-width="150px">
        <el-divider content-position="left">延迟阈值</el-divider>
        
        <el-form-item label="在线阈值 (ms)">
          <el-input-number
            v-model="config.latencyThresholds.online"
            :min="10"
            :max="1000"
            :step="10"
          />
          <span class="form-tip">延迟低于此值视为在线</span>
        </el-form-item>
        
        <el-form-item label="拥堵阈值 (ms)">
          <el-input-number
            v-model="config.latencyThresholds.congested"
            :min="10"
            :max="2000"
            :step="10"
          />
          <span class="form-tip">延迟在此值之间视为拥堵</span>
        </el-form-item>
        
        <el-form-item label="离线阈值 (ms)">
          <el-input-number
            v-model="config.latencyThresholds.offline"
            :min="10"
            :max="5000"
            :step="10"
          />
          <span class="form-tip">延迟超过此值视为离线</span>
        </el-form-item>
        
        <el-divider content-position="left">丢包率阈值 (%)</el-divider>
        
        <el-form-item label="在线阈值">
          <el-input-number
            v-model="config.packetLossThresholds.online"
            :min="0"
            :max="100"
            :step="1"
          />
          <span class="form-tip">丢包率低于此值视为在线</span>
        </el-form-item>
        
        <el-form-item label="拥堵阈值">
          <el-input-number
            v-model="config.packetLossThresholds.congested"
            :min="0"
            :max="100"
            :step="1"
          />
          <span class="form-tip">丢包率在此值之间视为拥堵</span>
        </el-form-item>
        
        <el-form-item label="离线阈值">
          <el-input-number
            v-model="config.packetLossThresholds.offline"
            :min="0"
            :max="100"
            :step="1"
          />
          <span class="form-tip">丢包率超过此值视为离线</span>
        </el-form-item>
        
        <el-divider content-position="left">告警开关</el-divider>
        
        <el-form-item label="节点离线告警">
          <el-switch v-model="config.alerts.nodeOffline" />
          <span class="form-tip">节点状态变为离线时触发</span>
        </el-form-item>
        
        <el-form-item label="高延迟告警">
          <el-switch v-model="config.alerts.latencyHigh" />
          <span class="form-tip">延迟超过拥堵阈值时触发</span>
        </el-form-item>
        
        <el-form-item label="延迟突增告警">
          <el-switch v-model="config.alerts.latencySpike" />
          <span class="form-tip">延迟突然增加时触发</span>
        </el-form-item>
        
        <el-form-item label="稳定性低告警">
          <el-switch v-model="config.alerts.stabilityLow" />
          <span class="form-tip">节点稳定性较差时触发</span>
        </el-form-item>
        
        <el-divider content-position="left">高级设置</el-divider>
        
        <el-form-item label="延迟突增倍数">
          <el-input-number
            v-model="config.latencySpikeThreshold"
            :min="1.1"
            :max="5.0"
            :step="0.1"
            :precision="1"
          />
          <span class="form-tip">延迟相对于平均值的倍数</span>
        </el-form-item>
        
        <el-form-item label="稳定性阈值">
          <el-input-number
            v-model="config.stabilityThreshold"
            :min="10"
            :max="200"
            :step="10"
          />
          <span class="form-tip">延迟标准差超过此值视为不稳定</span>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleReset">重置默认</el-button>
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAlertConfig, updateAlertConfig, resetAlertConfig } from '../services/alert'

const showDialog = ref(false)
const config = ref({})

// 打开对话框
const open = () => {
  config.value = getAlertConfig()
  showDialog.value = true
}

// 关闭对话框
const handleClose = () => {
  showDialog.value = false
}

// 保存配置
const handleSave = () => {
  updateAlertConfig(config.value)
  ElMessage.success('配置已保存')
  handleClose()
}

// 重置配置
const handleReset = () => {
  resetAlertConfig()
  config.value = getAlertConfig()
  ElMessage.success('已重置为默认配置')
}

// 暴露方法
defineExpose({
  open
})
</script>

<style scoped>
.form-tip {
  margin-left: 12px;
  font-size: 12px;
  color: var(--text-muted);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Element Plus Form 暗色覆盖 */
:deep(.el-form-item__label) {
  color: var(--text-secondary) !important;
}

:deep(.el-input-number) {
  --el-input-bg-color: var(--bg-tertiary);
  --el-input-border-color: var(--border-color);
  --el-input-text-color: var(--text-primary);
  --el-input-placeholder-color: var(--text-muted);
}

:deep(.el-input-number .el-input__wrapper) {
  background-color: var(--bg-tertiary) !important;
  border-color: var(--border-color) !important;
}

:deep(.el-input-number:hover .el-input__wrapper) {
  border-color: var(--neon-blue) !important;
}

:deep(.el-input-number.is-focus .el-input__wrapper) {
  border-color: var(--neon-cyan) !important;
  box-shadow: 0 0 0 1px var(--neon-cyan) !important;
}

:deep(.el-divider__text) {
  background: var(--bg-secondary);
  color: var(--text-secondary) !important;
}

:deep(.el-divider) {
  border-color: var(--border-color) !important;
}

:deep(.el-switch) {
  --el-switch-off-color: var(--bg-tertiary);
}
</style>