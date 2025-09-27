<template>
  <div class="graph-controls">
    <el-card class="control-card">
      <!-- 网络路径查询 -->
      <NetworkPathQuery />

      <!-- 搜索区域 -->
      <div class="search-section">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索节点..."
          clearable
          @keyup.enter="handleSearch"
          @clear="clearSearch"
          class="search-input"
        >
          <template #prepend>
            <el-select
              v-model="searchType"
              placeholder="类型"
              style="width: 100px"
            >
              <el-option label="全部" value="" />
              <el-option
                v-for="type in nodeTypes"
                :key="type"
                :label="type"
                :value="type"
              />
            </el-select>
          </template>
          <template #append>
            <el-button :icon="Search" @click="handleSearch" />
          </template>
        </el-input>
      </div>

      <!-- 快速筛选 -->
      <div class="filter-section">
        <div class="filter-title">快速筛选</div>
        <div class="filter-buttons">
          <el-button
            size="small"
            :type="currentView === 'all' ? 'primary' : 'default'"
            @click="loadAllData"
          >
            全部数据
          </el-button>
          <el-button
            size="small"
            :type="currentView === 'datacenter' ? 'primary' : 'default'"
            @click="showDataCenterDialog"
          >
            按数据中心
          </el-button>
          <el-button
            size="small"
            :type="currentView === 'device' ? 'primary' : 'default'"
            @click="showDeviceDialog"
          >
            按设备
          </el-button>
        </div>
      </div>

      <!-- 图统计信息 -->
      <div class="stats-section" v-if="graphStats">
        <div class="stats-title">图统计</div>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-statistic title="节点数" :value="graphStats.totalNodes" />
          </el-col>
          <el-col :span="12">
            <el-statistic title="关系数" :value="graphStats.totalEdges" />
          </el-col>
        </el-row>

        <div class="type-stats">
          <div class="type-section" v-if="graphStats.nodeTypes?.length">
            <div class="type-title">节点类型</div>
            <div class="type-items">
              <el-tag
                v-for="nodeType in graphStats.nodeTypes"
                :key="nodeType.type"
                :type="getTagType(nodeType.type)"
                size="small"
                class="type-tag"
              >
                {{ nodeType.type }} ({{ nodeType.count }})
              </el-tag>
            </div>
          </div>

          <div class="type-section" v-if="graphStats.edgeTypes?.length">
            <div class="type-title">关系类型</div>
            <div class="type-items">
              <el-tag
                v-for="edgeType in graphStats.edgeTypes"
                :key="edgeType.type"
                size="small"
                class="type-tag"
              >
                {{ edgeType.type }} ({{ edgeType.count }})
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 搜索结果 -->
      <div class="search-results" v-if="searchResults.length > 0">
        <div class="results-title">
          搜索结果 ({{ searchResults.length }})
        </div>
        <div class="result-items">
          <div
            v-for="node in searchResults"
            :key="node.id"
            class="result-item"
            @click="selectSearchResult(node)"
          >
            <div class="result-content">
              <div class="result-name">{{ node.label }}</div>
              <div class="result-type">
                <el-tag :type="getTagType(node.type)" size="small">
                  {{ node.type }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 当前视图信息 -->
      <div class="current-view" v-if="currentFilter">
        <el-alert
          :title="`当前视图: ${getCurrentViewTitle()}`"
          type="info"
          :closable="false"
        >
          <template #default>
            <el-button
              size="small"
              type="text"
              @click="loadAllData"
            >
              返回全部数据
            </el-button>
          </template>
        </el-alert>
      </div>
    </el-card>

    <!-- 数据中心选择对话框 -->
    <el-dialog
      v-model="dataCenterDialogVisible"
      title="选择数据中心"
      width="400px"
    >
      <el-select
        v-model="selectedDataCenter"
        placeholder="请选择数据中心"
        style="width: 100%"
        @change="loadDataCenterData"
      >
        <el-option
          v-for="dc in dataCenters"
          :key="dc"
          :label="dc"
          :value="dc"
        />
      </el-select>
    </el-dialog>

    <!-- 设备选择对话框 -->
    <el-dialog
      v-model="deviceDialogVisible"
      title="选择设备"
      width="400px"
    >
      <el-select
        v-model="selectedDevice"
        placeholder="请选择设备"
        style="width: 100%"
        @change="loadDeviceData"
      >
        <el-option
          v-for="device in devices"
          :key="device"
          :label="device"
          :value="device"
        />
      </el-select>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useGraphStore } from '@/stores/graph'
