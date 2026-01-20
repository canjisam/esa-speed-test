<template>
  <div class="map-container" :class="{ 'dark-theme': isDark }">
    <div class="theme-toggle" @click="toggleTheme">
      <el-icon v-if="isDark"><Sunny /></el-icon>
      <el-icon v-else><Moon /></el-icon>
      <span class="toggle-indicator"></span>
    </div>
    <div ref="mapRef" class="map"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Sunny, Moon } from '@element-plus/icons-vue'
import { useNodesStore } from '../stores/nodes'
import { useThemeStore } from '../stores/theme'
import { mockNodes } from '../data/mockNodes'

const mapRef = ref(null)
const map = ref(null)
const markers = ref([])
const currentTileLayer = ref(null)
const nodesStore = useNodesStore()
const themeStore = useThemeStore()

const isDark = ref(true) // 默认暗色模式

// 地图瓦片图层配置
const tileLayers = {
  light: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }
}

// 切换主题
const toggleTheme = () => {
  themeStore.toggleTheme()
  isDark.value = themeStore.isDark
  updateMapTheme()
}

// 更新地图主题
const updateMapTheme = () => {
  if (!map.value) return

  if (currentTileLayer.value) {
    map.value.removeLayer(currentTileLayer.value)
  }

  const theme = isDark.value ? 'dark' : 'light'
  const layerConfig = tileLayers[theme]
  currentTileLayer.value = L.tileLayer(layerConfig.url, {
    attribution: layerConfig.attribution,
    maxZoom: 18
  }).addTo(map.value)
}

// 自定义节点图标
const createNodeIcon = (status, isSelected = false) => {
  const colors = {
    online: '#10b981',
    offline: '#ef4444',
    congested: '#f59e0b'
  }
  
  const size = isSelected ? 36 : 28
  const borderWidth = isSelected ? 4 : 3
  const glowSize = isSelected ? 20 : 12
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: ${size + glowSize}px;
          height: ${size + glowSize}px;
          background: radial-gradient(circle, ${colors[status] || '#3b82f6'}33 0%, transparent 70%);
          border-radius: 50%;
          animation: markerPulse 2s ease-in-out infinite;
        "></div>
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: linear-gradient(135deg, ${colors[status] || '#3b82f6'} 0%, ${colors[status] ? adjustColor(colors[status], -30) : '#2563eb'} 100%);
          border-radius: 50%;
          border: ${borderWidth}px solid rgba(255, 255, 255, 0.95);
          box-shadow: 0 4px ${isSelected ? 16 : 12}px rgba(0, 0, 0, 0.4), 0 0 ${isSelected ? 20 : 12}px ${colors[status] || '#3b82f6'}40;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        ">
          <div style="
            width: ${isSelected ? 14 : 10}px;
            height: ${isSelected ? 14 : 10}px;
            background: white;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          "></div>
        </div>
      </div>
    `,
    iconSize: [size + glowSize, size + glowSize],
    iconAnchor: [(size + glowSize) / 2, (size + glowSize) / 2]
  })
}

// 调整颜色亮度
const adjustColor = (hex, amount) => {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount))
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount))
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`
}

// 初始化地图
const initMap = () => {
  if (!mapRef.value) return

  map.value = L.map(mapRef.value, {
    center: [30, 0],
    zoom: 2,
    minZoom: 2,
    maxZoom: 18,
    zoomControl: false
  })

  // 强制使用暗色主题
  isDark.value = true
  themeStore.isDark = true

  // 添加地图图层
  updateMapTheme()

  // 添加节点标记
  addNodeMarkers()
}

