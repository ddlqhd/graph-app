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
      <div v-if="false" class="debug-info">
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

        <LayoutControls
            :graph="graph"
            :graph-data="graphData"
            @layout-changed="onLayoutChanged"
          />
      </div>

      <!-- 图例 -->
      <GraphLegend :graph-data="graphData" />
    </div>

    <!-- 节点详情面板 -->
    <GraphNodePanel
      v-if="selectedNode"
      :node="selectedNode"
      @close="clearSelection"
      @expand="onExpandNode"
    />

    <!-- 边详情面板 -->
    <GraphEdgePanel
      v-if="selectedEdge"
      :edge="selectedEdge"
      @close="clearSelection"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import * as G6 from '@antv/g6'
import type { GraphData as G6GraphData } from '@antv/g6'
import { storeToRefs } from 'pinia'
import { useGraphStore } from '@/stores/graph'
import { registerCustomNodeTypes } from './CustomGraphNode'
import GraphNodePanel from './GraphNodePanel.vue'
import GraphEdgePanel from './GraphEdgePanel.vue'
import GraphLegend from './GraphLegend.vue'
import LayoutControls from './LayoutControls.vue'
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
  selectedEdge,
  loading,
  error,
  nodeTypes
} = storeToRefs(graphStore)

// Refs
const graphContainer = ref<HTMLDivElement>()
let graph: any = null
const tempEdgeIds = ref<string[]>([]) // 用于存储临时添加的边的ID



// 防止重复更新的锁机制
let isUpdating = false
let updateTimeoutId: number | null = null



// Define type color mappings (needed for convertToG6Data)
const nodeTypeColors: Record<string, string> = {
  'Device': '#3498DB',
  'Port': '#E74C3C'
}

const edgeTypeColors: Record<string, string> = {
  'default': '#BDC3C7'  // Default color for edges
}

const getNodeColor = (nodeType: string) => {
  return nodeTypeColors[nodeType] || '#95A5A6'
}

const getEdgeColor = (edgeType: string) => {
  return edgeTypeColors[edgeType] || '#BDC3C7'
}

import { registerCustomNodeTypes } from './CustomGraphNode'

// 初始化图
const initGraph = () => {
  console.log('🎨 initGraph 被调用')
  console.log('  graphContainer.value:', graphContainer.value)

  if (!graphContainer.value) {
    console.error('❌ graphContainer 不存在，无法初始化')
    return
  }

  // 注册自定义节点类型
  registerCustomNodeTypes();

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

    // 配置 Graph 参数
    const graphConfig: any = {
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
        type: 'circle', // Default shape for non-image nodes
        style: {
          fill: '#4ECDC4',
          stroke: 'transparent', // Transparent border
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
          lineWidth: 2
        },
        labelCfg: {
          style: {
            fontSize: 0,  // 隐藏标签
            fill: '#666'
          }
        }
      },

      // 状态样式
      nodeStateStyles: {
        highlight: {
          fill: '#F39C12',
          stroke: '#F39C12',
          lineWidth: 5,
          shadowColor: '#F39C12',
          shadowBlur: 15,
        },
        inactive: {
          fill: '#333',
          stroke: 'transparent',
          lineWidth: 1,
          opacity: 0.3,
        },
        selected: {
          stroke: '#2ECC71',
          lineWidth: 4,
        }
      },
      edgeStateStyles: {
        highlight: {
          stroke: '#F39C12',
          lineWidth: 3,
        },
        inactive: {
          stroke: '#333',
          opacity: 0.3,
        },
        // 鼠标悬停时的样式
        hover: {
          stroke: '#2ECC71',
          lineWidth: 4,
          cursor: 'pointer'
        },
        // 选中时的样式
        selected: {
          stroke: '#2ECC71',
          lineWidth: 4
        }
      }
    }

    graph = new G6.Graph(graphConfig)

    console.log('✅ G6实例创建成功:', graph)
    console.log('  容器元素:', graphContainer.value)
    console.log('  画布尺寸:', width, 'x', height)

    // 验证关键方法是否存在
    console.log('🔍 验证关键方法:')
    console.log('  - data:', typeof graph.data)
    console.log('  - render:', typeof graph.render)
    console.log('  - destroy:', typeof graph.destroy)

    // 绑定事件
    bindEvents()

    // 绑定布局完成事件
    graph.on('afterlayout', () => {
      console.log('🎆 布局完成事件触发')
      setTimeout(() => {
        console.log('🎯 布局完成后自动适应画布')
        fitView()
      }, 100)
    })
    console.log('✅ 事件绑定完成')

  } catch (error) {
    console.error('❌ 创建G6实例失败:', error)
    console.error('错误详情:', error.stack)
    graphStore.setError('图表初始化失败: ' + error.message)
  }
}

  // 绑定图事件
