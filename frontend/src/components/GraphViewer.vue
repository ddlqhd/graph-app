<template>
  <div class="graph-viewer">
    <div class="graph-container">
      <div ref="graphContainer" class="graph-canvas"></div>

      <!-- 加载状态 -->
      <div v-if="loading && (!graphData.nodes || graphData.nodes.length === 0)" class="loading-overlay">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <p>正在加载图数据...</p>
        </div>
      </div>

      <!-- 调试信息 -->
      <div class="debug-info">
        <p>节点数: {{ graphData.nodes?.length || 0 }}</p>
        <p>边数: {{ graphData.edges?.length || 0 }}</p>
        <p>加载状态: {{ loading ? '加载中' : '已完成' }}</p>
        <p>错误: {{ error || '无' }}</p>
        <p>Graph实例: {{ graph ? '已创建' : '未创建' }}</p>
        <div v-if="graphData.nodes?.length > 0">
          <h5>前3个节点:</h5>
          <ul>
            <li v-for="node in graphData.nodes.slice(0, 3)" :key="node.id">
              {{ node.label }} ({{ node.type }})
            </li>
          </ul>
        </div>
        <div class="debug-actions">
          <el-button size="small" @click="forceResetLoading">强制重置Loading</el-button>
          <el-button size="small" @click="forceUpdateGraph">强制更新图表</el-button>
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="error-overlay">
        <el-alert
          :title="error"
          type="error"
          show-icon
          :closable="false"
        />
      </div>

      <!-- 图控制工具栏 -->
      <div class="graph-toolbar">
        <el-button-group>
          <el-tooltip content="适应画布">
            <el-button @click="fitView" :icon="FullScreen" />
          </el-tooltip>
          <el-tooltip content="放大">
            <el-button @click="zoomIn" :icon="ZoomIn" />
          </el-tooltip>
          <el-tooltip content="缩小">
            <el-button @click="zoomOut" :icon="ZoomOut" />
          </el-tooltip>
          <el-tooltip content="重置缩放">
            <el-button @click="resetZoom" :icon="Refresh" />
          </el-tooltip>
        </el-button-group>

        <el-divider direction="vertical" />

        <el-button-group>
          <el-tooltip content="力导向布局">
            <el-button
              @click="changeLayout('force')"
              :type="currentLayout === 'force' ? 'primary' : 'default'"
            >
              力导向
            </el-button>
          </el-tooltip>
          <el-tooltip content="层次布局">
            <el-button
              @click="changeLayout('dagre')"
              :type="currentLayout === 'dagre' ? 'primary' : 'default'"
            >
              层次
            </el-button>
          </el-tooltip>
          <el-tooltip content="辐射布局">
            <el-button
              @click="changeLayout('radial')"
              :type="currentLayout === 'radial' ? 'primary' : 'default'"
            >
              辐射
            </el-button>
          </el-tooltip>
          <el-tooltip content="网格布局">
            <el-button
              @click="changeLayout('grid')"
              :type="currentLayout === 'grid' ? 'primary' : 'default'"
            >
              网格
            </el-button>
          </el-tooltip>
        </el-button-group>
      </div>

      <!-- 图例 -->
      <div class="graph-legend">
        <div class="legend-title">图例</div>
        <div class="legend-items">
          <div
            v-for="nodeType in nodeTypes"
            :key="nodeType"
            class="legend-item"
          >
            <div
              class="legend-color"
              :style="{ backgroundColor: getNodeColor(nodeType) }"
            ></div>
            <span class="legend-label">{{ nodeType }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 节点详情面板 -->
    <GraphNodePanel
      v-if="selectedNode"
      :node="selectedNode"
      @close="clearSelection"
      @expand="onExpandNode"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import * as G6 from '@antv/g6'
import { storeToRefs } from 'pinia'
import { useGraphStore } from '@/stores/graph'
import GraphNodePanel from './GraphNodePanel.vue'
import {
  FullScreen,
  ZoomIn,
  ZoomOut,
  Refresh
} from '@element-plus/icons-vue'

// Props
interface Props {
  width?: number
  height?: number
  autoResize?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: 800,
  height: 600,
  autoResize: true
})

// Store
const graphStore = useGraphStore()
const {
  graphData,
  selectedNode,
  loading,
  error,
  nodeTypes
} = storeToRefs(graphStore)

// Refs
const graphContainer = ref<HTMLDivElement>()
let graph: any = null

// State
const currentLayout = ref('force')

// Computed
const nodeTypeColors: Record<string, string> = {
  'Person': '#FF6B6B',
  'Department': '#4ECDC4',
  'Project': '#45B7D1',
  'Skill': '#F7DC6F'
}

