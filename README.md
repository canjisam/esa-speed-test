# ESA Speed Test - 阿里云节点实时测速面板

> 基于 Vue 3 + Vite 构建的科技风格全球边缘节点实时测速面板，使用阿里云 OSS 真实节点进行测速。

**在线演示**: https://canjisam.github.io/esa-speed-test/

![Demo](https://img.shields.io/badge/demo-online-brightgreen)
![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D)
![Vite](https://img.shields.io/badge/Vite-7.0-646CFF)

## ✨ 特性

- 🚀 **真实测速** - 使用阿里云 OSS 节点进行延迟检测
- 📊 **数据可视化** - 集成 Leaflet 地图 + ECharts 图表
- 🎨 **科技风格** - 暗色主题 + 霓虹光效 + 玻璃拟态
- ⚡ **实时监控** - 自动刷新测速，支持自定义间隔
- 🔔 **智能告警** - 节点状态变化自动通知
- 📈 **数据报告** - 生成详细的测速统计报告
- 🤖 **智能推荐** - 基于地理位置和延迟推荐最佳节点
- 📱 **响应式设计** - 支持多种屏幕尺寸

## 🌍 覆盖节点

### 国内节点（12个）
| 地区 | 节点 |
|------|------|
| 华北 | 青岛、北京、张家口、呼和浩特、乌兰察布 |
| 华东 | 杭州、上海、南京 |
| 华南 | 深圳、河源、广州 |
| 西南 | 成都 |
| 港澳台 | 香港 |

### 国际节点（12个）
| 地区 | 节点 |
|------|------|
| 北美 | 硅谷、弗吉尼亚 |
| 亚太 | 新加坡、悉尼、吉隆坡、雅加达、孟买、东京 |
| 欧洲 | 法兰克福、伦敦 |
| 中东 | 迪拜 |

## 🛠️ 技术栈

- **前端框架**: Vue 3 + Composition API
- **构建工具**: Vite 7
- **UI 组件**: Element Plus
- **地图**: Leaflet
- **图表**: ECharts
- **状态管理**: Pinia
- **路由**: Vue Router

## 📦 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173 将显示介绍页，点击"开始使用"按钮进入测速面板。

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

### 页面说明

- **介绍页** (`/`) - 项目介绍、功能特性、使用指南
- **测速面板** (`/dashboard`) - 实时测速、节点监控、数据分析

## 🚢 GitHub Pages 部署

项目已配置 GitHub Actions 自动部署到 GitHub Pages：

1. Fork 本项目到你的 GitHub 账号
2. 在仓库设置中启用 GitHub Pages
3. Source 选择 `GitHub Actions`
4. 推送代码到 `main` 分支
5. 自动触发部署流程
6. 部署完成后访问 `https://your-username.github.io/esa-speed-test/`

## 📁 项目结构

```
esa-speed-test/
├── src/
│   ├── components/           # 组件
│   │   ├── NodeList.vue              # 节点列表
│   │   ├── MapContainer.vue          # 地图容器
│   │   ├── LatencyChart.vue          # 延迟图表
│   │   ├── SpeedTestControl.vue      # 测速控制
│   │   ├── RecommendationPanel.vue   # 智能推荐
│   │   ├── AlertPanel.vue            # 告警面板
│   │   ├── ReportPanel.vue           # 报告面板
│   │   ├── AlertConfig.vue           # 告警配置
│   │   └── NodeComparison.vue        # 节点对比
│   ├── config/               # 配置
│   │   └── nodesConfig.js            # 节点配置
│   ├── data/                 # 数据
│   │   └── mockNodes.js              # 节点数据
│   ├── services/             # 服务
│   │   ├── speedTest.js              # 测速服务
│   │   ├── alert.js                  # 告警服务
│   │   ├── recommendation.js         # 推荐服务
│   │   ├── report.js                 # 报告服务
│   │   └── storage.js                # 存储服务
│   ├── stores/               # 状态管理
│   │   ├── nodes.js                  # 节点状态
│   │   └── theme.js                  # 主题状态
│   ├── views/                # 页面
│   │   ├── IntroduceView.vue         # 介绍页
│   │   └── HomeView.vue              # 测速面板
│   ├── router/               # 路由
│   │   └── index.js                  # 路由配置
│   ├── App.vue               # 根组件
│   └── main.js               # 入口文件
├── .github/
│   └── workflows/
│       └── deploy.yml                # GitHub Actions 配置
├── public/                      # 静态资源
├── vite.config.js               # Vite 配置
└── package.json                 # 项目配置
```

## ⚙️ 配置说明

### 节点配置

节点配置位于 `src/config/nodesConfig.js`，包含：
- 节点 ID、名称、地区
- 经纬度坐标（用于地图展示）
- IP 地址和 OSS 主机（用于测速）

### 测速配置

测速参数可在 `src/services/speedTest.js` 中调整：

```javascript
const CONFIG = {
  timeout: 5000,        // 超时时间（毫秒）
  measureCount: 3,      // 测量次数
  maxRetries: 2,        // 最大重试次数
  retryDelay: 1000,     // 重试间隔（毫秒）
  maxConcurrent: 5      // 最大并发数
}
```

### 告警配置

告警阈值配置位于 `src/services/alert.js`：
- 延迟阈值（在线/拥堵/离线）
- 丢包率阈值
- 告警开关

## 📊 功能说明

### 实时测速
- 支持手动测速和自动定时测速
- 多次测量取平均值，去除异常值
- 支持并发控制，避免网络拥堵
- 实时显示测速进度

### 节点状态
- 🟢 **在线**: 延迟 < 150ms
- 🟡 **拥堵**: 150ms ≤ 延迟 < 300ms
- 🔴 **离线**: 延迟 ≥ 300ms 或连接失败

### 智能推荐
- 基于地理位置推荐最近节点
- 综合延迟、成功率、稳定性评分
- 实时更新推荐结果

### 测速报告
- 支持按时间范围筛选（1天/3天/7天/30天）
- 统计节点总数、测试次数、平均延迟
- 按地区分组统计
- 导出 CSV 格式报告

## 🎨 主题定制

项目使用 CSS 变量定义主题，可在 `src/style.css` 中修改：

```css
:root {
  /* 背景色 */
  --bg-primary: #0a0e17;
  --bg-secondary: #111827;
  --bg-tertiary: #1f2937;

  /* 霓虹色 */
  --neon-cyan: #00f5ff;
  --neon-blue: #3b82f6;
  --neon-purple: #8b5cf6;
  --neon-green: #10b981;

  /* 状态色 */
  --status-online: #10b981;
  --status-congested: #f59e0b;
  --status-offline: #ef4444;
}
```

## 📝 开发说明

### 添加新节点

在 `src/config/nodesConfig.js` 中添加节点配置：

```javascript
{
  id: 'new-node-id',
  name: '新节点名称',
  region: '地区',
  country: '国家',
  city: '城市',
  lat: 纬度,
  lng: 经度,
  ip: 'IP地址',
  ossHost: 'OSS主机',
  url: '测速URL'
}
```

### 自定义测速逻辑

修改 `src/services/speedTest.js` 中的测速方法实现自定义逻辑。

### 本地开发注意事项

1. 使用 HTTP 协议开发时，部分测速可能受浏览器跨域限制
2. 建议使用 `npm run dev` 启动开发服务器
3. 修改配置后需要重启开发服务器

## 🔗 相关链接

- [Vue 3 文档](https://vuejs.org/)
- [Vite 文档](https://vitejs.dev/)
- [Element Plus 文档](https://element-plus.org/)
- [Leaflet 文档](https://leafletjs.com/)
- [ECharts 文档](https://echarts.apache.org/zh/index.html)

## ⚠️ 注意事项

1. 测速使用 `no-cors` 模式，可能受浏览器限制
2. 部分节点可能因网络原因无法访问
3. 建议使用 HTTPS 访问以获得更好的测速准确性
4. 节点 IP 地址仅供参考，实际测速使用域名
5. GitHub Pages 部署后路由需要配置 base 路径

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## © 版权信息

© 2025 canjisam. All rights reserved.

本项目采用 MIT 许可证开源。