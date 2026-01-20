<template>
  <el-dialog
    v-model="dialogVisible"
    title="ESA配置"
    width="500px"
    @close="handleClose"
  >
    <el-form :model="formData" label-width="120px">
      <el-form-item label="AppID">
        <el-input
          v-model="formData.appId"
          placeholder="请输入ESA AppID"
          type="password"
          show-password
        />
      </el-form-item>
      
      <el-form-item label="AccessKey ID">
        <el-input
          v-model="formData.accessKeyId"
          placeholder="请输入AccessKey ID"
          type="password"
          show-password
        />
      </el-form-item>
      
      <el-form-item label="AccessKey Secret">
        <el-input
          v-model="formData.accessKeySecret"
          placeholder="请输入AccessKey Secret"
          type="password"
          show-password
        />
      </el-form-item>
      
      <el-form-item label="测速URL">
        <el-input
          v-model="formData.testUrl"
          placeholder="请输入测速URL（可选）"
        />
      </el-form-item>
      
      <el-form-item label="超时时间(ms)">
        <el-input-number
          v-model="formData.timeout"
          :min="1000"
          :max="30000"
          :step="1000"
        />
      </el-form-item>
      
      <el-form-item label="测速次数">
        <el-input-number
          v-model="formData.measureCount"
          :min="1"
          :max="10"
        />
      </el-form-item>
    </el-form>
    
    <div class="config-status">
      <el-tag :type="isConfigured ? 'success' : 'warning'">
        {{ isConfigured ? '已配置' : '未配置' }}
      </el-tag>
      <el-tag type="info">当前模式: {{ useRealESA ? '真实ESA测速' : '模拟测速' }}</el-tag>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleReset">重置</el-button>
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getESAConfig, validateESAConfig } from '../config/esaConfig.js'
import { initSpeedTest, isUsingRealESA } from '../services/speedTest.js'

const emit = defineEmits(['config-updated'])

const dialogVisible = ref(false)
const formData = ref({
  appId: '',
  accessKeyId: '',
  accessKeySecret: '',
  testUrl: '',
  timeout: 5000,
  measureCount: 3
})

const isConfigured = computed(() => validateESAConfig(formData.value))
const useRealESA = computed(() => isUsingRealESA())

// 初始化表单数据
function initFormData() {
  const config = getESAConfig()
  formData.value = {
    appId: config.appId || '',
    accessKeyId: config.accessKeyId || '',
    accessKeySecret: config.accessKeySecret || '',
    testUrl: config.testUrl || '',
    timeout: config.timeout || 5000,
    measureCount: config.measureCount || 3
  }
}

// 打开对话框
function open() {
  initFormData()
  dialogVisible.value = true
}

// 关闭对话框
function handleClose() {
  dialogVisible.value = false
}

// 重置配置
function handleReset() {
  initFormData()
  ElMessage.info('已重置为当前配置')
}

// 保存配置
function handleSave() {
  // 保存到localStorage
  localStorage.setItem('esa_config', JSON.stringify(formData.value))
  
  // 初始化测速服务
  initSpeedTest(formData.value)
  
  ElMessage.success('配置已保存')
  emit('config-updated', formData.value)
  handleClose()
}

// 从localStorage加载配置
function loadConfig() {
  const saved = localStorage.getItem('esa_config')
  if (saved) {
    try {
      const config = JSON.parse(saved)
      formData.value = { ...formData.value, ...config }
      initSpeedTest(config)
    } catch (error) {
      console.error('加载ESA配置失败:', error)
    }
  }
}

// 监听配置变化
watch(() => formData.value, (newVal) => {
  localStorage.setItem('esa_config', JSON.stringify(newVal))
}, { deep: true })

// 组件挂载时加载配置
loadConfig()

defineExpose({
  open
})
</script>

<style scoped>
.config-status {
  display: flex;
  gap: 10px;
  margin-top: 16px;
  padding: 12px;
  background: var(--bg-tertiary);
  border-radius: var(--border-radius-md);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>