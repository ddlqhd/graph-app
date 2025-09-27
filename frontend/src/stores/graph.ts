import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GraphData, GraphNode, GraphEdge, GraphStats } from '@/services/graphService'
import { graphAPI } from '@/services/graphService'

export const useGraphStore = defineStore('graph', () => {
  // 状态
  const graphData = ref<GraphData>({ nodes: [], edges: [] })
  const graphStats = ref<GraphStats | null>(null)
  const selectedNode = ref<GraphNode | null>(null)
  const selectedEdge = ref<GraphEdge | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchResults = ref<GraphNode[]>([])
  const currentView = ref<'all' | 'datacenter' | 'device'>('all')
  const currentFilter = ref<string>('')

  // 计算属性
  const nodeCount = computed(() => graphData.value.nodes.length)
  const edgeCount = computed(() => graphData.value.edges.length)

  const nodeTypes = computed(() => {
    const types = new Set(graphData.value.nodes.map(node => node.type))
    return Array.from(types)
  })

  const edgeTypes = computed(() => {
    const types = new Set(graphData.value.edges.map(edge => edge.type))
    return Array.from(types)
  })

  // 根据类型过滤节点
  const nodesByType = computed(() => {
    const grouped: Record<string, GraphNode[]> = {}
    graphData.value.nodes.forEach(node => {
      if (!grouped[node.type]) {
        grouped[node.type] = []
      }
      grouped[node.type].push(node)
    })
    return grouped
  })

  // 操作
  const setLoading = (value: boolean) => {
    loading.value = value
  }

  const setError = (message: string | null) => {
    error.value = message
  }

  const clearError = () => {
    error.value = null
  }

  // 加载图数据
  const loadGraphData = async (limit = 100) => {
    try {
      console.log('开始加载图数据, limit:', limit)
      setLoading(true)
      clearError()

      const data = await graphAPI.getGraphData(limit)
      console.log('获取到的数据:', data)

      // Ensure data has the expected structure
      if (!data || typeof data !== 'object') {
        console.error('Invalid data format received:', data)
        throw new Error('Invalid data format from server')
      }

      // 确保数据格式正确
      if (!data.nodes) data.nodes = []
      if (!data.edges) data.edges = []

      graphData.value = data
      currentView.value = 'all'
      currentFilter.value = ''
      currentView.value = 'all'
      currentFilter.value = ''

      console.log('Store中的数据已更新:', graphData.value)
      console.log('即将设置loading为false')
    } catch (err: any) {
      console.error('加载图数据错误:', err)
      setError(err.message || '加载图数据失败')
      // 即使出错也要重置状态
      graphData.value = { nodes: [], edges: [] }
    } finally {
      console.log('设置loading为false')
      setLoading(false)
    }
  }

  // 加载图统计信息
  const loadGraphStats = async () => {
    try {
      const stats = await graphAPI.getGraphStats()
      graphStats.value = stats
    } catch (err: any) {
      console.error('加载图统计信息失败:', err)
    }
  }

  // 搜索节点
  const searchNodes = async (keyword: string, type?: string) => {
    try {
      setLoading(true)
      clearError()

      const results = await graphAPI.searchNodes(keyword, type)
      searchResults.value = results
      return results
    } catch (err: any) {
      setError(err.message || '搜索节点失败')
      console.error('搜索节点失败:', err)
      return []
    } finally {
      setLoading(false)
    }
  }

  // 加载数据中心子图
  const loadDataCenterSubgraph = async (dcName: string) => {
    try {
      setLoading(true)
      clearError()

      const data = await graphAPI.getDataCenterSubgraph(dcName)
      graphData.value = data
      currentView.value = 'datacenter'
      currentFilter.value = dcName
    } catch (err: any) {
      setError(err.message || '加载数据中心子图失败')
      console.error('加载数据中心子图失败:', err)
    } finally {
      setLoading(false)
    }
  }

  // 加载设备图
  const loadDeviceGraph = async (deviceName: string) => {
    try {
      setLoading(true)
      clearError()

      const data = await graphAPI.getDeviceGraph(deviceName)
      graphData.value = data
      currentView.value = 'device'
      currentFilter.value = deviceName
    } catch (err: any) {
      setError(err.message || '加载设备图失败')
      console.error('加载设备图失败:', err)
    } finally {
      setLoading(false)
    }
  }

  // 加载节点详情
  const loadNodeDetails = async (nodeId: string) => {
    try {
      setLoading(true)
      clearError()

      const data = await graphAPI.getNodeDetails(nodeId)
      // 可以选择替换当前图数据或者合并
      graphData.value = data
    } catch (err: any) {
      setError(err.message || '加载节点详情失败')
      console.error('加载节点详情失败:', err)
    } finally {
      setLoading(false)
    }
  }

  // 选择节点
  const selectNode = (node: GraphNode | null) => {
    selectedNode.value = node
    selectedEdge.value = null // 清除边选择
  }

  // 选择边
  const selectEdge = (edge: GraphEdge | null) => {
    selectedEdge.value = edge
    selectedNode.value = null // 清除节点选择
  }

  // 清除选择
  const clearSelection = () => {
    selectedNode.value = null
    selectedEdge.value = null
  }

  // 重置状态
  const resetState = () => {
    graphData.value = { nodes: [], edges: [] }
    selectedNode.value = null
    selectedEdge.value = null
    searchResults.value = []
    currentView.value = 'all'
    currentFilter.value = ''
    clearError()
  }

  // 根据ID查找节点
  const findNodeById = (id: string): GraphNode | undefined => {
    return graphData.value.nodes.find(node => node.id === id)
  }

  // 根据ID查找边
  const findEdgeById = (id: string): GraphEdge | undefined => {
    return graphData.value.edges.find(edge => edge.id === id)
  }

  // 获取节点的相邻节点
  const getAdjacentNodes = (nodeId: string): GraphNode[] => {
    const adjacentNodeIds = new Set<string>()

    graphData.value.edges.forEach(edge => {
      if (edge.source === nodeId) {
        adjacentNodeIds.add(edge.target)
      } else if (edge.target === nodeId) {
        adjacentNodeIds.add(edge.source)
      }
    })

    return graphData.value.nodes.filter(node => adjacentNodeIds.has(node.id))
  }

  // 获取连接两个节点的边
  const getEdgesBetweenNodes = (nodeId1: string, nodeId2: string): GraphEdge[] => {
    return graphData.value.edges.filter(edge =>
      (edge.source === nodeId1 && edge.target === nodeId2) ||
      (edge.source === nodeId2 && edge.target === nodeId1)
    )
  }

  // 设置图数据
  const setGraphData = (data: GraphData) => {
    if (data && data.nodes) {
      graphData.value = data;
      currentView.value = 'all'; // or a specific view like 'path'
      currentFilter.value = '';
    } else {
      console.error('Attempted to set invalid graph data', data);
    }
  }

  return {
    // 状态
    graphData,
    graphStats,
    selectedNode,
    selectedEdge,
    loading,
    error,
    searchResults,
    currentView,
    currentFilter,

    // 计算属性
    nodeCount,
    edgeCount,
    nodeTypes,
    edgeTypes,
    nodesByType,

    // 操作
    setLoading,
    setError,
    clearError,
    loadGraphData,
    loadGraphStats,
    searchNodes,
    loadDataCenterSubgraph,
    loadDeviceGraph,
    loadNodeDetails,
    selectNode,
    selectEdge,
    clearSelection,
    resetState,
    findNodeById,
    findEdgeById,
    getAdjacentNodes,
    getEdgesBetweenNodes,
    setGraphData
  }
})