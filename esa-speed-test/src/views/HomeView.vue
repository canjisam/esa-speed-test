<template>
  <div class="home">
    <div class="header">
      <h1>全球边缘节点实时测速面板</h1>
    </div>
    <div class="content">
      <NodeList 
        :nodes="nodesStore.allNodes" 
        :selected-node="nodesStore.selectedNode"
        @node-select="handleNodeSelect"
      />
      <MapContainer ref="mapContainerRef" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MapContainer from '../components/MapContainer.vue'
import NodeList from '../components/NodeList.vue'
import { useNodesStore } from '../stores/nodes'

const nodesStore = useNodesStore()
const mapContainerRef = ref(null)

// 处理节点选择
const handleNodeSelect = (node) => {
  nodesStore.setSelectedNode(node)
  // 通知地图组件定位到选中的节点
  if (mapContainerRef.value && mapContainerRef.value.focusOnNode) {
    mapContainerRef.value.focusOnNode(node)
  }
}
</script>

<style scoped>
.home {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-sizing: border-box;
  background: #f0f2f5;
}

.header {
  margin-bottom: 20px;
}

h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
  font-weight: 600;
}

.content {
  flex: 1;
  display: flex;
  gap: 20px;
  min-height: 0;
}
</style>