const getNodeColor = (nodeType: string) => {
  return nodeTypeColors[nodeType] || '#95A5A6'
}

// 初始化图
const initGraph = () => {
  console.log('🎨 initGraph 被调用')
  console.log('  graphContainer.value:', graphContainer.value)

  if (!graphContainer.value) {
    console.error('❌ graphContainer 不存在，无法初始化')
    return
  }

  // 获取容器的实际尺寸
  const { clientWidth, clientHeight } = graphContainer.value
  const width = clientWidth || props.width
  const height = clientHeight || props.height

  console.log('📏 容器尺寸:', { width, height, clientWidth, clientHeight })

  // 如果已经存在graph实例，先销毁它
  if (graph) {
    console.log('🗑️ 销毁现有graph实例')
    graph.destroy()
    graph = null
  }

  try {
    console.log('🎆 创建G6实例...')
    graph = new G6.Graph({
      container: graphContainer.value,
      width,
      height,
      modes: {
        default: [
          'drag-canvas',
          'zoom-canvas',
          'drag-node',
          'click-select'
        ]
      },
      layout: {
        type: 'force',
        preventOverlap: true,
        nodeStrength: -300,
        edgeStrength: 0.1,
        linkDistance: 150
      },
      defaultNode: {
        size: 40,
        style: {
          fill: '#4ECDC4',
          stroke: '#fff',
          lineWidth: 2
        },
        labelCfg: {
          position: 'bottom',
          offset: 5,
          style: {
            fontSize: 12,
            fill: '#333'
          }
        }
      },
      defaultEdge: {
        style: {
          stroke: '#BDC3C7',
          lineWidth: 2,
          endArrow: {
            path: 'M 0,0 L 8,4 L 8,-4 Z',
            fill: '#BDC3C7'
          }
        },
        labelCfg: {
          autoRotate: true,
          style: {
            fontSize: 10,
            fill: '#666'
          }
        }
      }
    })

    console.log('✅ G6实例创建成功:', graph)
    console.log('  容器元素:', graphContainer.value)
    console.log('  画布尺寸:', width, 'x', height)
    console.log('  G6对象:', G6)
    console.log('  graph方法:', typeof graph.data, typeof graph.render, typeof graph.destroy)

    // 验证 graph 实例的方法
    if (typeof graph.data !== 'function') {
      console.error('❌ graph.data 不是一个函数!', graph)
      throw new Error('Graph instance is invalid')
    }

    // 绑定事件
    bindEvents()
    console.log('✅ 事件绑定完成')

  } catch (error) {
    console.error('❌ 创建G6实例失败:', error)
    console.error('错误详情:', error.stack)
  }
}

// 绑定图事件
const bindEvents = () => {
  if (!graph) return

  // 节点点击事件
  graph.on('node:click', (evt) => {
    const { itemId } = evt
    if (itemId) {
      const node = graphData.value.nodes.find(n => n.id === itemId)
      if (node) {
        graphStore.selectNode(node)

        // 高亮选中的节点
        graph.setItemState(itemId, 'selected', true)

        // 清除其他节点的选中状态
        graph.getAllNodesData().forEach(nodeData => {
          if (nodeData.id !== itemId) {
            graph.setItemState(nodeData.id, 'selected', false)
          }
        })
      }
    }
  })

  // 边点击事件
  graph.on('edge:click', (evt) => {
    const { itemId } = evt
    if (itemId) {
      const edge = graphData.value.edges.find(e => e.id === itemId)
      if (edge) {
        graphStore.selectEdge(edge)

        // 高亮选中的边
        graph.setItemState(itemId, 'selected', true)

        // 清除其他边的选中状态
        graph.getAllEdgesData().forEach(edgeData => {
          if (edgeData.id !== itemId) {
            graph.setItemState(edgeData.id, 'selected', false)
          }
        })
      }
    }
  })

  // 画布点击事件（清除选择）
  graph.on('canvas:click', () => {
    graphStore.clearSelection()

    // 清除所有高亮状态
    graph.getAllNodesData().forEach(nodeData => {
      graph.setItemState(nodeData.id, 'selected', false)
    })
    graph.getAllEdgesData().forEach(edgeData => {
      graph.setItemState(edgeData.id, 'selected', false)
    })
  })

  // 节点悬浮事件
  graph.on('node:pointerenter', (evt) => {
    const { itemId } = evt
    if (itemId && !graph.getItemState(itemId, 'selected')) {
      graph.setItemState(itemId, 'hover', true)
    }
  })

  graph.on('node:pointerleave', (evt) => {
    const { itemId } = evt
    if (itemId && !graph.getItemState(itemId, 'selected')) {
      graph.setItemState(itemId, 'hover', false)
    }
  })

  // 边悬浮事件
  graph.on('edge:pointerenter', (evt) => {
    const { itemId } = evt
    if (itemId && !graph.getItemState(itemId, 'selected')) {
      graph.setItemState(itemId, 'hover', true)
    }
  })

  graph.on('edge:pointerleave', (evt) => {
    const { itemId } = evt
    if (itemId && !graph.getItemState(itemId, 'selected')) {
      graph.setItemState(itemId, 'hover', false)
    }
  })
}

