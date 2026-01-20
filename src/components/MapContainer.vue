<template>
  <div class="map-container" :class="{ 'dark-theme': isDark }">
    <div class="theme-toggle" @click="toggleTheme">
      <el-icon v-if="isDark"><Sunny /></el-icon>
      <el-icon v-else><Moon /></el-icon>
      <span class="toggle-indicator"></span>
    </div>
    <div class="locate-button" @click="locateUser" :class="{ 'locating': isLocating }">
      <el-icon><Location /></el-icon>
    </div>
    <div class="zoom-controls">
      <div class="zoom-button" @click="zoomIn">
        <el-icon><Plus /></el-icon>
      </div>
      <div class="zoom-button" @click="zoomOut">
        <el-icon><Minus /></el-icon>
      </div>
    </div>
    <div ref="mapRef" class="map"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Sunny, Moon, Location, Plus, Minus } from '@element-plus/icons-vue'
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

// 自定义点（用户位置）
const userLocation = ref({
  lat: 35.8617, // 默认中国位置
  lng: 104.1954,
  name: '我的位置'
})
const userMarker = ref(null)
const connectionLines = ref([]) // 连接线集合
const isLocating = ref(false) // 是否正在定位

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

// 创建自定义点图标
const createUserIcon = () => {
  const size = 40
  const glowSize = 24
  
  return L.divIcon({
    className: 'user-marker',
    html: `
      <div style="position: relative; width: ${size}px; height: ${size}px;">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: ${size + glowSize}px;
          height: ${size + glowSize}px;
          background: radial-gradient(circle, rgba(0, 245, 255, 0.4) 0%, transparent 70%);
          border-radius: 50%;
          animation: userPulse 2s ease-in-out infinite;
        "></div>
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: linear-gradient(135deg, #00f5ff 0%, #06b6d4 100%);
          border-radius: 50%;
          border: 4px solid rgba(255, 255, 255, 0.95);
          box-shadow: 0 4px 20px rgba(0, 245, 255, 0.6), 0 0 30px rgba(0, 245, 255, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [size + glowSize, size + glowSize],
    iconAnchor: [(size + glowSize) / 2, (size + glowSize) / 2]
  })
}

// 创建连接线
const createConnectionLine = (from, to, latency, status) => {
  const colors = {
    online: '#10b981',
    offline: '#ef4444',
    congested: '#f59e0b'
  }
  
  const baseColor = colors[status] || '#3b82f6'
  const opacity = status === 'offline' ? 0.2 : 0.6
  const weight = status === 'online' ? 3 : 2
  
  // 根据延迟调整透明度（延迟越高越透明）
  const latencyOpacity = status === 'online' ? Math.max(0.3, 1 - latency / 500) : opacity
  
  let className = 'connection-line'
  let dashArray = null
  let gradientId = null
  
  if (status === 'online') {
    // 在线节点：动态流动线条
    dashArray = '15, 10'
    // 根据延迟确定动画速度（延迟越低，速度越快）
    const speedClass = getSpeedClass(latency)
    className += ` ${speedClass}`
    // 创建渐变
    gradientId = createLineGradient(from, to, latency)
  } else if (status === 'congested') {
    // 拥堵节点：静态虚线
    dashArray = '8, 8'
    className += ' static-line'
  }
  
  const line = L.polyline([[from.lat, from.lng], [to.lat, to.lng]], {
    color: gradientId ? `url(#${gradientId})` : baseColor,
    weight: weight,
    opacity: latencyOpacity,
    dashArray: dashArray,
    className: className,
    smoothFactor: 1
  })
  
  // 保存渐变 ID 以便清理
  if (gradientId) {
    line.gradientId = gradientId
  }
  
  return line
}

// 创建线条渐变
const createLineGradient = (from, to, latency) => {
  if (!mapRef.value) return null
  
  const svgNS = 'http://www.w3.org/2000/svg'
  const defs = document.getElementById('map-gradient-defs')
  if (!defs) return null
  
  const gradientId = `line-gradient-${from.lat.toFixed(2)}-${from.lng.toFixed(2)}-${to.lat.toFixed(2)}-${to.lng.toFixed(2)}-${Date.now()}`
  
  const gradient = document.createElementNS(svgNS, 'linearGradient')
  gradient.id = gradientId
  gradient.setAttribute('gradientUnits', 'userSpaceOnUse')
  
  // 获取地图容器的像素坐标
  const fromPoint = map.value.latLngToContainerPoint([from.lat, from.lng])
  const toPoint = map.value.latLngToContainerPoint([to.lat, to.lng])
  
  // 设置渐变坐标
  gradient.setAttribute('x1', fromPoint.x)
  gradient.setAttribute('y1', fromPoint.y)
  gradient.setAttribute('x2', toPoint.x)
  gradient.setAttribute('y2', toPoint.y)
  
  // 根据延迟调整渐变颜色
  const startColor = '#00f5ff'
  const midColor = latency < 100 ? '#10b981' : latency < 150 ? '#34d399' : '#6ee7b7'
  const endColor = latency < 100 ? '#059669' : latency < 150 ? '#10b981' : '#34d399'
  
  const stop1 = document.createElementNS(svgNS, 'stop')
  stop1.setAttribute('offset', '0%')
  stop1.setAttribute('stop-color', startColor)
  stop1.setAttribute('stop-opacity', '0.8')
  
  const stop2 = document.createElementNS(svgNS, 'stop')
  stop2.setAttribute('offset', '30%')
  stop2.setAttribute('stop-color', midColor)
  stop2.setAttribute('stop-opacity', '1')
  
  const stop3 = document.createElementNS(svgNS, 'stop')
  stop3.setAttribute('offset', '70%')
  stop3.setAttribute('stop-color', midColor)
  stop3.setAttribute('stop-opacity', '1')
  
  const stop4 = document.createElementNS(svgNS, 'stop')
  stop4.setAttribute('offset', '100%')
  stop4.setAttribute('stop-color', endColor)
  stop4.setAttribute('stop-opacity', '0.6')
  
  gradient.appendChild(stop1)
  gradient.appendChild(stop2)
  gradient.appendChild(stop3)
  gradient.appendChild(stop4)
  defs.appendChild(gradient)
  
  return gradientId
}

// 根据延迟获取速度类名
const getSpeedClass = (latency) => {
  if (latency < 50) return 'flow-very-fast'
  if (latency < 100) return 'flow-fast'
  if (latency < 150) return 'flow-normal'
  if (latency < 200) return 'flow-slow'
  return 'flow-very-slow'
}

// 添加自定义点
const addUserMarker = () => {
  if (!map.value || userMarker.value) return
  
  userMarker.value = L.marker([userLocation.value.lat, userLocation.value.lng], {
    icon: createUserIcon()
  }).addTo(map.value)
  
  userMarker.value.bindPopup(`
    <div style="
      padding: 12px 16px;
      min-width: 180px;
      font-size: 12px;
      background: linear-gradient(180deg, rgba(0, 245, 255, 0.15) 0%, rgba(17, 24, 39, 0.95) 100%);
      border-radius: 10px;
      border: 1px solid rgba(0, 245, 255, 0.3);
      box-shadow: 0 8px 24px rgba(0, 245, 255, 0.3);
    ">
      <div style="
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: #00f5ff;
          border-radius: 50%;
          box-shadow: 0 0 10px #00f5ff;
        "></div>
        <h3 style="
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #00f5ff;
        ">${userLocation.value.name}</h3>
      </div>
      <div style="color: #9ca3af; font-size: 11px;">
        <div>纬度: ${userLocation.value.lat.toFixed(4)}</div>
        <div>经度: ${userLocation.value.lng.toFixed(4)}</div>
      </div>
    </div>
  `, {
    maxWidth: 220,
    className: 'custom-popup'
  })
  
  userMarker.value.on('dragend', (e) => {
    const position = e.target.getLatLng()
    userLocation.value.lat = position.lat
    userLocation.value.lng = position.lng
    updateConnectionLines()
  })
}

// 更新连接线
const updateConnectionLines = () => {
  if (!map.value) return
  
  // 移除所有现有连接线和渐变定义
  connectionLines.value.forEach(line => {
    // 清理渐变定义
    if (line.gradientId) {
      const gradient = document.getElementById(line.gradientId)
      if (gradient) {
        gradient.remove()
      }
    }
    map.value.removeLayer(line)
  })
  connectionLines.value = []
  
  // 为每个在线节点创建连接线
  nodesStore.allNodes.forEach((node, index) => {
    if (node.status !== 'offline' && markers.value[index]) {
      const line = createConnectionLine(
        userLocation.value,
        node,
        node.latency,
        node.status
      )
      line.addTo(map.value)
      connectionLines.value.push(line)
    }
  })
}

// 设置自定义点位置（供外部调用）
const setUserLocation = (lat, lng, name = '我的位置') => {
  userLocation.value = { lat, lng, name }
  
  if (userMarker.value) {
    userMarker.value.setLatLng([lat, lng])
    userMarker.value.setPopupContent(`
      <div style="
        padding: 12px 16px;
        min-width: 180px;
        font-size: 12px;
        background: linear-gradient(180deg, rgba(0, 245, 255, 0.15) 0%, rgba(17, 24, 39, 0.95) 100%);
        border-radius: 10px;
        border: 1px solid rgba(0, 245, 255, 0.3);
        box-shadow: 0 8px 24px rgba(0, 245, 255, 0.3);
      ">
        <div style="
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        ">
          <div style="
            width: 10px;
            height: 10px;
            background: #00f5ff;
            border-radius: 50%;
            box-shadow: 0 0 10px #00f5ff;
          "></div>
          <h3 style="
            margin: 0;
            font-size: 14px;
            font-weight: 600;
            color: #00f5ff;
          ">${name}</h3>
        </div>
        <div style="color: #9ca3af; font-size: 11px;">
          <div>纬度: ${lat.toFixed(4)}</div>
          <div>经度: ${lng.toFixed(4)}</div>
        </div>
      </div>
    `)
  }
  
  updateConnectionLines()
}

// 定位用户位置
const locateUser = async () => {
  if (isLocating.value) return
  
  isLocating.value = true
  
  try {
    // 动态导入 getUserLocation 避免循环依赖
    const { getUserLocation } = await import('../services/recommendation')
    const userLoc = await getUserLocation()
    
    if (userLoc) {
      const locationName = userLoc.city ? `${userLoc.city}, ${userLoc.country}` : userLoc.country || '我的位置'
      
      // 更新用户位置
      setUserLocation(userLoc.latitude, userLoc.longitude, locationName)
      
      // 聚焦到用户位置
      if (map.value) {
        map.value.flyTo([userLoc.latitude, userLoc.longitude], 6, {
          duration: 1.5
        })
      }
      
      // 显示 popup
      if (userMarker.value) {
        userMarker.value.openPopup()
      }
    }
  } catch (error) {
    console.error('定位失败:', error)
  } finally {
    isLocating.value = false
  }
}

// 放大地图
const zoomIn = () => {
  if (map.value) {
    map.value.zoomIn()
  }
}

// 缩小地图
const zoomOut = () => {
  if (map.value) {
    map.value.zoomOut()
  }
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
  
  // 添加 SVG 渐变定义
  addGradientDefinitions()

  // 添加节点标记
  addNodeMarkers()
  
  // 添加自定义点
  addUserMarker()
  
  // 创建连接线
  updateConnectionLines()
}

// 添加 SVG defs 容器
const addGradientDefinitions = () => {
  if (!mapRef.value) return
  
  // 检查是否已经存在 defs 容器
  let defs = document.getElementById('map-gradient-defs')
  
  if (!defs) {
    const svgNS = 'http://www.w3.org/2000/svg'
    defs = document.createElementNS(svgNS, 'defs')
    defs.id = 'map-gradient-defs'
    
    // 添加到地图容器的 SVG 中
    const mapSvg = mapRef.value.querySelector('svg')
    if (mapSvg) {
      mapSvg.insertBefore(defs, mapSvg.firstChild)
    }
  }
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

    marker.bindPopup(createPopupHTML(node), {
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
  
  // 更新连接线
  updateConnectionLines()
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

// 生成 popup HTML 内容
const createPopupHTML = (node) => {
  const statusColor = getStatusColor(node.status)
  return `
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
  `
}

// 监听节点变化，实时更新标记和 popup 内容
watch(() => nodesStore.allNodes, (newNodes) => {
  if (!map.value) return
  
  newNodes.forEach((node, index) => {
    if (markers.value[index]) {
      const marker = markers.value[index]
      const isSelected = nodesStore.selectedNode?.id === node.id
      marker.setIcon(createNodeIcon(node.status, isSelected))
      marker.setPopupContent(createPopupHTML(node))
    }
  })
  
  // 更新连接线
  updateConnectionLines()
}, { deep: true })

defineExpose({
  focusOnNode,
  setUserLocation
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

.locate-button {
  position: absolute;
  top: 16px;
  right: 70px;
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

.locate-button:hover {
  transform: scale(1.1);
  border-color: var(--neon-cyan);
  box-shadow: 
    0 0 30px var(--neon-cyan-glow),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.locate-button.locating {
  animation: locatePulse 1s ease-in-out infinite;
}

.locate-button .el-icon {
  font-size: 22px;
  color: var(--neon-cyan);
  text-shadow: 0 0 15px var(--neon-cyan);
}

@keyframes locatePulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  }
  50% {
    transform: scale(1.15);
    box-shadow: 0 0 30px var(--neon-cyan-glow);
  }
}

.zoom-controls {
  position: absolute;
  top: 70px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 1000;
}

.zoom-button {
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
  transition: all var(--transition-normal);
  border: 1px solid var(--border-color);
  backdrop-filter: blur(20px);
}

.zoom-button:hover {
  transform: scale(1.1);
  border-color: var(--neon-cyan);
  box-shadow: 
    0 0 30px var(--neon-cyan-glow),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.zoom-button:active {
  transform: scale(0.95);
}

.zoom-button .el-icon {
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

@keyframes userPulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.4);
    opacity: 0.3;
  }
}

/* 连接线动画效果 */
:deep(.connection-line) {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: drawLine 1s ease-out forwards;
}

@keyframes drawLine {
  to {
    stroke-dashoffset: 0;
  }
}

/* 静态线（拥堵节点） */
:deep(.connection-line.static-line) {
  animation: none !important;
}

/* 流动动画 - 极快（延迟 < 50ms） */
:deep(.connection-line.flow-very-fast) {
  animation: dashFlow 0.5s linear infinite;
  filter: drop-shadow(0 0 6px rgba(16, 185, 129, 0.6));
}

/* 流动动画 - 快（50-100ms） */
:deep(.connection-line.flow-fast) {
  animation: dashFlow 0.8s linear infinite;
  filter: drop-shadow(0 0 5px rgba(16, 185, 129, 0.5));
}

/* 流动动画 - 正常（100-150ms） */
:deep(.connection-line.flow-normal) {
  animation: dashFlow 1.2s linear infinite;
  filter: drop-shadow(0 0 4px rgba(16, 185, 129, 0.4));
}

/* 流动动画 - 慢（150-200ms） */
:deep(.connection-line.flow-slow) {
  animation: dashFlow 1.8s linear infinite;
  filter: drop-shadow(0 0 3px rgba(16, 185, 129, 0.3));
}

/* 流动动画 - 很慢（> 200ms） */
:deep(.connection-line.flow-very-slow) {
  animation: dashFlow 2.5s linear infinite;
  filter: drop-shadow(0 0 2px rgba(16, 185, 129, 0.2));
}

@keyframes dashFlow {
  to {
    stroke-dashoffset: -25;
  }
}
</style>
