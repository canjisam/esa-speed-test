<template>
  <div class="introduce">
    <div class="bg-effects">
      <div class="grid-overlay"></div>
      <div class="scanline"></div>
      <div class="glow-spots"></div>
    </div>
    
    <div class="container">
      <!-- 头部 -->
      <div class="header">
        <h1>
          <span class="title-icon">◈</span>
          ESA Speed Test
          <span class="title-glow"></span>
        </h1>
        <p class="subtitle">全球边缘节点实时测速面板</p>
      </div>

      <!-- 主要内容 -->
      <div class="content">
        <!-- 项目简介 -->
        <div class="section">
          <h2 class="section-title">
            <span class="title-dot"></span>
            项目简介
          </h2>
          <div class="section-content">
            <p>ESA Speed Test 是一个基于 Vue 3 + Vite 构建的科技风格全球边缘节点实时测速面板。项目使用阿里云 OSS 真实节点进行测速，提供实时监控、智能告警、数据报告等强大功能。</p>
            <div class="features-grid">
              <div class="feature-item">
                <div class="feature-icon">🚀</div>
                <div class="feature-text">
                  <h3>真实测速</h3>
                  <p>使用阿里云 OSS 节点进行延迟检测</p>
                </div>
              </div>
              <div class="feature-item">
                <div class="feature-icon">📊</div>
                <div class="feature-text">
                  <h3>数据可视化</h3>
                  <p>集成 Leaflet 地图 + ECharts 图表</p>
                </div>
              </div>
              <div class="feature-item">
                <div class="feature-icon">🎨</div>
                <div class="feature-text">
                  <h3>科技风格</h3>
                  <p>暗色主题 + 霓虹光效 + 玻璃拟态</p>
                </div>
              </div>
              <div class="feature-item">
                <div class="feature-icon">⚡</div>
                <div class="feature-text">
                  <h3>实时监控</h3>
                  <p>自动刷新测速，支持自定义间隔</p>
                </div>
              </div>
              <div class="feature-item">
                <div class="feature-icon">🔔</div>
                <div class="feature-text">
                  <h3>智能告警</h3>
                  <p>节点状态变化自动通知</p>
                </div>
              </div>
              <div class="feature-item">
                <div class="feature-icon">🤖</div>
                <div class="feature-text">
                  <h3>智能推荐</h3>
                  <p>基于地理位置和延迟推荐最佳节点</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 覆盖节点 -->
        <div class="section">
          <h2 class="section-title">
            <span class="title-dot"></span>
            覆盖节点
          </h2>
          <div class="section-content">
            <div class="nodes-grid">
              <div class="node-group">
                <h3>国内节点（12个）</h3>
                <div class="node-list">
                  <div class="node-tag">青岛</div>
                  <div class="node-tag">北京</div>
                  <div class="node-tag">张家口</div>
                  <div class="node-tag">呼和浩特</div>
                  <div class="node-tag">乌兰察布</div>
                  <div class="node-tag">杭州</div>
                  <div class="node-tag">上海</div>
                  <div class="node-tag">南京</div>
                  <div class="node-tag">深圳</div>
                  <div class="node-tag">河源</div>
                  <div class="node-tag">广州</div>
                  <div class="node-tag">成都</div>
                  <div class="node-tag">香港</div>
                </div>
              </div>
              <div class="node-group">
                <h3>国际节点（12个）</h3>
                <div class="node-list">
                  <div class="node-tag">硅谷</div>
                  <div class="node-tag">弗吉尼亚</div>
                  <div class="node-tag">新加坡</div>
                  <div class="node-tag">悉尼</div>
                  <div class="node-tag">吉隆坡</div>
                  <div class="node-tag">雅加达</div>
                  <div class="node-tag">孟买</div>
                  <div class="node-tag">东京</div>
                  <div class="node-tag">法兰克福</div>
                  <div class="node-tag">伦敦</div>
                  <div class="node-tag">迪拜</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 技术栈 -->
        <div class="section">
          <h2 class="section-title">
            <span class="title-dot"></span>
            技术栈
          </h2>
          <div class="section-content">
            <div class="tech-grid">
              <div class="tech-item">
                <div class="tech-name">Vue 3</div>
                <div class="tech-desc">前端框架 + Composition API</div>
              </div>
              <div class="tech-item">
                <div class="tech-name">Vite 7</div>
                <div class="tech-desc">快速构建工具</div>
              </div>
              <div class="tech-item">
                <div class="tech-name">Element Plus</div>
                <div class="tech-desc">UI 组件库</div>
              </div>
              <div class="tech-item">
                <div class="tech-name">Leaflet</div>
                <div class="tech-desc">地图可视化</div>
              </div>
              <div class="tech-item">
                <div class="tech-name">ECharts</div>
                <div class="tech-desc">数据图表</div>
              </div>
              <div class="tech-item">
                <div class="tech-name">Pinia</div>
                <div class="tech-desc">状态管理</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 使用说明 -->
        <div class="section">
          <h2 class="section-title">
            <span class="title-dot"></span>
            使用说明
          </h2>
          <div class="section-content">
            <div class="steps">
              <div class="step">
                <div class="step-number">1</div>
                <div class="step-content">
                  <h3>选择节点</h3>
                  <p>在左侧节点列表中选择要测试的节点，支持单选和多选</p>
                </div>
              </div>
              <div class="step">
                <div class="step-number">2</div>
                <div class="step-content">
                  <h3>开始测速</h3>
                  <p>点击右侧"开始测速"按钮，系统将自动检测所有选中节点的延迟</p>
                </div>
              </div>
              <div class="step">
                <div class="step-number">3</div>
                <div class="step-content">
                  <h3>查看结果</h3>
                  <p>地图上会实时显示节点状态，图表展示延迟趋势数据</p>
                </div>
              </div>
              <div class="step">
                <div class="step-number">4</div>
                <div class="step-content">
                  <h3>智能推荐</h3>
                  <p>系统会根据您的地理位置和延迟数据推荐最佳节点</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 节点状态说明 -->
        <div class="section">
          <h2 class="section-title">
            <span class="title-dot"></span>
            节点状态说明
          </h2>
          <div class="section-content">
            <div class="status-list">
              <div class="status-item">
                <div class="status-dot online"></div>
                <div class="status-info">
                  <h3>在线</h3>
                  <p>延迟 &lt; 150ms，连接状态良好</p>
                </div>
              </div>
              <div class="status-item">
                <div class="status-dot congested"></div>
                <div class="status-info">
                  <h3>拥堵</h3>
                  <p>150ms ≤ 延迟 &lt; 300ms，连接较慢</p>
                </div>
              </div>
              <div class="status-item">
                <div class="status-dot offline"></div>
                <div class="status-info">
                  <h3>离线</h3>
                  <p>延迟 ≥ 300ms 或连接失败</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 开始按钮 -->
        <div class="action-section">
          <el-button type="primary" size="large" @click="goToDashboard" class="start-btn">
            <span class="btn-text">开始使用</span>
            <span class="btn-icon">→</span>
          </el-button>
        </div>
      </div>

      <!-- 版权信息 -->
      <div class="footer" :class="{ 'footer-collapsed': isFooterCollapsed }">
        <div class="footer-toggle" @click="toggleFooter">
          <span class="toggle-icon">{{ isFooterCollapsed ? '▲' : '▼' }}</span>
        </div>
        <div class="footer-content" v-show="!isFooterCollapsed">
          <p>© 2025 canjisam. All rights reserved.</p>
          <p class="footer-links">
            <a href="https://github.com/canjisam/esa-speed-test" target="_blank">GitHub</a>
            <span>|</span>
            <a href="https://canjisam.github.io/esa-speed-test/" target="_blank">在线演示</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isFooterCollapsed = ref(false)