const bindEvents = () => {
  if (!graph) return

  // 节点点击事件
  graph.on('node:click', (evt) => {
    const { item } = evt
    if (item) {
      const model = item.getModel()
      const node = graphData.value.nodes.find(n => n.id === model.id)
      if (node) {
        graphStore.selectNode(node)

        // 高亮选中的节点
        graph.setItemState(item, 'selected', true)

        // 清除其他节点的选中状态
        graph.getNodes().forEach(n => {
          if (n !== item) {
            graph.clearItemStates(n)
          }
        })
      }
    }
  })

  // 边点击事件
  graph.on('edge:click', (evt) => {
    const { item } = evt
    if (item) {
      const model = item.getModel()
      const edge = graphData.value.edges.find(e => e.id === model.id)
      if (edge) {
        graphStore.selectEdge(edge)

        // 高亮选中的边
        graph.setItemState(item, 'selected', true)

        // 清除其他边的选中状态
        graph.getEdges().forEach(e => {
          if (e !== item) {
            graph.clearItemStates(e)
          }
        })
      }
    }
  })

  // 画布点击事件（清除选择）
  graph.on('canvas:click', () => {
    clearSelection() // Use the local clearSelection function to clear visual states
  })

  // 节点悬浮事件
  graph.on('node:mouseenter', (evt) => {
    const { item } = evt
    if (item) {
      graph.setItemState(item, 'hover', true)
      // Change cursor to hand when hovering over nodes
      if (graphContainer.value) {
        graphContainer.value.style.cursor = 'pointer'
      }
    }
  })

  graph.on('node:mouseleave', (evt) => {
    const { item } = evt
    if (item) {
      graph.clearItemStates(item, 'hover')
      // Reset cursor to default when leaving nodes
      if (graphContainer.value) {
        graphContainer.value.style.cursor = 'default'
      }
    }
  })

  // 边悬浮事件
  graph.on('edge:mouseenter', (evt) => {
    const { item } = evt
    if (item) {
      graph.setItemState(item, 'hover', true)
      // Change cursor to hand when hovering over edges
      if (graphContainer.value) {
        graphContainer.value.style.cursor = 'pointer'
      }
    }
  })

  graph.on('edge:mouseleave', (evt) => {
    const { item } = evt
    if (item) {
      graph.clearItemStates(item, 'hover')
      // Reset cursor to default when leaving edges
      if (graphContainer.value) {
        graphContainer.value.style.cursor = 'default'
      }
    }
  })

  // 画布悬浮事件 - reset cursor when not over any node or edge
  graph.on('canvas:mouseenter', () => {
    if (graphContainer.value) {
      graphContainer.value.style.cursor = 'default'
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
    nodes: [],
    edges: []
  }

  // 使用Map来去重ID，保留最后一个
  const nodeMap = new Map()
  const edgeMap = new Map()

  // 转换节点并去重
  data.nodes.forEach((node, index) => {
    console.log(`  转换节点 ${index + 1}:`, node)

    // Check if the node type should use router icon
    const isRouterNode = node.type === 'Device'; // Assuming Device nodes should use router icon

    let nodeConfig: any;

    if (isRouterNode) {
      // Use custom router node for Device type
      nodeConfig = {
        id: node.id,
        label: node.label,
        type: 'router-node', // Use our custom node type
        size: node.size || 40,
      }
    } else {
      // Regular node configuration for non-router nodes
      nodeConfig = {
        id: node.id,
        label: node.label,
        size: node.size || 40,
        type: 'circle', // Default to circle node type
        style: {
          fill: node.color || getNodeColor(node.type),
          stroke: 'transparent', // Transparent border
          lineWidth: 1,
          opacity: 1,
          cursor: 'pointer'
        }
      }
    }

    if (nodeMap.has(node.id)) {
      console.warn(`⚠️ 发现重复节点ID: ${node.id}，将被覆盖`)
    }
    nodeMap.set(node.id, nodeConfig)
  })

  // 转换边并去重
  data.edges.forEach((edge, index) => {
    console.log(`  转换边 ${index + 1}:`, edge)
    const edgeConfig = {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      style: {
        stroke: edge.color || '#BDC3C7',
        lineWidth: edge.style?.lineWidth || 2
      }
    }

    if (edgeMap.has(edge.id)) {
      console.warn(`⚠️ 发现重复边ID: ${edge.id}，将被覆盖`)
    }
    edgeMap.set(edge.id, edgeConfig)
  })

  // 转换为数组
  g6Data.nodes = Array.from(nodeMap.values())
  g6Data.edges = Array.from(edgeMap.values())

  console.log('✅ 转换完成（已去重）:')
  console.log('  原始节点数:', data.nodes?.length || 0)
  console.log('  原始边数:', data.edges?.length || 0)
  console.log('  输出G6节点数:', g6Data.nodes.length)
  console.log('  输出G6边数:', g6Data.edges.length)
  console.log('  G6数据结果:', g6Data)

  return g6Data
}

// 更新图数据
const updateGraphData = async () => {
  // 防止重复执行检查
  if (isUpdating) {
    console.log('⚠️ updateGraphData 已在执行中，忽略这次调用')
    return
  }

  // 设置锁状态
  isUpdating = true
  console.log('🔒 设置 updateGraphData 锁状态')

  try {
    console.log('=== updateGraphData 开始执行 ===')
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

      // 先完全清除现有数据和状态，解决ID重复问题
      console.log('🧹 完全清除现有数据')

      // 强制清除所有现有元素
      try {
        // 获取所有现有节点和边的引用
        const existingNodes = [...graph.getNodes()]
        const existingEdges = [...graph.getEdges()]

        console.log(`清除前状态: ${existingNodes.length}个节点, ${existingEdges.length}条边`)

        // 先移除所有边，再移除节点
        existingEdges.forEach(edge => {
          try {
            graph.removeItem(edge, false) // false表示不触发重新渲染
          } catch (e) {
            console.warn('移除边时出错:', e)
          }
        })

        existingNodes.forEach(node => {
          try {
            graph.removeItem(node, false) // false表示不触发重新渲染
          } catch (e) {
            console.warn('移除节点时出错:', e)
          }
        })

        console.log('✅ 手动移除完成')
      } catch (error) {
        console.warn('⚠️ 手动清除时出错:', error)
      }

      // 使用clear()方法进行彻底清理
      graph.clear()

      // 等待DOM更新完成
      await nextTick()

      // 验证清理结果
      console.log(`清除后验证: ${graph.getNodes().length}个节点, ${graph.getEdges().length}条边`)

      // 重新初始化图表状态
      graph.set('animate', false) // 禁用动画避免干扰

      // G6 4.x 使用 data + render
      if (typeof graph.data === 'function') {
        console.log('使用 G6 4.x data 方法设置数据')

        // 验证数据中ID的唯一性
        const nodeIds = new Set()
        const edgeIds = new Set()
        const duplicateNodes: string[] = []
        const duplicateEdges: string[] = []

        g6Data.nodes.forEach(node => {
          if (nodeIds.has(node.id)) {
            duplicateNodes.push(node.id)
          } else {
            nodeIds.add(node.id)
          }
        })

        g6Data.edges.forEach(edge => {
          if (edgeIds.has(edge.id)) {
            duplicateEdges.push(edge.id)
          } else {
            edgeIds.add(edge.id)
          }
        })

        if (duplicateNodes.length > 0) {
          console.warn('⚠️ 发现重复节点ID:', duplicateNodes)
        }
        if (duplicateEdges.length > 0) {
          console.warn('⚠️ 发现重复边ID:', duplicateEdges)
        }

        // 等待更长时间确保清理完成
        await new Promise(resolve => setTimeout(resolve, 100))

        // 再次验证清理结果
        const remainingNodes = graph.getNodes().length
        const remainingEdges = graph.getEdges().length
        console.log(`设置新数据前再次检查: ${remainingNodes}个节点, ${remainingEdges}条边`)

        if (remainingNodes > 0 || remainingEdges > 0) {
          console.warn('⚠️ 检测到未清理干净的元素，再次清理')
          graph.clear()
          await new Promise(resolve => setTimeout(resolve, 50))
        }

        // 设置数据
        console.log('📊 开始设置新数据...')
        graph.data(g6Data)

        // 等待一个周期再渲染
        await nextTick()

        console.log('🎨 开始渲染...')
        graph.render()
        console.log('✅ G6 4.x data + render 完成')
      } else {
        console.error('❌ G6 4.x data 方法不可用')
        return
      }

      // 重新启用动画
      graph.set('animate', true)

      console.log('✅ 图表渲染完成')
      console.log('🔍 验证渲染结果:')
      console.log('  - 画布中的节点数:', graph.getNodes()?.length || 0)
      console.log('  - 画布中的边数:', graph.getEdges()?.length || 0)

      // 适应画布
      nextTick(() => {
        // 等待渲染和布局完成后再适应画布
        setTimeout(() => {
          console.log('🎯 数据筛选后自动适应画布')
          fitView()

          // 再次验证并尝试第二次适应
          setTimeout(() => {
            console.log('🔄 第二次适应尝试')
            fitView()

            console.log('🔍 最终验证:')
            console.log('  - DOM中的SVG元素:', graphContainer.value?.querySelector('svg'))
            console.log('  - SVG中的元素数量:', graphContainer.value?.querySelectorAll('svg *').length)
          }, 1000) // 第二次适应，确保布局完成
        }, 300) // 等待初始渲染完成
      })
    } catch (error) {
      console.error('❌ 更新图表数据时出错:', error)
      console.error('错误详情:', error.stack)
      graphStore.setError('图表数据更新失败: ' + error.message)

      // 如果仍然是ports错误，尝试不带边的数据
      if (error.message && error.message.includes('getPorts')) {
        console.log('🔄 检测到ports错误，尝试只加载节点数据')
        try {
          const nodesOnlyData = {
            nodes: convertToG6Data(graphData.value).nodes,
            edges: [] // 不加载边
          }

          graph.clear()
          graph.data(nodesOnlyData)
          graph.render()
          console.log('✅ 只加载节点成功')
        } catch (retryError) {
          console.error('❌ 只加载节点也失败:', retryError)
        }
      }
    }
  } finally {
    // 解除锁状态
    isUpdating = false
    console.log('🔓 解除 updateGraphData 锁状态')
  }
}

// 图操作方法
const fitView = () => {
  if (graph) {
    try {
      // 先检查是否有节点
      const nodes = graph.getNodes()
      if (nodes && nodes.length > 0) {
        console.log('🎯 执行fitView，节点数:', nodes.length)
        // 使用适当的边距
        graph.fitView(20)
        console.log('✅ fitView 执行完成')
      } else {
        console.log('⚠️ 没有节点，跳过fitView')
      }
    } catch (error) {
      console.error('❌ fitView 执行失败:', error)
    }
  } else {
    console.log('⚠️ graph实例不存在，无法执行fitView')
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



// 清除选择
const clearSelection = () => {
  graphStore.clearSelection()

  if (graph) {
    graph.getNodes().forEach(node => {
      graph.clearItemStates(node)
    })
    graph.getEdges().forEach(edge => {
      graph.clearItemStates(edge)
    })
  }
}

// 布局变更处理
const onLayoutChanged = (layoutType: string) => {
  console.log(`🎯 布局已更改为: ${layoutType}`)
  // 布局更改后自动适应画布
  setTimeout(() => {
    console.log('🎯 布局更改后自动适应画布')
    fitView()
  }, 800) // 等待布局动画完成
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

// 监听数据变化 - 添加防抖机制
watch(graphData, (newData, oldData) => {
  console.log('=== graphData 变化了 ===')
  console.log('旧数据:', oldData)
  console.log('新数据:', newData)
  console.log('新数据节点数:', newData?.nodes?.length || 0)
  console.log('新数据边数:', newData?.edges?.length || 0)
  console.log('graph实例是否存在:', !!graph)

  // 清除之前的防抖定时器
  if (updateTimeoutId) {
    clearTimeout(updateTimeoutId)
    console.log('⏰ 清除之前的更新定时器')
  }

  // 设置新的防抖定时器
  updateTimeoutId = window.setTimeout(() => {
    if (graph && newData && newData.nodes && newData.nodes.length > 0) {
      console.log('✅ 有数据且graph存在，开始更新')
      updateGraphData()
    } else if (!graph) {
      console.log('⚠️ graph实例不存在，等待初始化')
    } else if (!newData || !newData.nodes || newData.nodes.length === 0) {
      console.log('⚠️ 数据为空或不存在')
    }
    // 重置定时器ID
    updateTimeoutId = null
  }, 100) // 100ms防抖延迟

  console.log('⏰ 设置更新定时器')
}, { deep: true })

// --- 路径高亮 ---
// 清除路径高亮
const clearPathHighlight = () => {
  if (!graph) return;

  // 移除临时添加的边
  tempEdgeIds.value.forEach(edgeId => {
    const edge = graph.findById(edgeId);
    if (edge) {
      graph.removeItem(edge);
    }
  });
  tempEdgeIds.value = []; // 清空ID列表

  graph.getNodes().forEach(node => {
    graph.clearItemStates(node, ['highlight', 'inactive']);
  });
  graph.getEdges().forEach(edge => {
    graph.clearItemStates(edge, ['highlight', 'inactive']);
  });
};

// 高亮显示路径
const highlightPath = (pathNodes: { id: string }[]) => {
  if (!graph) return;

  clearPathHighlight();

  if (!pathNodes || pathNodes.length === 0) {
    return;
  }

  const pathNodeIds = new Set(pathNodes.map(n => n.id));

  // 找出路径上的边
  const pathEdgeIds = new Set();
  graph.getEdges().forEach(edge => {
    const edgeModel = edge.getModel();
    if (pathNodeIds.has(edgeModel.source) && pathNodeIds.has(edgeModel.target)) {
      pathEdgeIds.add(edgeModel.id);
    }
  });

  // 设置节点和边的状态
  graph.getNodes().forEach(node => {
    if (pathNodeIds.has(node.getID())) {
      graph.setItemState(node, 'highlight', true);
    } else {
      graph.setItemState(node, 'inactive', true);
    }
  });

  graph.getEdges().forEach(edge => {
    if (pathEdgeIds.has(edge.getID())) {
      graph.setItemState(edge, 'highlight', true);
    } else {
      graph.setItemState(edge, 'inactive', true);
    }
  });
};

// 高亮简化路径（只显示Device和它们之间的虚拟边）
const highlightSimplifiedPath = (pathData: any) => {
  if (!graph) return;

  clearPathHighlight(); // 清除任何现有高亮和临时边

  const deviceNodes = pathData.nodes.filter((n: any) => n.type === 'Device');
  const deviceNodeIds = new Set(deviceNodes.map((n: any) => n.id));

  // 1. 将所有现有节点和边设为 inactive
  graph.getNodes().forEach((node: any) => {
    graph.setItemState(node, 'inactive', true);
  });
  graph.getEdges().forEach((edge: any) => {
    graph.setItemState(edge, 'inactive', true);
  });

  // 2. 高亮路径中的 Device 节点
  deviceNodes.forEach((deviceNode: any) => {
    const nodeInGraph = graph.findById(deviceNode.id);
    if (nodeInGraph) {
      graph.setItemState(nodeInGraph, 'highlight', true);
      graph.setItemState(nodeInGraph, 'inactive', false); // 覆盖 inactive
    }
  });

  // 3. 添加设备之间的虚拟边
  for (let i = 0; i < deviceNodes.length - 1; i++) {
    const sourceId = deviceNodes[i].id;
    const targetId = deviceNodes[i + 1].id;
    const tempEdgeId = `temp-edge-${sourceId}-${targetId}`;

    graph.addItem('edge', {
      id: tempEdgeId,
      source: sourceId,
      target: targetId,
      style: {
        stroke: '#F39C12', // 高亮颜色
        lineWidth: 3,
        lineDash: [5, 5], // 虚线样式
        shadowColor: '#F39C12',
        shadowBlur: 15,
      },
    });
    tempEdgeIds.value.push(tempEdgeId);
  }
};


// 添加方法到组件暴露接口
defineExpose({
  highlightPath,
  highlightSimplifiedPath,
  clearPathHighlight,
  graph // 暴露 graph 实例以便外部组件可以直接操作
});

// 监听窗口大小变化
const handleResize = () => {
  if (graph && props.autoResize && graphContainer.value) {
    const { clientWidth, clientHeight } = graphContainer.value
    graph.changeSize(clientWidth, clientHeight)
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
      console.log('⚠️ 等待数据加载和watch响应')
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

  // 清理防抖定时器
  if (updateTimeoutId) {
    clearTimeout(updateTimeoutId)
    updateTimeoutId = null
  }
})
</script>

<style scoped>
.graph-viewer {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  background: var(--color-bg-default);
  border-radius: var(--border-radius);
  overflow: hidden;
  border: 1px solid var(--color-border-default);
}

.graph-container {
  position: relative;
  flex: 1;
  background: var(--color-bg-default);
  border-radius: var(--border-radius);
  margin: 0;
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
  background: var(--color-bg-default);
  opacity: 0.9;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-5);
  background: var(--color-bg-default);
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border-default);
  box-shadow: var(--shadow-medium);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 2px solid var(--color-border-default);
  border-top: 2px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-content p {
  margin: 0;
  color: var(--color-fg-muted);
  font-size: 14px;
  font-weight: 500;
}

.error-overlay {
  position: absolute;
  top: var(--space-3);
  left: var(--space-3);
  right: var(--space-3);
  z-index: 10;
}

.graph-toolbar {
  position: absolute;
  top: var(--space-3);
  left: var(--space-3);
  background: var(--color-bg-default);
  padding: var(--space-2);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-medium);
  border: 1px solid var(--color-border-default);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  transition: all 0.2s cubic-bezier(0.3, 0, 0.5, 1);
}

.graph-toolbar:hover {
  box-shadow: var(--shadow-large);
  border-color: var(--color-border-muted);
}



.debug-info {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  background: var(--color-bg-emphasis);
  padding: var(--space-2);
  border-radius: var(--border-radius);
  font-size: 11px;
  z-index: 100;
  border: 1px solid var(--color-border-default);
  color: var(--color-fg-on-emphasis);
  box-shadow: var(--shadow-medium);
  min-width: 160px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
}

.debug-info p {
  margin: 2px 0;
  color: var(--color-fg-on-emphasis);
  font-weight: 400;
}

.debug-actions {
  margin-top: var(--space-2);
  display: flex;
  gap: var(--space-1);
}

/* Dark theme specific adjustments */
:root[data-theme="dark"] .debug-info,
.dark .debug-info {
  background: var(--color-bg-muted);
  color: var(--color-fg-default);
}

:root[data-theme="dark"] .debug-info p,
.dark .debug-info p {
  color: var(--color-fg-default);
}
</style>