// 添加节点标记
const addNodeMarkers = () => {
  markers.value.forEach(marker => marker.remove())
  markers.value = []

  nodesStore.setNodes(mockNodes)

  mockNodes.forEach(node => {
    const marker = L.marker([node.lat, node.lng], {
      icon: createNodeIcon(node.status)
    }).addTo(map.value)

    const statusColor = getStatusColor(node.status)
    
    marker.bindPopup(`
      <div style="
        padding: 0;
        min-width: 220px;
        font-size: 12px;
        background: linear-gradient(180deg, rgba(17, 24, 39, 0.98) 0%, rgba(17, 24, 39, 0.95) 100%);
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      ">
        <div style="
          padding: 14px 16px;
          background: linear-gradient(90deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          gap: 10px;
        ">
          <div style="
            width: 8px;
            height: 8px;
            background: ${statusColor};
            border-radius: 50%;
            box-shadow: 0 0 12px ${statusColor};
            animation: statusPulse 2s ease-in-out infinite;
          "></div>
          <h3 style="
            margin: 0;
            font-size: 15px;
            font-weight: 600;
            color: #f9fafb;
            text-shadow: 0 0 20px rgba(0, 245, 255, 0.3);
            flex: 1;
          ">${node.name}</h3>
        </div>
        <div style="padding: 14px 16px;">
          <div style="
            display: grid;
            grid-template-columns: 70px 1fr;
            gap: 10px;
            margin-bottom: 10px;
          ">
            <span style="color: #6b7280; font-size: 11px;">地区</span>
            <span style="color: #9ca3af; font-size: 12px; font-weight: 500;">${node.region}</span>
            
            <span style="color: #6b7280; font-size: 11px;">国家</span>
            <span style="color: #9ca3af; font-size: 12px; font-weight: 500;">${node.country}</span>
            
            <span style="color: #6b7280; font-size: 11px;">状态</span>
            <span style="
              color: ${statusColor};
              font-size: 12px;
              font-weight: 600;
              text-shadow: 0 0 10px ${statusColor}80;
            ">${getStatusText(node.status)}</span>
            
            <span style="color: #6b7280; font-size: 11px;">延迟</span>
            <span style="
              color: #00f5ff;
              font-size: 16px;
              font-weight: 700;
              text-shadow: 0 0 15px rgba(0, 245, 255, 0.5);
            ">${node.latency} ms</span>
            
            <span style="color: #6b7280; font-size: 11px;">负载</span>
            <span style="
              color: #3b82f6;
              font-size: 16px;
              font-weight: 700;
              text-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
            ">${node.load}%</span>
          </div>
        </div>
      </div>
    `, {
      maxWidth: 280,
      className: 'custom-popup'
    })

    marker.on('click', () => {
      nodesStore.setSelectedNode(node)
    })

    markers.value.push(marker)
  })
}

// 聚焦到指定节点
const focusOnNode = (node) => {
  if (!map.value || !node) return
  
  map.value.flyTo([node.lat, node.lng], 8, {
    duration: 1.5
  })
  
  markers.value.forEach((marker, index) => {
    const markerNode = mockNodes[index]
    const isSelected = markerNode.id === node.id
    marker.setIcon(createNodeIcon(markerNode.status, isSelected))
  })
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colors = {
    online: '#10b981',
    offline: '#ef4444',
    congested: '#f59e0b'
  }
  return colors[status] || '#3b82f6'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    online: '在线',
    offline: '离线',
    congested: '拥堵'
  }
  return texts[status] || '未知'
}

// 监听节点变化，实时更新标记
watch(() => nodesStore.allNodes, (newNodes) => {
  if (!map.value) return
  
  newNodes.forEach((node, index) => {
    if (markers.value[index]) {
      const marker = markers.value[index]
      const isSelected = nodesStore.selectedNode?.id === node.id
      marker.setIcon(createNodeIcon(node.status, isSelected))
    }
  })
}, { deep: true })

defineExpose({
  focusOnNode
})

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  if (map.value) {
    map.value.remove()
  }
})
</script>

<style scoped>
.map-container {
  flex: 1;
  min-height: 400px;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: 
    var(--shadow-lg),
    var(--shadow-glow),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  background: var(--bg-secondary);
  position: relative;
  border: 1px solid var(--border-color);
  transition: all var(--transition-normal);
}

.map-container:hover {
  box-shadow: 
    0 12px 50px rgba(0, 0, 0, 0.6),
    0 0 50px rgba(59, 130, 246, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.theme-toggle {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--bg-glass);
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
  transition: all var(--transition-normal);
  border: 1px solid var(--border-color);
  backdrop-filter: blur(20px);
}

.theme-toggle:hover {
  transform: scale(1.1) rotate(180deg);
  border-color: var(--neon-cyan);
  box-shadow: 
    0 0 30px var(--neon-cyan-glow),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.theme-toggle .el-icon {
  font-size: 22px;
  color: var(--neon-cyan);
  text-shadow: 0 0 15px var(--neon-cyan);
}

.map {
  width: 100%;
  height: 100%;
}

:deep(.custom-popup) {
  margin: 0 !important;
}

:deep(.leaflet-popup-content-wrapper) {
  border-radius: var(--border-radius-lg) !important;
  box-shadow: 
    0 12px 48px rgba(0, 0, 0, 0.6),
    0 0 30px rgba(0, 245, 255, 0.15) !important;
  background: transparent !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(20px) !important;
  overflow: hidden;
  padding: 0 !important;
}

:deep(.leaflet-popup-content) {
  margin: 0 !important;
  font-size: 12px;
  line-height: 1.6;
}

:deep(.leaflet-popup-tip) {
  background: var(--bg-secondary) !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4) !important;
}

:deep(.leaflet-popup-close-button) {
  color: #9ca3af !important;
  font-size: 24px !important;
  padding: 8px !important;
  right: 4px !important;
  top: 4px !important;
}

:deep(.leaflet-popup-close-button:hover) {
  color: #ef4444 !important;
  background: rgba(239, 68, 68, 0.1) !important;
  border-radius: 50%;
}

@keyframes markerPulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.3);
    opacity: 0.3;
  }
}

@keyframes statusPulse {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 12px currentColor;
  }
  50% {
    opacity: 0.6;
    box-shadow: 0 0 20px currentColor;
  }
}
</style>