const goToDashboard = () => {
  router.push('/dashboard')
}

const toggleFooter = () => {
  isFooterCollapsed.value = !isFooterCollapsed.value
}
</script>

<style scoped>
.introduce {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: var(--spacing-lg);
  box-sizing: border-box;
  background: 
    radial-gradient(ellipse at 20% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(0, 245, 255, 0.03) 0%, transparent 70%),
    var(--bg-primary);
  position: relative;
  overflow: hidden;
}

/* 背景特效层 */
.bg-effects {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.grid-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.8;
}

.scanline {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.02) 2px,
    rgba(0, 0, 0, 0.02) 4px
  );
  animation: scanline 8s linear infinite;
}

@keyframes scanline {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
}

.glow-spots {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 15% 30%, rgba(0, 245, 255, 0.03) 0%, transparent 25%),
    radial-gradient(circle at 85% 70%, rgba(139, 92, 246, 0.03) 0%, transparent 25%),
    radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.02) 0%, transparent 50%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  flex: 1;
}

/* 头部 */
.header {
  text-align: center;
  padding: 60px 20px 40px;
}

.header h1 {
  margin: 0;
  font-size: 48px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  position: relative;
  color: #fff;
}

.title-icon {
  color: var(--neon-cyan);
  font-size: 52px;
  text-shadow: 0 0 20px var(--neon-cyan-glow);
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

.title-glow {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 50%;
  transform: translate(-50%, -50%);
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
  z-index: -1;
  width: 120%;
}

.subtitle {
  margin-top: var(--spacing-md);
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 300;
}

/* 内容区域 */
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 40px;
  padding-bottom: 40px;
}

