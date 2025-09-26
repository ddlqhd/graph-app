<template>
  <div class="edge-panel">
    <div class="edge-panel-header">
      <h3>连接详情</h3>
      <el-button class="close-btn" @click="$emit('close')" :icon="Close" size="small" text />
    </div>
    
    <div v-if="edge" class="edge-panel-content">
      <div class="edge-info">
        <div class="info-item">
          <label>连接类型:</label>
          <span>{{ edge.type || 'N/A' }}</span>
        </div>
        
        <div class="info-item">
          <label>源设备:</label>
          <span>{{ getSourceDeviceName() }}</span>
        </div>
        
        <div class="info-item">
          <label>目标设备:</label>
          <span>{{ getTargetDeviceName() }}</span>
        </div>
        
        <div v-if="edge.properties?.original_ports" class="info-item">
          <label>源端口:</label>
          <span>{{ edge.properties.original_ports.src_port || 'N/A' }}</span>
        </div>
        
        <div v-if="edge.properties?.original_ports" class="info-item">
          <label>目标端口:</label>
          <span>{{ edge.properties.original_ports.dst_port || 'N/A' }}</span>
        </div>
        
        <div v-if="edge.label" class="info-item">
          <label>标签:</label>
          <span>{{ edge.label }}</span>
        </div>
      </div>
    </div>
    
    <div v-else class="no-edge-selected">
      <p>未选择任何连接</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Close } from '@element-plus/icons-vue'
import type { GraphEdge } from '@/services/graphService'
import { useGraphStore } from '@/stores/graph'

interface Props {
  edge: GraphEdge | null
}

const props = withDefaults(defineProps<Props>(), {
  edge: () => null
})
defineEmits(['close'])

const graphStore = useGraphStore()

const getSourceDeviceName = () => {
  if (!props.edge) return 'N/A'
  const sourceNode = graphStore.findNodeById(props.edge.source)
  return sourceNode?.label || sourceNode?.properties?.device_name || 'N/A'
}

const getTargetDeviceName = () => {
  if (!props.edge) return 'N/A'
  const targetNode = graphStore.findNodeById(props.edge.target)
  return targetNode?.label || targetNode?.properties?.device_name || 'N/A'
}
</script>

<style scoped>
.edge-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 300px;
  background: var(--color-bg-default);
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-large);
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.edge-panel-header {
  padding: var(--space-3);
  border-bottom: 1px solid var(--color-border-default);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-bg-subtle);
  border-radius: var(--border-radius) var(--border-radius) 0 0;
}

.edge-panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-fg-default);
}

.close-btn {
  color: var(--color-fg-muted);
}

.close-btn:hover {
  color: var(--color-fg-default);
}

.edge-panel-content {
  padding: var(--space-3);
  flex: 1;
  overflow-y: auto;
}

.edge-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: var(--space-1) 0;
  border-bottom: 1px solid var(--color-border-muted);
}

.info-item label {
  font-weight: 500;
  color: var(--color-fg-muted);
  flex: 0 0 80px; /* 固定标签宽度 */
}

.info-item span {
  color: var(--color-fg-default);
  flex: 1;
  text-align: right;
  word-break: break-word;
  margin-left: var(--space-2);
}

.no-edge-selected {
  padding: var(--space-5);
  text-align: center;
  color: var(--color-fg-muted);
}
</style>