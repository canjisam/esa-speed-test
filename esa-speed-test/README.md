# 阿里云节点实时测速面板

一个基于 Vue 3 + Vite 构建的科技风格全球边缘节点实时测速面板，使用阿里云 OSS 真实节点进行测速。

## ✨ 特性

- 🚀 真实测速 - 使用阿里云 OSS 节点进行延迟检测
- 📊 数据可视化 - 集成 Leaflet 地图 + ECharts 图表
- 🎨 科技风格 - 暗色主题 + 霓虹光效 + 玻璃拟态
- ⚡ 实时监控 - 自动刷新测速，支持自定义间隔
- 🔔 智能告警 - 节点状态变化自动通知
- 📈 数据报告 - 生成详细的测速统计报告
- 🤖 智能推荐 - 基于地理位置和延迟推荐最佳节点
- 📱 响应式设计 - 支持多种屏幕尺寸

## 🌍 支持的节点

覆盖全球 24 个阿里云节点：

### 国内节点（12个）
- 华北：青岛、北京、张家口、呼和浩特、乌兰察布
- 华东：杭州、上海、南京
- 华南：深圳、河源、广州
- 西南：成都
- 港澳台：香港

### 国际节点（12个）
- 北美：硅谷、弗吉尼亚
- 亚太：新加坡、悉尼、吉隆坡、雅加达、孟买、东京
- 欧洲：法兰克福、伦敦
- 中东：迪拜

## 🛠️ 技术栈

- **前端框架**: Vue 3 + Composition API
- **构建工具**: Vite
- **UI 组件**: Element Plus
- **地图**: Leaflet
- **图表**: ECharts
- **状态管理**: Pinia
- **路由**: Vue Router

## 📦 安装

```bash
# 克隆项目
git clone https://github.com/your-username/esa-speed-test.git
cd esa-speed-test

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 🚀 构建

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 🚢 GitHub Pages 部署

项目已配置 GitHub Actions 自动部署到 GitHub Pages：

1. Fork 本项目到你的 GitHub 账号
2. 在仓库设置中启用 GitHub Pages
3. 推送代码到 `main` 分支
4. 自动触发部署流程
5. 部署完成后访问 `https://your-username.github.io/esa-speed-test/`

## 📁 项目结构

```
esa-speed-test/
├── src/
│   ├── components/       # 组件
│   │   ├── NodeList.vue          # 节点列表
│   │   ├── MapContainer.vue      # 地图容器
│   │   ├── LatencyChart.vue      # 延迟图表
│   │   ├── SpeedTestControl.vue  # 测速控制
│   │   ├── RecommendationPanel.vue # 智能推荐
│   │   ├── AlertPanel.vue        # 告警面板
│   │   ├── ReportPanel.vue       # 报告面板
│   │   └── ...
│   ├── config/           # 配置
│   │   └── nodesConfig.js        # 节点配置
│   ├── services/         # 服务
│   │   ├── speedTest.js          # 测速服务
│   │   ├── alert.js              # 告警服务
│   │   ├── recommendation.js     # 推荐服务
│   │   ├── report.js             # 报告服务
│   │   └── storage.js            # 存储服务
│   ├── stores/           # 状态管理
│   │   ├── nodes.js              # 节点状态
│   │   └── theme.js              # 主题状态
│   ├── views/            # 页面
│   │   └── HomeView.vue          # 首页
│   ├── App.vue           # 根组件
│   └── main.js           # 入口文件
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions 配置
├── public/             # 静态资源
└── vite.config.js      # Vite 配置
```

## ⚙️ 配置说明

### 节点配置

节点配置位于 `src/config/nodesConfig.js`，包含：
- 节点 ID、名称、地区
- 经纬度坐标（用于地图展示）
- IP 地址和 OSS 主机（用于测速）

### 测速配置

测速参数可在 `src/services/speedTest.js` 中调整：
- `timeout`: 超时时间（默认 5000ms）
- `measureCount`: 测量次数（默认 3 次）
- `maxRetries`: 最大重试次数（默认 2 次）
- `maxConcurrent`: 最大并发数（默认 5）

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
- 🟢 在线：延迟 < 150ms
- 🟡 拥堵：150ms ≤ 延迟 < 300ms
- 🔴 离线：延迟 ≥ 300ms 或连接失败

### 智能推荐
- 基于地理位置推荐最近节点
- 综合延迟、成功率、稳定性评分
- 实时更新推荐结果

### 测速报告
- 支持按时间范围筛选
- 统计节点总数、测试次数、平均延迟
- 按地区分组统计
- 导出 CSV 格式报告

## 🎨 主题定制

项目使用 CSS 变量定义主题，可在 `src/style.css` 中修改：

```css
:root {
  --bg-primary: #0a0e17;
  --neon-cyan: #00f5ff;
  --neon-blue: #3b82f6;
  --neon-green: #10b981;
  /* ... 更多变量 */
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

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

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

## 📮 联系方式

如有问题或建议，欢迎提交 Issue。