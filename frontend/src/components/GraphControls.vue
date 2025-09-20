<template>
  <div class="graph-controls">
    <el-card class="control-card">
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
            :type="currentView === 'department' ? 'primary' : 'default'"
            @click="showDepartmentDialog"
          >
            按部门
          </el-button>
          <el-button
            size="small"
            :type="currentView === 'project' ? 'primary' : 'default'"
            @click="showProjectDialog"
          >
            按项目
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

    <!-- 部门选择对话框 -->
    <el-dialog
      v-model="departmentDialogVisible"
      title="选择部门"
      width="400px"
    >
      <el-select
        v-model="selectedDepartment"
        placeholder="请选择部门"
        style="width: 100%"
        @change="loadDepartmentData"
      >
        <el-option
          v-for="dept in departments"
          :key="dept"
          :label="dept"
          :value="dept"
        />
      </el-select>
    </el-dialog>

    <!-- 项目选择对话框 -->
    <el-dialog
      v-model="projectDialogVisible"
      title="选择项目"
      width="400px"
    >
      <el-select
        v-model="selectedProject"
        placeholder="请选择项目"
        style="width: 100%"
        @change="loadProjectData"
      >
        <el-option
          v-for="project in projects"
          :key="project"
          :label="project"
          :value="project"
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
const departmentDialogVisible = ref(false)
const projectDialogVisible = ref(false)
const selectedDepartment = ref('')
const selectedProject = ref('')

// 预设的部门和项目列表
const departments = ref(['技术部', '财务部', '人事部', '总裁办'])
const projects = ref(['web_project', 'api_project', 'mobile_project'])

// 计算属性
const getCurrentViewTitle = () => {
  if (currentView.value === 'department') {
    return `部门: ${currentFilter.value}`
  } else if (currentView.value === 'project') {
    return `项目: ${currentFilter.value}`
  }
  return '全部数据'
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

const showDepartmentDialog = () => {
  departmentDialogVisible.value = true
}

const showProjectDialog = () => {
  projectDialogVisible.value = true
}

const loadDepartmentData = async () => {
  if (selectedDepartment.value) {
    await graphStore.loadDepartmentSubgraph(selectedDepartment.value)
    departmentDialogVisible.value = false
  }
}

const loadProjectData = async () => {
  if (selectedProject.value) {
    await graphStore.loadProjectGraph(selectedProject.value)
    projectDialogVisible.value = false
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
.graph-controls {
  width: 300px;
  margin-right: 16px;
}

.control-card {
  position: sticky;
  top: 20px;
}

.search-section {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
}

.filter-section {
  margin-bottom: 20px;
}

.filter-title,
.stats-title,
.results-title,
.type-title {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 10px;
}

.filter-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-buttons .el-button {
  justify-content: flex-start;
}

.stats-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.type-stats {
  margin-top: 16px;
}

.type-section {
  margin-bottom: 12px;
}

.type-items {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.type-tag {
  font-size: 10px;
}

.search-results {
  margin-bottom: 20px;
}

.result-items {
  max-height: 200px;
  overflow-y: auto;
}

.result-item {
  padding: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin-bottom: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.result-item:hover {
  background-color: #f5f7fa;
  border-color: #409eff;
}

.result-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-name {
  font-size: 14px;
  color: #303133;
}

.current-view {
  margin-top: 20px;
}

/* 滚动条样式 */
.result-items::-webkit-scrollbar {
  width: 4px;
}

.result-items::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.result-items::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.result-items::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>