// 转换数据格式
const convertToG6Data = (data: typeof graphData.value) => {
  console.log('🔄 convertToG6Data 开始转换:')
  console.log('  输入数据:', data)
  console.log('  输入节点数:', data.nodes?.length || 0)
  console.log('  输入边数:', data.edges?.length || 0)

  if (!data || !data.nodes) {
    console.error('❌ 输入数据无效')
    return { nodes: [], edges: [] }
  }

  const g6Data = {
    nodes: data.nodes.map((node, index) => {
      console.log(`  转换节点 ${index + 1}:`, node)
      return {
        id: node.id,
        label: node.label,
        size: node.size || 40,
        style: {
          fill: node.color || getNodeColor(node.type)
        }
      }
    }),
    edges: data.edges.map((edge, index) => {
      console.log(`  转换边 ${index + 1}:`, edge)
      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        style: {
          stroke: edge.color || '#BDC3C7',
          lineWidth: edge.style?.lineWidth || 2
        }
      }
    })
  }

  console.log('✅ 转换完成:')
  console.log('  输出G6节点数:', g6Data.nodes.length)
  console.log('  输出G6边数:', g6Data.edges.length)
  console.log('  G6数据结果:', g6Data)

  return g6Data
}

// 更新图数据
const updateGraphData = () => {
  console.log('=== updateGraphData 被调用 ===')
  console.log('graphData.value:', graphData.value)
  console.log('graph 实例:', graph)
  console.log('graph 容器元素:', graphContainer.value)

  if (!graph) {
    console.error('❌ graph 实例不存在，跳过更新')
    console.log('尝试重新初始化graph...')
    if (graphContainer.value) {
      initGraph()
      // 初始化后再次尝试更新
      setTimeout(() => updateGraphData(), 100)
    }
    return
  }

  // 验证 graph 实例的 data 方法
  if (typeof graph.data !== 'function') {
    console.error('❌ graph.data 不是一个函数!', {
      graph,
      type: typeof graph,
      methods: Object.getOwnPropertyNames(graph),
      proto: Object.getPrototypeOf(graph)
    })
    return
  }

  if (!graphData.value || !graphData.value.nodes || graphData.value.nodes.length === 0) {
    console.warn('⚠️ 没有有效的图数据，跳过更新')
    console.log('graphData.value 详情:', {
      exists: !!graphData.value,
      hasNodes: !!(graphData.value?.nodes),
      nodeCount: graphData.value?.nodes?.length || 0
    })
    return
  }

  try {
    console.log('✅ 准备转换数据格式')
    const g6Data = convertToG6Data(graphData.value)
    console.log('🔄 转换后的G6数据:', g6Data)
    console.log('📊 G6数据统计:', {
      nodeCount: g6Data.nodes?.length || 0,
      edgeCount: g6Data.edges?.length || 0
    })

    if (!g6Data.nodes || g6Data.nodes.length === 0) {
      console.error('❌ G6数据转换后为空，跳过更新')
      return
    }

    console.log('🎨 开始更新G6图表数据')

    // 在G6 4.x版本中，使用data和render方法
    graph.data(g6Data)
    graph.render()

    console.log('✅ 图表渲染完成')
    console.log('🔍 验证渲染结果:')
    console.log('  - 画布中的节点数:', graph.getAllNodesData().length)
    console.log('  - 画布中的边数:', graph.getAllEdgesData().length)

    // 适应画布
    nextTick(() => {
      console.log('📐 执行fitView')
      fitView()

      // 再次验证
      setTimeout(() => {
        console.log('🔍 最终验证:')
        console.log('  - DOM中的SVG元素:', graphContainer.value?.querySelector('svg'))
        console.log('  - SVG中的元素数量:', graphContainer.value?.querySelectorAll('svg *').length)
      }, 500)
    })
  } catch (error) {
    console.error('❌ 更新图表数据时出错:', error)
    console.error('错误详情:', error.stack)
  }
}

// 图操作方法
const fitView = () => {
  if (graph) {
    graph.fitView()
  }
}

