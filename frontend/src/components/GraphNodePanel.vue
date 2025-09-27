<template>
  <div class="node-panel">
    <div class="node-panel-header">
      <h3>节点详情</h3>
      <el-button class="close-btn" @click="$emit('close')" :icon="Close" size="small" text />
    </div>

    <div v-if="node" class="node-panel-content">
      <div class="node-info">
        <div class="info-item">
          <label>ID:</label>
          <span>{{ node.id }}</span>
        </div>

        <!-- 动态显示所有节点属性 -->
        <div
          v-for="(value, key) in getAllNodeProperties()"
          :key="key"
          class="info-item"
        >
          <label>{{ formatPropertyLabel(key) }}:</label>
          <span v-if="typeof value === 'string' && value.startsWith('http')">
            <el-link :href="value" target="_blank" type="primary" :underline="false">
              {{ value }}
            </el-link>
          </span>
          <span v-else>
            {{ formatPropertyValue(value) }}
          </span>
        </div>
      </div>
    </div>

    <div v-else class="no-node-selected">
      <p>未选择任何节点</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GraphNode } from '@/services/graphService'
import {
  Close,
} from '@element-plus/icons-vue'

// Props
interface Props {
  node: GraphNode | null
}

const props = withDefaults(defineProps<Props>(), {
  node: () => null
})

// Emits
defineEmits(['close'])

// 获取所有节点属性（包括基本属性和properties对象中的属性）
const getAllNodeProperties = (): Record<string, any> => {
  if (!props.node) return {}

  // 合并基本属性和properties对象中的属性
  const allProperties: Record<string, any> = {
    ...props.node.properties,
    // 添加其他可能在node对象顶层的属性
    ...(props.node.label ? { label: props.node.label } : {}),
    ...(props.node.type ? { type: props.node.type } : {}),
  }

  return allProperties
}

// 格式化属性标签
const formatPropertyLabel = (key: string): string => {
  const labelMap: Record<string, string> = {
    'device_name': '设备名称',
    'port_name': '端口名称',
    'subarea': '区域',
    'dc': '数据中心',
    'manage_ip': '管理IP',
    'name': '名称',
    'type': '类型',
    'description': '描述',
    'status': '状态',
    'category': '分类'
  }
  return labelMap[key] || key
}

// 格式化属性值
const formatPropertyValue = (value: any): string => {
  if (value === null || value === undefined) {
    return 'N/A'
  }
  if (typeof value === 'boolean') {
    return value ? '是' : '否'
  }
  if (Array.isArray(value)) {
    return value.join(', ')
  }
  return String(value)
}
</script>

<style scoped>
.node-panel {
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

.node-panel-header {
  padding: var(--space-3);
  border-bottom: 1px solid var(--color-border-default);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-bg-subtle);
  border-radius: var(--border-radius) var(--border-radius) 0 0;
}

.node-panel-header h3 {
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

.node-panel-content {
  padding: var(--space-3);
  flex: 1;
  overflow-y: auto;
}

.node-info {
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

.no-node-selected {
  padding: var(--space-5);
  text-align: center;
  color: var(--color-fg-muted);
}
</style>