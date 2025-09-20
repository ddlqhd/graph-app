<template>
  <div class="data-test">
    <el-card>
      <template #header>数据加载测试</template>

      <el-space direction="vertical" style="width: 100%">
        <el-button @click="testDirectAPI" type="primary">直接测试API</el-button>
        <el-button @click="testGraphService" type="success">测试GraphService</el-button>
        <el-button @click="testStore" type="warning">测试Store</el-button>

        <div v-if="results.direct" class="result-section">
          <h4>直接API测试结果:</h4>
          <pre>{{ JSON.stringify(results.direct, null, 2) }}</pre>
        </div>

        <div v-if="results.service" class="result-section">
          <h4>GraphService测试结果:</h4>
          <pre>{{ JSON.stringify(results.service, null, 2) }}</pre>
        </div>

        <div v-if="results.store" class="result-section">
          <h4>Store测试结果:</h4>
          <pre>{{ JSON.stringify(results.store, null, 2) }}</pre>
        </div>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useGraphStore } from '@/stores/graph'
import { graphAPI } from '@/services/graphService'
import api from '@/utils/api'

const results = ref<any>({
  direct: null,
  service: null,
  store: null
})

const graphStore = useGraphStore()

// 直接测试API
const testDirectAPI = async () => {
  try {
    console.log('开始直接API测试')
    const response = await api.get('/api/graph/data')
    console.log('直接API响应:', response)
    results.value.direct = response
  } catch (error) {
    console.error('直接API测试失败:', error)
    results.value.direct = { error: error.message }
  }
}

// 测试GraphService
const testGraphService = async () => {
  try {
    console.log('开始GraphService测试')
    const data = await graphAPI.getGraphData()
    console.log('GraphService响应:', data)
    results.value.service = data
  } catch (error) {
    console.error('GraphService测试失败:', error)
    results.value.service = { error: error.message }
  }
}

// 测试Store
const testStore = async () => {
  try {
    console.log('开始Store测试')
    await graphStore.loadGraphData()
    console.log('Store数据:', graphStore.graphData)
    results.value.store = {
      nodes: graphStore.graphData.nodes?.length || 0,
      edges: graphStore.graphData.edges?.length || 0,
      loading: graphStore.loading,
      error: graphStore.error,
      rawData: JSON.parse(JSON.stringify(graphStore.graphData)) // 深拷贝避免响应式问题
    }
  } catch (error) {
    console.error('Store测试失败:', error)
    results.value.store = { error: error.message }
  }
}
</script>

<style scoped>
.data-test {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.result-section {
  margin-top: 16px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.result-section h4 {
  margin-top: 0;
  color: #409eff;
}

.result-section pre {
  background: white;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
}
</style>