import type { GraphNode } from '@/services/graphService'
import { Search } from '@element-plus/icons-vue'
import NetworkPathQuery from './NetworkPathQuery.vue'

// Store
const graphStore = useGraphStore()
const {
  searchResults,
  currentView,
  currentFilter,
  nodeTypes,
  graphStats
} = storeToRefs(graphStore)

// 响应式数据
const searchKeyword = ref('')
const searchType = ref('')
const dataCenterDialogVisible = ref(false)
const deviceDialogVisible = ref(false)
const selectedDataCenter = ref('')
const selectedDevice = ref('')

// 预设的数据中心和设备列表 - 这些应该从后端获取
const dataCenters = ref(['DC-West', 'DC-East', 'DC-North', 'DC-South', 'DC-Cloud1', 'DC-Cloud2'])
const devices = ref(['Device_001', 'Device_002', 'Device_003', 'Device_004', 'Device_005'])

// 计算属性
const getCurrentViewTitle = () => {
  if (currentView.value === 'datacenter') {
    return `数据中心: ${currentFilter.value}`
  } else if (currentView.value === 'device') {
    return `设备: ${currentFilter.value}`
  }
  return '全部数据'
}

// 获取标签类型
const getTagType = (nodeType: string) => {
  const typeMap: Record<string, any> = {
    'Device': 'primary',
    'Port': 'success'
  }
  return typeMap[nodeType] || 'default'
}

// 方法
const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    clearSearch()
    return
  }

  await graphStore.searchNodes(searchKeyword.value, searchType.value || undefined)
}

const clearSearch = () => {
  searchKeyword.value = ''
  searchResults.value = []
}

const selectSearchResult = (node: GraphNode) => {
  graphStore.selectNode(node)
  // 可以选择是否要加载节点详情或者高亮节点
}

const loadAllData = async () => {
  await graphStore.loadGraphData()
}

const showDataCenterDialog = () => {
  dataCenterDialogVisible.value = true
}

const showDeviceDialog = () => {
  deviceDialogVisible.value = true
}

const loadDataCenterData = async () => {
  if (selectedDataCenter.value) {
    await graphStore.loadDataCenterSubgraph(selectedDataCenter.value)
    dataCenterDialogVisible.value = false
  }
}

const loadDeviceData = async () => {
  if (selectedDevice.value) {
    await graphStore.loadDeviceGraph(selectedDevice.value)
    deviceDialogVisible.value = false
  }
}

// 生命周期
onMounted(async () => {
  console.log('GraphControls mounted')
  // 只加载统计信息，不加载图数据（由HomeView负责）
  try {
    await graphStore.loadGraphStats()
    console.log('统计信息加载成功')
  } catch (error) {
    console.error('统计信息加载失败:', error)
  }
})
</script>

<style scoped>
/* GitHub-style Controls Panel */
.graph-controls {
  width: 320px;
  height: 100%;
  background: var(--color-bg-default);
  border-right: 1px solid var(--color-border-default);
  display: flex;
  flex-direction: column;
  animation: fadeInLeft 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

.control-card {
  flex: 1;
  border-radius: 0;
  border: none;
  box-shadow: none;
  background: var(--color-bg-default);
  overflow: hidden;
}

.control-card .el-card__body {
  padding: var(--space-3);
  height: 100%;
  overflow-y: auto;
}

/* GitHub-style Search Section */
.search-section {
  margin-bottom: var(--space-4);
}

.search-input .el-input-group__prepend {
  background-color: var(--color-bg-subtle);
  border-color: var(--color-border-default);
  border-right: 0;
}

.search-input .el-input-group__append {
  background-color: var(--color-bg-subtle);
  border-color: var(--color-border-default);
  border-left: 0;
}

.search-input .el-input-group__append .el-button {
  border: none;
  background: transparent;
  color: var(--color-fg-muted);
  padding: 0 12px;
}

.search-input .el-input-group__append .el-button:hover {
  color: var(--color-primary);
  background: rgba(9, 105, 218, 0.1);
}

/* GitHub-style Filter Section */
.filter-section {
  margin-bottom: var(--space-4);
}

.filter-title,
.stats-title,
.results-title,
.type-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-fg-default);
  margin-bottom: var(--space-2);
  line-height: 20px;
}

