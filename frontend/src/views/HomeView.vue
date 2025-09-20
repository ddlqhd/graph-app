<template>
  <div class="home-view">
    <div class="view-container">
      <!-- 左侧控制面板 -->
      <GraphControls />

      <!-- 右侧图可视化区域 -->
      <div class="graph-section">
        <GraphViewer
          :auto-resize="true"
          class="graph-viewer"
        />

        <!-- 错误提示 -->
        <div v-if="error" class="error-message">
          <el-alert
            :title="error"
            type="error"
            show-icon
            :closable="false"
          >
            <template #default>
              <div class="error-actions">
                <el-button
                  size="small"
                  type="primary"
                  @click="retryConnection"
                >
                  重试连接
                </el-button>
                <el-button
                  size="small"
                  @click="clearError"
                >
                  关闭
                </el-button>
              </div>
            </template>
          </el-alert>
        </div>

        <!-- 数据为空时的提示 -->
        <div v-if="!loading && graphData.nodes.length === 0" class="empty-state">
          <el-empty description="暂无图数据">
            <el-button type="primary" @click="loadSampleData">
              加载示例数据
            </el-button>
          </el-empty>
        </div>
      </div>
    </div>

    <!-- 快捷操作悬浮球 -->
    <div class="fab-container">
      <el-tooltip content="全屏模式" placement="left">
        <el-button
          type="primary"
          :icon="FullScreen"
          circle
          @click="toggleFullscreen"
          class="fab-button"
        />
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useGraphStore } from '@/stores/graph'
import GraphViewer from '@/components/GraphViewer.vue'
import GraphControls from '@/components/GraphControls.vue'
import { FullScreen } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// Store
const graphStore = useGraphStore()
const { graphData, loading, error } = storeToRefs(graphStore)

// 状态
const isFullscreen = ref(false)

// 方法
const retryConnection = async () => {
  try {
    await graphStore.loadGraphData()
    ElMessage.success('连接成功')
  } catch (err) {
    ElMessage.error('连接失败，请检查后端服务')
  }
}

const clearError = () => {
  graphStore.clearError()
}

const loadSampleData = async () => {
  try {
    await graphStore.loadGraphData()
    ElMessage.success('示例数据加载成功')
  } catch (err) {
    ElMessage.error('加载示例数据失败')
  }
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

// 监听全屏状态变化
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

// 生命周期
onMounted(async () => {
  console.log('HomeView mounted')
  document.addEventListener('fullscreenchange', handleFullscreenChange)

  // 初始加载数据
  try {
    console.log('开始加载图数据...')
    await graphStore.loadGraphData()
    console.log('图数据加载完成，节点数:', graphData.value.nodes.length)
    console.log('图数据内容:', graphData.value)
  } catch (error) {
    console.error('图数据加载失败:', error)
    ElMessage.error('初始数据加载失败')
  }
})

// 清理
onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<style scoped>
.home-view {
  position: relative;
  height: 100%;
  width: 100%;
  min-height: 600px;
}

.view-container {
  display: flex;
  height: 100%;
  gap: 16px;
}

.graph-section {
  flex: 1;
  position: relative;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.graph-viewer {
  width: 100%;
  height: 100%;
}

.error-message {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  z-index: 1000;
}

.error-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}

.empty-state {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
}

.fab-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}

.fab-button {
  width: 56px;
  height: 56px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.fab-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .view-container {
    flex-direction: column;
    height: auto;
  }

  .graph-section {
    height: 500px;
    min-height: 400px;
  }

  .fab-container {
    bottom: 16px;
    right: 16px;
  }

  .fab-button {
    width: 48px;
    height: 48px;
  }
}

@media (max-width: 480px) {
  .home-view {
    height: auto;
    min-height: auto;
  }

  .view-container {
    gap: 8px;
  }

  .graph-section {
    height: 400px;
    min-height: 350px;
  }
}
</style>
