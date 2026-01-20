<template>
  <div class="map-container" :class="{ 'dark-theme': isDark }">
    <div class="theme-toggle" @click="toggleTheme">
      <el-icon v-if="isDark"><Sunny /></el-icon>
      <el-icon v-else><Moon /></el-icon>
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

const isDark = ref(themeStore.isDark)

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

  // 移除当前图层
  if (currentTileLayer.value) {
    map.value.removeLayer(currentTileLayer.value)
  }

  // 添加新图层
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
    online: '#52c41a',
    offline: '#ff4d4f',
    congested: '#faad14'
  }
  
  const size = isSelected ? 32 : 24
  const borderWidth = isSelected ? 4 : 3
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${colors[status] || '#1890ff'};
        border-radius: 50%;
        border: ${borderWidth}px solid white;
        box-shadow: ${isSelected ? '0 4px 12px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.3)'};
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      ">
        <div style="
          width: ${isSelected ? 12 : 8}px;
          height: ${isSelected ? 12 : 8}px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  })
}

// 初始化地图
const initMap = () => {
  if (!mapRef.value) return

  // 创建地图实例
  map.value = L.map(mapRef.value, {
    center: [30, 0],
    zoom: 2,
    minZoom: 2,
    maxZoom: 18
  })

  // 初始化主题
  themeStore.initTheme()
  isDark.value = themeStore.isDark

  // 添加地图图层
  updateMapTheme()

  // 添加节点标记
  addNodeMarkers()
}

// 添加节点标记
const addNodeMarkers = () => {
  // 清除现有标记
  markers.value.forEach(marker => marker.remove())
  markers.value = []

  // 初始化节点数据
  nodesStore.setNodes(mockNodes)

  // 添加新标记
  mockNodes.forEach(node => {
    const marker = L.marker([node.lat, node.lng], {
      icon: createNodeIcon(node.status)
    }).addTo(map.value)

    // 添加弹窗
    marker.bindPopup(`
      <div style="padding: 10px; min-width: 200px;">
        <h3 style="margin: 0 0 10px 0; color: #333;">${node.name}</h3>
        <p style="margin: 5px 0; color: #666;">
          <strong>地区:</strong> ${node.region}
        </p>
        <p style="margin: 5px 0; color: #666;">
          <strong>国家:</strong> ${node.country}
        </p>
        <p style="margin: 5px 0; color: #666;">
          <strong>状态:</strong> 
          <span style="color: ${getStatusColor(node.status)}">${getStatusText(node.status)}</span>
        </p>
        <p style="margin: 5px 0; color: #666;">
          <strong>延迟:</strong> ${node.latency} ms
        </p>
        <p style="margin: 5px 0; color: #666;">
          <strong>负载:</strong> ${node.load}%
        </p>
      </div>
    `)

    // 点击事件
    marker.on('click', () => {
      nodesStore.setSelectedNode(node)
    })

    markers.value.push(marker)
  })
}

// 聚焦到指定节点
const focusOnNode = (node) => {
  if (!map.value || !node) return
  
  // 平移到节点位置并缩放
  map.value.flyTo([node.lat, node.lng], 8, {
    duration: 1.5
  })
  
  // 更新所有标记的图标
  markers.value.forEach((marker, index) => {
    const markerNode = mockNodes[index]
    const isSelected = markerNode.id === node.id
    marker.setIcon(createNodeIcon(markerNode.status, isSelected))
  })
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colors = {
    online: '#52c41a',
    offline: '#ff4d4f',
    congested: '#faad14'
  }
  return colors[status] || '#1890ff'
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
      
      // 更新图标
      marker.setIcon(createNodeIcon(node.status, isSelected))
      
      // 更新弹窗内容
      marker.setPopupContent(`
        <div style="padding: 10px; min-width: 200px;">
          <h3 style="margin: 0 0 10px 0; color: #333;">${node.name}</h3>
          <p style="margin: 5px 0; color: #666;">
            <strong>地区:</strong> ${node.region}
          </p>
          <p style="margin: 5px 0; color: #666;">
            <strong>国家:</strong> ${node.country}
          </p>
          <p style="margin: 5px 0; color: #666;">
            <strong>状态:</strong> 
            <span style="color: ${getStatusColor(node.status)}">${getStatusText(node.status)}</span>
          </p>
          <p style="margin: 5px 0; color: #666;">
            <strong>延迟:</strong> ${node.latency} ms
          </p>
          <p style="margin: 5px 0; color: #666;">
            <strong>负载:</strong> ${node.load}%
          </p>
        </div>
      `)
    }
  })
}, { deep: true })

// 导出方法供父组件调用
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
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  background: white;
  position: relative;
}

.map-container.dark-theme {
  background: #1a1a1a;
}

.theme-toggle {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
  transition: all 0.3s;
}

.theme-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.theme-toggle .el-icon {
  font-size: 20px;
  color: #333;
}

.map {
  width: 100%;
  height: 100%;
}

:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

:deep(.leaflet-popup-content) {
  margin: 0;
}

.dark-theme :deep(.leaflet-popup-content-wrapper) {
  background: #2a2a2a;
  color: #fff;
}
</style>