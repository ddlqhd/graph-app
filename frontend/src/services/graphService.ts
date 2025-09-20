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
    const response = await api.get<any, ApiResponse<GraphData>>(`/api/graph/data?limit=${limit}`)
    console.log('原始响应:', response)
    console.log('response.data:', response.data)
    // 根据记忆，需要从 response.data 中提取实际的图数据
    return response.data
  }

  // 获取图统计信息
  async getGraphStats(): Promise<GraphStats> {
    const response = await api.get<any, ApiResponse<GraphStats>>('/api/graph/stats')
    return response.data
  }

  // 搜索节点
  async searchNodes(keyword: string, type?: string): Promise<GraphNode[]> {
    const params = new URLSearchParams({ keyword })
    if (type) params.append('type', type)

    const response = await api.get<any, ApiResponse<GraphNode[]>>(`/api/graph/search?${params}`)
    return response.data
  }

  // 获取部门子图
  async getDepartmentSubgraph(departmentName: string): Promise<GraphData> {
    const response = await api.get<any, ApiResponse<GraphData>>(`/api/graph/department/${encodeURIComponent(departmentName)}`)
    return response.data
  }

  // 获取项目图
  async getProjectGraph(projectId: string): Promise<GraphData> {
    const response = await api.get<any, ApiResponse<GraphData>>(`/api/graph/project/${projectId}`)
    return response.data
  }

  // 获取节点详情
  async getNodeDetails(nodeId: string): Promise<GraphData> {
    const response = await api.get<any, ApiResponse<GraphData>>(`/api/graph/node/${nodeId}`)
    return response.data
  }

  // 健康检查
  async healthCheck(): Promise<any> {
    const response = await api.get<any, ApiResponse<any>>('/api/graph/health')
    return response.data
  }
}

export const graphAPI = new GraphAPI()
export default graphAPI