.filter-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.filter-buttons .el-button {
  justify-content: flex-start;
  font-weight: 500;
  border-radius: var(--border-radius);
  transition: all 80ms cubic-bezier(0.33, 1, 0.68, 1);
  text-align: left;
}

.filter-buttons .el-button--default {
  background: var(--color-bg-default);
  border-color: var(--color-border-default);
  color: var(--color-fg-default);
}

.filter-buttons .el-button--default:hover {
  background: var(--color-bg-subtle);
  border-color: var(--color-border-muted);
}

.filter-buttons .el-button--primary {
  background: var(--color-primary);
  border-color: rgba(31, 35, 40, 0.15);
  color: var(--color-fg-on-emphasis);
}

.filter-buttons .el-button--primary:hover {
  background: var(--color-primary-hover);
}

/* GitHub-style Stats Section */
.stats-section {
  margin-bottom: var(--space-4);
  padding: var(--space-3);
  background: var(--color-bg-subtle);
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border-default);
}

.stats-section .el-statistic {
  text-align: center;
}

.stats-section .el-statistic__head {
  color: var(--color-fg-muted);
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 2px;
}

.stats-section .el-statistic__content {
  color: var(--color-fg-default);
  font-weight: 600;
  font-size: 18px;
  line-height: 24px;
}

/* GitHub-style Type Stats */
.type-stats {
  margin-top: var(--space-3);
}

.type-section {
  margin-bottom: var(--space-3);
  padding: var(--space-2);
  background: var(--color-bg-default);
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border-default);
}

.type-items {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.type-tag {
  font-size: 11px;
  font-weight: 500;
  border-radius: 2em;
  padding: 2px 6px;
  border: 1px solid transparent;
  background: var(--color-bg-subtle);
  color: var(--color-fg-default);
  transition: all 0.2s cubic-bezier(0.3, 0, 0.5, 1);
}

.type-tag:hover {
  background: hsla(220, 14%, 93%, 1);
}

/* GitHub-style Search Results */
.search-results {
  margin-bottom: var(--space-4);
}

.result-items {
  max-height: 200px;
  overflow-y: auto;
  padding: 0;
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius);
  background: var(--color-bg-default);
}

.result-item {
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--color-border-default);
  cursor: pointer;
  transition: all 0.1s ease;
  background: var(--color-bg-default);
}

.result-item:last-child {
  border-bottom: none;
}

.result-item:hover {
  background: var(--color-bg-subtle);
}

.result-item:active {
  background: hsla(220, 14%, 93%, 1);
}

.result-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-name {
  font-size: 13px;
  color: var(--color-fg-default);
  font-weight: 500;
  line-height: 18px;
}

/* GitHub-style Current View Alert */
.current-view {
  margin-top: var(--space-4);
}

.current-view .el-alert {
  border-radius: var(--border-radius);
  border: 1px solid rgba(9, 105, 218, 0.3);
  background: #ddf4ff;
  padding: var(--space-2) var(--space-3);
}

.current-view .el-alert__title {
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 500;
}

.current-view .el-button {
  color: var(--color-primary);
  font-size: 12px;
  padding: 0;
  height: auto;
  border: none;
  background: transparent;
}

.current-view .el-button:hover {
  color: var(--color-primary-hover);
  background: rgba(9, 105, 218, 0.1);
  border-radius: 3px;
}

/* GitHub-style Scrollbars */
.result-items::-webkit-scrollbar {
  width: 8px;
}

.result-items::-webkit-scrollbar-track {
  background: var(--color-bg-subtle);
}

.result-items::-webkit-scrollbar-thumb {
  background: var(--color-border-default);
  border-radius: 4px;
}

.result-items::-webkit-scrollbar-thumb:hover {
  background: var(--color-border-subtle);
}

.control-card .el-card__body::-webkit-scrollbar {
  width: 8px;
}

.control-card .el-card__body::-webkit-scrollbar-track {
  background: var(--color-bg-subtle);
}

.control-card .el-card__body::-webkit-scrollbar-thumb {
  background: var(--color-border-default);
  border-radius: 4px;
}

.control-card .el-card__body::-webkit-scrollbar-thumb:hover {
  background: var(--color-border-subtle);
}

/* Responsive Design */
@media (max-width: 768px) {
  .graph-controls {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--color-border-default);
  }

  .filter-buttons {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .filter-buttons .el-button {
    flex: 1;
    min-width: 0;
    justify-content: center;
  }
}
</style>