const zoomIn = () => {
  if (graph) {
    const zoom = graph.getZoom()
    graph.zoomTo(zoom * 1.2)
  }
}

const zoomOut = () => {
  if (graph) {
    const zoom = graph.getZoom()
    graph.zoomTo(zoom * 0.8)
  }
}

const resetZoom = () => {
  if (graph) {
    graph.zoomTo(1)
    graph.fitCenter()
  }
}

// 改变布局
const changeLayout = (layoutType: string) => {
  if (!graph) return

  currentLayout.value = layoutType

  const layoutConfig: Record<string, any> = {
    force: {
      type: 'force',
      preventOverlap: true,
      nodeStrength: -300,
      linkDistance: 150
    },
    dagre: {
      type: 'dagre',
      rankdir: 'TB',
      nodesep: 20,
      ranksep: 50
    },
    radial: {
      type: 'radial',
      center: [400, 300],
      linkDistance: 150,
      maxIteration: 1000,
      focusNode: graphData.value.nodes[0]?.id
    },
    grid: {
      type: 'grid',
      begin: [0, 0],
      preventOverlap: true,
      nodeSize: 50
    }
  }

  graph.setLayout(layoutConfig[layoutType])
  graph.layout()
}

// 清除选择
const clearSelection = () => {
  graphStore.clearSelection()

  if (graph) {
    graph.getAllNodesData().forEach(nodeData => {
      graph.setItemState(nodeData.id, 'selected', false)
    })
    graph.getAllEdgesData().forEach(edgeData => {
      graph.setItemState(edgeData.id, 'selected', false)
    })
  }
}

// 展开节点
const onExpandNode = async (nodeId: string) => {
  try {
    await graphStore.loadNodeDetails(nodeId)
  } catch (error) {
    console.error('展开节点失败:', error)
  }
}

// 调试方法
const forceResetLoading = () => {
  console.log('强制重置loading状态')
  graphStore.setLoading(false)
}

const forceUpdateGraph = () => {
  console.log('强制更新图表')
  if (graphData.value && graphData.value.nodes && graphData.value.nodes.length > 0) {
    updateGraphData()
  } else {
    console.log('没有数据可以更新')
  }
}

// 监听数据变化
watch(graphData, (newData, oldData) => {
  console.log('graphData 变化了:')
  console.log('旧数据:', oldData)
  console.log('新数据:', newData)
  console.log('新数据节点数:', newData?.nodes?.length || 0)
  console.log('新数据边数:', newData?.edges?.length || 0)
  updateGraphData()
}, { deep: true })

// 监听窗口大小变化
const handleResize = () => {
  if (graph && props.autoResize && graphContainer.value) {
    const { clientWidth, clientHeight } = graphContainer.value
    graph.setSize(clientWidth, clientHeight)
  }
}

// 生命周期
onMounted(() => {
  console.log('🚀 GraphViewer onMounted 被调用')
  console.log('  当前 graphData:', graphData.value)
  console.log('  当前 loading:', loading.value)
  console.log('  graphContainer DOM:', graphContainer.value)

  nextTick(() => {
    console.log('🔄 nextTick 执行，准备初始化图表')
    console.log('  graphContainer 在nextTick中:', graphContainer.value)

    if (!graphContainer.value) {
      console.error('❌ graphContainer 仍然不存在')
      return
    }

    // 初始化图表
    initGraph()

    // 检查初始化结果
    if (graph) {
      console.log('✅ 图表初始化完成')

      // 只有在数据存在时才更新
      if (graphData.value && graphData.value.nodes && graphData.value.nodes.length > 0) {
        console.log('📈 数据存在，更新图表')
        updateGraphData()
      } else {
        console.log('⚠️ 数据不存在，等待数据加载')
      }
    } else {
      console.error('❌ 图表初始化失败')
    }

    if (props.autoResize) {
      console.log('⚙️ 启用自动调整大小')
      window.addEventListener('resize', handleResize)
    }
  })
})

onUnmounted(() => {
  if (graph) {
    graph.destroy()
  }

  if (props.autoResize) {
    window.removeEventListener('resize', handleResize)
  }
})
</script>

<style scoped>
.graph-viewer {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
}

.graph-container {
  position: relative;
  flex: 1;
  background: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
}

.graph-canvas {
  width: 100%;
  height: 100%;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-content p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.error-overlay {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  z-index: 10;
}

.graph-toolbar {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 8px;
}

.graph-legend {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.9);
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 120px;
}

.legend-title {
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 14px;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-label {
  font-size: 12px;
  color: #666;
}

.debug-info {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 100;
  border: 1px solid #ddd;
}

.debug-info p {
  margin: 2px 0;
}

.debug-actions {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}
</style>