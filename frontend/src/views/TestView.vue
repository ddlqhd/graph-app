<template>
  <div class="test-page">
    <el-row>
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <el-icon><View /></el-icon>
              <span>GraphSQL 系统测试与调试</span>
            </div>
          </template>

          <el-space direction="vertical" size="large" style="width: 100%">
            <!-- 系统状态检查 -->
            <el-alert
              title="系统状态检查"
              type="info"
              :closable="false"
            >
              <div>
                <p>✅ Vue 3 应用已加载</p>
                <p>✅ Element Plus 组件正常</p>
                <p>✅ Pinia 状态管理已初始化</p>
                <p>✅ 路由系统正常工作</p>
                <p>🔍 API 基础URL: {{ apiBaseUrl }}</p>
              </div>
            </el-alert>

            <!-- 后端连接测试 -->
            <el-card>
              <template #header>后端 API 连接测试</template>
              <el-space direction="vertical" style="width: 100%">
                <el-space>
                  <el-button
                    type="primary"
                    @click="testBackendConnection"
                    :loading="testing.backend"
                  >
                    测试后端连接
                  </el-button>
                  <el-tag :type="backendStatus.type">
                    {{ backendStatus.message }}
                  </el-tag>
                </el-space>

                <!-- 显示详细的连接信息 -->
                <div v-if="backendResult" class="debug-info">
                  <el-descriptions title="连接详情" :column="1" size="small" border>
                    <el-descriptions-item label="状态">{{ backendResult.status }}</el-descriptions-item>
                    <el-descriptions-item label="数据库">{{ backendResult.database }}</el-descriptions-item>
                    <el-descriptions-item label="时间戳">{{ backendResult.timestamp }}</el-descriptions-item>
                  </el-descriptions>
                </div>
              </el-space>
            </el-card>

            <!-- 数据获取测试 -->
            <el-card>
              <template #header>图数据获取测试</template>
              <el-space direction="vertical" style="width: 100%">
                <el-space>
                  <el-button
                    type="success"
                    @click="testDataFetch"
                    :loading="testing.data"
                  >
                    测试数据获取
                  </el-button>
                  <el-tag :type="dataStatus.type">
                    {{ dataStatus.message }}
                  </el-tag>
                </el-space>

                <!-- 显示数据获取结果 -->
                <div v-if="rawDataResult" class="debug-info">
                  <el-descriptions title="原始API数据" :column="2" size="small" border>
                    <el-descriptions-item label="节点总数">{{ rawDataResult.nodes?.length || 0 }}</el-descriptions-item>
                    <el-descriptions-item label="关系总数">{{ rawDataResult.edges?.length || 0 }}</el-descriptions-item>
                  </el-descriptions>

                  <!-- 显示前几个节点的信息 -->
                  <div v-if="rawDataResult.nodes?.length > 0" style="margin-top: 16px;">
                    <h4>前5个节点预览:</h4>
                    <el-table :data="rawDataResult.nodes.slice(0, 5)" size="small">
                      <el-table-column prop="id" label="ID" width="60" />
                      <el-table-column prop="label" label="标签" width="100" />
                      <el-table-column prop="type" label="类型" width="100" />
                      <el-table-column prop="color" label="颜色" width="80" />
                    </el-table>
                  </div>
                </div>
              </el-space>
            </el-card>

            <!-- Store状态测试 -->
            <el-card>
              <template #header>Store 状态测试</template>
              <el-space direction="vertical" style="width: 100%">
                <el-space>
                  <el-button
                    type="warning"
                    @click="testStoreLoad"
                    :loading="testing.store"
                  >
                    加载到Store
                  </el-button>
                  <el-tag :type="storeStatus.type">
                    {{ storeStatus.message }}
                  </el-tag>
                </el-space>

                <!-- Store状态信息 -->
                <el-descriptions title="Store状态" :column="2" size="small" border>
                  <el-descriptions-item label="Store节点数">{{ graphData.nodes?.length || 0 }}</el-descriptions-item>
                  <el-descriptions-item label="Store关系数">{{ graphData.edges?.length || 0 }}</el-descriptions-item>
                  <el-descriptions-item label="加载状态">{{ loading ? '加载中' : '已完成' }}</el-descriptions-item>
                  <el-descriptions-item label="错误信息">{{ error || '无' }}</el-descriptions-item>
                </el-descriptions>
              </el-space>
            </el-card>

            <!-- 数据库统计信息 -->
            <el-card>
              <template #header>Neo4j 数据库统计</template>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="总节点数">{{ stats.totalNodes || 0 }}</el-descriptions-item>
                <el-descriptions-item label="总关系数">{{ stats.totalEdges || 0 }}</el-descriptions-item>
                <el-descriptions-item label="人员节点">{{ getNodeTypeCount('Person') }}</el-descriptions-item>
                <el-descriptions-item label="部门节点">{{ getNodeTypeCount('Department') }}</el-descriptions-item>
              </el-descriptions>
            </el-card>

            <!-- 功能测试 -->
            <el-card>
              <template #header>功能测试</template>
              <el-space wrap>
                <el-button @click="loadGraphData">重新加载图数据</el-button>
                <el-button @click="testSearch">测试搜索</el-button>
                <el-button @click="$router.push('/')">返回主页</el-button>
                <el-button type="danger" @click="clearStore">清空Store</el-button>
              </el-space>
            </el-card>

            <!-- 图数据预览 -->
            <el-card v-if="graphData.nodes && graphData.nodes.length > 0">
              <template #header>当前Store中的图数据预览</template>
              <el-table :data="graphData.nodes.slice(0, 10)" style="width: 100%" size="small">
                <el-table-column prop="id" label="ID" width="60" />
                <el-table-column prop="label" label="节点名称" />
                <el-table-column prop="type" label="类型" />
                <el-table-column prop="properties.department" label="部门" />
                <el-table-column prop="color" label="颜色" width="80" />
              </el-table>
            </el-card>

            <!-- 原始API响应预览 -->
            <el-card v-if="showRawData && rawDataResult">
              <template #header>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span>原始API响应数据</span>
                  <el-button size="small" @click="showRawData = false">隐藏</el-button>
                </div>
              </template>
              <pre class="raw-data">{{ JSON.stringify(rawDataResult, null, 2) }}</pre>
            </el-card>
          </el-space>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useGraphStore } from '@/stores/graph'