/* 区块 */
.section {
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: 30px;
  backdrop-filter: blur(20px);
  box-shadow: 
    var(--shadow-md),
    var(--shadow-glow),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transition: all var(--transition-normal);
}

.section:hover {
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 
    var(--shadow-lg),
    0 0 40px rgba(59, 130, 246, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.section-title {
  margin: 0 0 20px;
  font-size: 24px;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.title-dot {
  width: 8px;
  height: 8px;
  background: var(--neon-cyan);
  border-radius: 50%;
  box-shadow: 0 0 10px var(--neon-cyan-glow);
  animation: dotPulse 2s ease-in-out infinite;
}

@keyframes dotPulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
}

.section-content {
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.8;
}

.section-content p {
  margin-bottom: 16px;
}

/* 特性网格 */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 24px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-normal);
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(59, 130, 246, 0.3);
  transform: translateY(-2px);
}

.feature-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.feature-text h3 {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.feature-text p {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

/* 节点网格 */
.nodes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 24px;
}

.node-group h3 {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
  color: var(--neon-cyan);
}

.node-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.node-tag {
  padding: 8px 16px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 20px;
  font-size: 14px;
  color: var(--neon-cyan);
  transition: all var(--transition-fast);
}

.node-tag:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: var(--neon-cyan);
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
}

/* 技术栈网格 */
.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.tech-item {
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--border-radius-md);
  text-align: center;
  transition: all var(--transition-normal);
}

.tech-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(139, 92, 246, 0.3);
  transform: translateY(-2px);
}

.tech-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--neon-purple);
  margin-bottom: 8px;
}

.tech-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

/* 步骤 */
.steps {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 24px;
}

.step {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-normal);
}

.step:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(0, 245, 255, 0.3);
}

.step-number {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--neon-cyan), var(--neon-blue));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 0 20px rgba(0, 245, 255, 0.4);
}

.step-content h3 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.step-content p {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

/* 状态列表 */
.status-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-normal);
}

.status-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot.online {
  background: var(--status-online);
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.6);
}

.status-dot.congested {
  background: var(--status-congested);
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.6);
}

.status-dot.offline {
  background: var(--status-offline);
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
}

.status-info h3 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.status-info p {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

/* 操作区域 */
.action-section {
  text-align: center;
  padding: 20px 0;
}

.start-btn {
  padding: 16px 48px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 30px;
  background: linear-gradient(135deg, var(--neon-cyan), var(--neon-blue));
  border: none;
  color: #fff;
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.4);
  transition: all var(--transition-normal);
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.start-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 40px rgba(59, 130, 246, 0.6);
}

.btn-icon {
  font-size: 20px;
  transition: transform var(--transition-fast);
}

.start-btn:hover .btn-icon {
  transform: translateX(4px);
}

/* 版权信息 */
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 11px;
  background: rgba(10, 14, 23, 0.9);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  z-index: 100;
  transition: all var(--transition-normal);
}

.footer-collapsed {
  padding: 4px 20px;
  height: 32px;
  cursor: pointer;
}

.footer:hover {
  background: rgba(10, 14, 23, 0.95);
  border-top-color: rgba(255, 255, 255, 0.1);
}

.footer-toggle {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 50%;
  margin-top: -8px;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 12px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  transition: all var(--transition-fast);
}

.footer-toggle:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: var(--neon-cyan);
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
}

.toggle-icon {
  color: var(--neon-cyan);
  font-size: 12px;
  display: block;
  line-height: 1;
}

.footer-content {
  transition: all var(--transition-normal);
}

.footer p {
  margin: 2px 0;
}

.footer-links {
  margin-top: 2px;
  font-size: 10px;
}

.footer-links a {
  color: rgba(0, 245, 255, 0.7);
  text-decoration: none;
  transition: all var(--transition-fast);
  padding: 0 3px;
}

.footer-links a:hover {
  color: var(--neon-cyan);
  text-shadow: 0 0 8px rgba(0, 245, 255, 0.5);
}

.footer-links span {
  margin: 0 6px;
  color: rgba(255, 255, 255, 0.2);
}

/* 响应式 */
@media screen and (max-width: 768px) {
  .introduce {
    padding: var(--spacing-md);
  }

  .header {
    padding: 40px 20px 30px;
  }

  .header h1 {
    font-size: 32px;
  }

  .title-icon {
    font-size: 36px;
  }

  .subtitle {
    font-size: 14px;
  }

  .section {
    padding: 20px;
  }

  .section-title {
    font-size: 20px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .nodes-grid {
    grid-template-columns: 1fr;
  }

  .tech-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .start-btn {
    padding: 14px 36px;
    font-size: 16px;
    width: 100%;
  }
}
</style>