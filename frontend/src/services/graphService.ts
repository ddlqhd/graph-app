import api from '@/utils/api'

export interface GraphNode {
  id: string
  label: string
  type: string
  properties: Record<string, any>
  color?: string
  size?: number
  icon?: {
    type: string
    value: string
    size: number
  }
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  label: string
  type: string
  properties: Record<string, any>
  color?: string
  style?: {
    lineWidth: number
    lineDash: number[]
  }
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export interface GraphStats {
  totalNodes: number
  totalEdges: number
  nodeTypes: Array<{ type: string; count: number }>
  edgeTypes: Array<{ type: string; count: number }>
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

class GraphAPI {
  // 获取图数据
  async getGraphData(limit = 100): Promise<GraphData> {
    try {
      const data = await api.get<GraphData, GraphData>(`/api/graph/data?limit=${limit}`)
      console.log('API Response data:', data)
      return data
    } catch (error) {
      console.error('Error fetching graph data:', error)
      throw error
    }
  }

  // 获取图统计信息
  async getGraphStats(): Promise<GraphStats> {
    const data = await api.get<GraphStats, GraphStats>('/api/graph/stats')
    return data
  }

  // 搜索节点
  async searchNodes(keyword: string, type?: string): Promise<GraphNode[]> {
    const params = new URLSearchParams({ keyword })
    if (type) params.append('type', type)

    const data = await api.get<GraphNode[], GraphNode[]>(`/api/graph/search?${params}`)
    return data
  }

  // 获取数据中心子图
  async getDataCenterSubgraph(dcName: string): Promise<GraphData> {
    const data = await api.get<GraphData, GraphData>(`/api/graph/datacenter/${encodeURIComponent(dcName)}`)
    return data
  }

  // 获取设备图
  async getDeviceGraph(deviceName: string): Promise<GraphData> {
    const data = await api.get<GraphData, GraphData>(`/api/graph/device/${deviceName}`)
    return data
  }

  // 获取节点详情
  async getNodeDetails(nodeId: string): Promise<GraphData> {
    const data = await api.get<GraphData, GraphData>(`/api/graph/node/${nodeId}`)
    return data
  }

  // 健康检查
  async healthCheck(): Promise<any> {
    const data = await api.get<any, any>('/api/graph/health')
    return data
  }
}

export const graphAPI = new GraphAPI()
export default graphAPI