import { graphAPI } from '@/services/graphService'
import { View } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// Store
const graphStore = useGraphStore()
const { graphData, loading, error } = storeToRefs(graphStore)

// 状态
const testing = ref({
  backend: false,
  data: false,
  store: false
})

const backendStatus = ref({
  type: 'info',
  message: '未测试'
})

const dataStatus = ref({
  type: 'info',
  message: '未测试'
})

const storeStatus = ref({
  type: 'info',
  message: '未测试'
})

const stats = ref({
  totalNodes: 0,
  totalEdges: 0,
  nodeTypes: []
})

const rawDataResult = ref(null)
const backendResult = ref(null)
const showRawData = ref(false)
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '使用Vite代理(/api)'

// 方法
const testDataFetch = async () => {
  testing.value.data = true
  try {
    const data = await graphAPI.getGraphData()
    rawDataResult.value = data
    dataStatus.value = {
      type: 'success',
      message: `获取成功: ${data.nodes?.length || 0}节点, ${data.edges?.length || 0}关系`
    }
    showRawData.value = true
    ElMessage.success('数据获取测试成功')
  } catch (error: any) {
    dataStatus.value = {
      type: 'danger',
      message: '获取失败: ' + error.message
    }
    ElMessage.error('数据获取失败: ' + error.message)
  } finally {
    testing.value.data = false
  }
}

const testStoreLoad = async () => {
  testing.value.store = true
  try {
    await graphStore.loadGraphData()
    if (graphData.value.nodes.length > 0) {
      storeStatus.value = {
        type: 'success',
        message: `加载成功: ${graphData.value.nodes.length}节点`
      }
      ElMessage.success(`Store加载成功: ${graphData.value.nodes.length}个节点`)
    } else {
      storeStatus.value = {
        type: 'warning',
        message: '加载成功但无数据'
      }
      ElMessage.warning('Store加载成功但无数据')
    }
  } catch (error: any) {
    storeStatus.value = {
      type: 'danger',
      message: '加载失败: ' + error.message
    }
    ElMessage.error('Store加载失败: ' + error.message)
  } finally {
    testing.value.store = false
  }
}

const testBackendConnection = async () => {
  testing.value.backend = true
  try {
    const health = await graphAPI.healthCheck()
    backendResult.value = health
    backendStatus.value = {
      type: 'success',
      message: '连接成功'
    }

    // 同时获取统计信息
    const statsData = await graphAPI.getGraphStats()
    stats.value = statsData

    ElMessage.success('后端连接测试成功')
  } catch (error: any) {
    backendStatus.value = {
      type: 'danger',
      message: '连接失败: ' + error.message
    }
    ElMessage.error('后端连接失败: ' + error.message)
  } finally {
    testing.value.backend = false
  }
}

const loadGraphData = async () => {
  try {
    await graphStore.loadGraphData()
    ElMessage.success(`已加载 ${graphData.value.nodes.length} 个节点`)
  } catch (error) {
    ElMessage.error('加载图数据失败')
  }
}

const testSearch = async () => {
  try {
    const results = await graphStore.searchNodes('张')
    ElMessage.success(`搜索到 ${results.length} 个结果`)
  } catch (error) {
    ElMessage.error('搜索功能测试失败')
  }
}

const clearStore = () => {
  graphStore.resetState()
  ElMessage.info('Store已清空')
}

const getNodeTypeCount = (type: string) => {
  const nodeType = stats.value.nodeTypes?.find(t => t.type === type)
  return nodeType ? nodeType.count : 0
}

// 生命周期
onMounted(() => {
  // 自动测试后端连接
  testBackendConnection()
})
</script>

<style scoped>
.test-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.debug-info {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.raw-data {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
  font-size: 12px;
  line-height: 1.4;
}
</style>