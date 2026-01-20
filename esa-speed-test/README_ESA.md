# ESA测速集成说明

## 功能概述

本项目已集成阿里云ESA测速功能，支持真实ESA节点测速和模拟测速两种模式。

## 文件结构

```
esa-speed-test/
├── .env.example              # 环境变量配置模板
├── .gitignore               # Git忽略文件配置
├── src/
│   ├── config/
│   │   └── esaConfig.js     # ESA配置管理
│   ├── services/
│   │   ├── esaClient.js     # ESA测速客户端
│   │   ├── esaSpeedTest.js  # ESA测速服务
│   │   └── speedTest.js     # 测速服务（已更新）
│   └── components/
│       └── ESAConfigDialog.vue # ESA配置对话框组件
```

## 配置说明

### 1. 环境变量配置

复制 `.env.example` 为 `.env` 并填写配置：

```env
ESA_APP_ID=your_app_id_here
ESA_ACCESS_KEY_ID=your_access_key_id_here
ESA_ACCESS_KEY_SECRET=your_access_key_secret_here
ESA_TEST_URL=https://your-domain.com/test
ESA_TEST_TIMEOUT=5000
ESA_TEST_COUNT=3
```

### 2. ESA节点配置

在 `src/config/esaConfig.js` 中配置ESA节点列表：

```javascript
export const ESA_NODES = [
  {
    id: 'esa-cn-hangzhou',
    name: 'ESA 杭州',
    region: '亚太',
    country: '中国',
    city: '杭州',
    lat: 30.25,
    lng: 120.17,
    url: 'https://your-esa-node.com/test'  // 修改为真实的ESA节点URL
  }
  // 添加更多节点...
]
```

### 3. Vite配置（可选）

在 `vite.config.js` 中添加环境变量加载：

```javascript
export default defineConfig({
  // ...其他配置
  define: {
    'import.meta.env.VITE_ESA_APP_ID': JSON.stringify(process.env.ESA_APP_ID),
    'import.meta.env.VITE_ESA_ACCESS_KEY_ID': JSON.stringify(process.env.ESA_ACCESS_KEY_ID),
    'import.meta.env.VITE_ESA_ACCESS_KEY_SECRET': JSON.stringify(process.env.ESA_ACCESS_KEY_SECRET),
  }
})
```

## 使用方法

### 1. 初始化测速服务

```javascript
import { initSpeedTest } from './services/speedTest.js'

// 初始化（自动检测配置）
initSpeedTest()
```

### 2. 使用配置对话框

```vue
<template>
  <el-button @click="openConfig">ESA配置</el-button>
  <ESAConfigDialog ref="configDialogRef" @config-updated="handleConfigUpdated" />
</template>

<script setup>
import ESAConfigDialog from './components/ESAConfigDialog.vue'
import { ref } from 'vue'

const configDialogRef = ref(null)

function openConfig() {
  configDialogRef.value?.open()
}

function handleConfigUpdated(config) {
  console.log('配置已更新:', config)
}
</script>
```

### 3. 测速API

```javascript
import { batchSpeedTest, testNode, isUsingRealESA } from './services/speedTest.js'
import { esaSpeedTestService } from './services/esaSpeedTest.js'

// 检查是否使用真实ESA
console.log('使用真实ESA:', isUsingRealESA())

// 测速单个节点
const result = await testNode(node)

// 批量测速
const results = await batchSpeedTest(nodes, (progress) => {
  console.log(`进度: ${progress.completed}/${progress.total}`)
})

// 使用ESA服务
await esaSpeedTestService.initialize(config)
const stats = esaSpeedTestService.getStatistics(results)
const bestNodes = esaSpeedTestService.getBestNodes(results, 3)
```

## 功能特性

### 1. 双模式支持
- **真实ESA测速**: 使用配置的ESA节点进行真实测速
- **模拟测速**: 未配置时自动使用模拟数据

### 2. 高级功能
- 多次测速取平均值
- 自动重试机制
- 并发控制
- 进度回调
- 统计分析

### 3. 安全性
- 敏感信息不提交到代码仓库
- 支持localStorage本地存储
- 密码输入框隐藏显示

## 注意事项

1. **跨域问题**: 浏览器端直接测速可能遇到CORS限制，建议：
   - 配置ESA节点允许跨域
   - 或使用后端代理

2. **配置安全**:
   - `.env` 文件已添加到 `.gitignore`
   - 不要将真实密钥提交到代码仓库

3. **节点URL**: 需要替换为真实的ESA节点URL

4. **API签名**: 如需调用阿里云ESA API，需实现完整的签名逻辑

## 测试

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 打开浏览器访问 http://localhost:5173
```

## 扩展

如需添加更多ESA节点，在 `src/config/esaConfig.js` 的 `ESA_NODES` 数组中添加即可。

## 问题排查

1. **配置未生效**: 检查 `.env` 文件是否存在且格式正确
2. **测速失败**: 检查节点URL是否可访问
3. **跨域错误**: 检查节点CORS配置