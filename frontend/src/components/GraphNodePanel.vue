<template>
  <div class="node-panel">
    <el-card class="panel-card">
      <template #header>
        <div class="panel-header">
          <span class="panel-title">
            <el-icon class="title-icon">
              <component :is="getNodeIcon(node.type)" />
            </el-icon>
            节点详情
          </span>
          <el-button
            type="text"
            size="small"
            @click="$emit('close')"
            :icon="Close"
          />
        </div>
      </template>

      <div class="node-info">
        <!-- 基础信息 -->
        <div class="info-section">
          <h4>基础信息</h4>
          <el-descriptions :column="1" size="small">
            <el-descriptions-item label="ID">
              {{ node.id }}
            </el-descriptions-item>
            <el-descriptions-item label="名称">
              <el-tag :color="node.color" class="name-tag">
                {{ node.label }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="类型">
              <el-tag :type="getTagType(node.type)">
                {{ node.type }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 属性信息 -->
        <div class="info-section" v-if="node.properties && Object.keys(node.properties).length > 0">
          <h4>属性信息</h4>
          <el-descriptions :column="1" size="small">
            <el-descriptions-item
              v-for="(value, key) in node.properties"
              :key="key"
              :label="formatPropertyLabel(key)"
            >
              <span v-if="typeof value === 'string' && value.startsWith('http')">
                <el-link :href="value" target="_blank" type="primary">
                  {{ value }}
                </el-link>
              </span>
              <span v-else>
                {{ formatPropertyValue(value) }}
              </span>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 相关节点信息 -->
        <div class="info-section" v-if="adjacentNodes.length > 0">
          <h4>
            相关节点
            <el-badge :value="adjacentNodes.length" class="item-badge" />
          </h4>
          <div class="adjacent-nodes">
            <el-tag
              v-for="adjNode in adjacentNodes"
              :key="adjNode.id"
              :color="adjNode.color"
              class="adjacent-node-tag"
              @click="$emit('selectNode', adjNode)"
            >
              {{ adjNode.label }}
            </el-tag>
          </div>
        </div>

        <!-- 连接关系 -->
        <div class="info-section" v-if="connectedEdges.length > 0">
          <h4>
            连接关系
            <el-badge :value="connectedEdges.length" class="item-badge" />
          </h4>
          <div class="connected-edges">
            <div
              v-for="edge in connectedEdges"
              :key="edge.id"
              class="edge-item"
            >
              <el-tag size="small" :type="getEdgeTagType(edge.type)">
                {{ edge.label || edge.type }}
              </el-tag>
              <span class="edge-direction">
                {{ getEdgeDirection(edge) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <template #footer>
        <div class="panel-actions">
          <el-button
            size="small"
            @click="$emit('expand', node.id)"
            :icon="ZoomIn"
          >
            展开相关
          </el-button>
          <el-button
            size="small"
            type="primary"
            @click="copyNodeInfo"
            :icon="CopyDocument"
          >
            复制信息
          </el-button>
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGraphStore } from '@/stores/graph'
import type { GraphNode, GraphEdge } from '@/services/graphService'
import {
  Close,
  ZoomIn,
  CopyDocument,
  User,
  OfficeBuilding,
  Document,
  Star
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// Props
interface Props {
  node: GraphNode
}

const props = defineProps<Props>()

// Emits
defineEmits<{
  close: []
  expand: [nodeId: string]
  selectNode: [node: GraphNode]
}>()

// Store
const graphStore = useGraphStore()
const { graphData } = storeToRefs(graphStore)

// Computed
const adjacentNodes = computed(() => {
  return graphStore.getAdjacentNodes(props.node.id)
})

const connectedEdges = computed(() => {
  return graphData.value.edges.filter(edge =>
    edge.source === props.node.id || edge.target === props.node.id
  )
})

// 获取节点图标
const getNodeIcon = (nodeType: string) => {
  const iconMap: Record<string, any> = {
    'Person': User,
    'Department': OfficeBuilding,
    'Project': Document,
    'Skill': Star
  }
  return iconMap[nodeType] || Star
}

// 获取标签类型
const getTagType = (nodeType: string) => {
  const typeMap: Record<string, any> = {
    'Person': 'success',
    'Department': 'primary',
    'Project': 'warning',
    'Skill': 'info'
  }
  return typeMap[nodeType] || 'default'
}

// 获取边标签类型
const getEdgeTagType = (edgeType: string) => {
  const typeMap: Record<string, any> = {
    'MANAGES': 'danger',
    'WORKS_IN': 'primary',
    'PARTICIPATES_IN': 'success',
    'HAS_SKILL': 'warning',
    'COLLABORATES_WITH': 'info'
  }
  return typeMap[edgeType] || 'default'
}

// 格式化属性标签
const formatPropertyLabel = (key: string): string => {
  const labelMap: Record<string, string> = {
    'name': '名称',
    'title': '职位',
    'department': '部门',
    'level': '级别',
    'description': '描述',
    'status': '状态',
    'category': '分类',
    'avatar': '头像'
  }
  return labelMap[key] || key
}

// 格式化属性值
const formatPropertyValue = (value: any): string => {
  if (value === null || value === undefined) {
    return '-'
  }
  if (typeof value === 'boolean') {
    return value ? '是' : '否'
  }
  if (Array.isArray(value)) {
    return value.join(', ')
  }
  return String(value)
}

// 获取边的方向描述
const getEdgeDirection = (edge: GraphEdge): string => {
  const sourceNode = graphData.value.nodes.find(n => n.id === edge.source)
  const targetNode = graphData.value.nodes.find(n => n.id === edge.target)

  if (edge.source === props.node.id) {
    return `→ ${targetNode?.label || '未知'}`
  } else {
    return `← ${sourceNode?.label || '未知'}`
  }
}

// 复制节点信息
const copyNodeInfo = async () => {
  try {
    const info = {
      id: props.node.id,
      label: props.node.label,
      type: props.node.type,
      properties: props.node.properties
    }

    await navigator.clipboard.writeText(JSON.stringify(info, null, 2))
    ElMessage.success('节点信息已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
.node-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 350px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  z-index: 100;
}

.panel-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
}

.title-icon {
  color: #409eff;
}

.node-info {
  max-height: 500px;
  overflow-y: auto;
}

.info-section {
  margin-bottom: 20px;
}

.info-section h4 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.name-tag {
  color: white !important;
  border: none;
}

.item-badge {
  margin-left: 4px;
}

.adjacent-nodes {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.adjacent-node-tag {
  cursor: pointer;
  transition: all 0.3s;
  color: white !important;
  border: none;
}

.adjacent-node-tag:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.connected-edges {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.edge-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
}

.edge-direction {
  color: #909399;
  font-size: 11px;
}

.panel-actions {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.panel-actions .el-button {
  flex: 1;
}

/* 滚动条样式 */
.node-info::-webkit-scrollbar {
  width: 4px;
}

.node-info::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.node-info::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.node-info::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>