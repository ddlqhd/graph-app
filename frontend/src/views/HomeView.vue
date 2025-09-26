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
/* GitHub-style Home View Layout */
.home-view {
  position: relative;
  height: 100%;
  width: 100%;
  min-height: 600px;
  background: var(--color-bg-subtle);
  padding: var(--space-3);
  overflow: hidden;
}

.view-container {
  display: flex;
  height: 100%;
  gap: var(--space-3);
  max-width: 95%;
  margin: 0 auto;
}

/* GitHub-style Graph Section */
.graph-section {
  flex: 1;
  position: relative;
  background: var(--color-bg-default);
  border-radius: var(--border-radius-large);
  box-shadow: var(--shadow-small);
  overflow: hidden;
  border: 1px solid var(--color-border-default);
  transition: all 0.2s cubic-bezier(0.3, 0, 0.5, 1);
}

.graph-section:hover {
  box-shadow: var(--shadow-medium);
  border-color: var(--color-border-muted);
}

.graph-viewer {
  width: 100%;
  height: 100%;
}

/* GitHub-style Error Message */
.error-message {
  position: absolute;
  top: var(--space-3);
  left: var(--space-3);
  right: var(--space-3);
  z-index: 1000;
}

.error-message .el-alert {
  border-radius: var(--border-radius);
  border: 1px solid rgba(209, 36, 47, 0.3);
  background: #ffebe9;
  color: var(--color-danger);
  box-shadow: var(--shadow-small);
}

.error-actions {
  margin-top: var(--space-2);
  display: flex;
  gap: var(--space-2);
}

.error-actions .el-button {
  border-radius: var(--border-radius);
  font-weight: 500;
  height: 28px;
  padding: 0 12px;
  font-size: 12px;
  transition: all 0.2s cubic-bezier(0.3, 0, 0.5, 1);
}

/* GitHub-style Empty State */
.empty-state {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-default);
}

.empty-state .el-empty {
  padding: var(--space-6);
}

.empty-state .el-button {
  border-radius: var(--border-radius);
  height: 32px;
  padding: 0 var(--space-3);
  font-weight: 500;
  background: var(--color-success);
  border: 1px solid rgba(31, 35, 40, 0.15);
  color: var(--color-fg-on-emphasis);
  transition: all 0.2s cubic-bezier(0.3, 0, 0.5, 1);
  box-shadow: var(--shadow-small), var(--shadow-inset);
}

.empty-state .el-button:hover {
  background: var(--color-success-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-medium), var(--shadow-inset);
}

/* GitHub-style FAB (Floating Action Button) */
.fab-container {
  position: fixed;
  bottom: var(--space-4);
  right: var(--space-4);
  z-index: 1000;
}

.fab-button {
  width: 48px;
  height: 48px;
  box-shadow: var(--shadow-large);
  transition: all 0.2s cubic-bezier(0.3, 0, 0.5, 1);
  background: var(--color-success);
  border: 1px solid rgba(31, 35, 40, 0.15);
  border-radius: 50%;
  color: var(--color-fg-on-emphasis);
  position: relative;
  overflow: hidden;
}

.fab-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.2);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.fab-button:hover::before {
  opacity: 1;
}

.fab-button:hover {
  background: var(--color-success-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(26, 127, 55, 0.4);
}

.fab-button:active {
  transform: translateY(-1px);
}

/* Responsive width adjustments */
@media (min-width: 768px) {
  .view-container {
    max-width: 90%;
  }
}

@media (min-width: 1024px) {
  .view-container {
    max-width: 90%;
  }
  .home-view {
    padding: var(--space-3);
  }
}

@media (min-width: 1280px) {
  .view-container {
    max-width: 1400px;
  }
}

@media (min-width: 1440px) {
  .view-container {
    max-width: 1800px;
  }
}

@media (min-width: 1920px) {
  .view-container {
    max-width: 2200px;
  }
}

@media (min-width: 2560px) {
  .view-container {
    max-width: 2560px;
  }
}

/* GitHub-style Responsive Design */
@media (max-width: 1024px) {
  .home-view {
    padding: var(--space-3);
  }

  .view-container {
    gap: var(--space-3);
  }
}

@media (max-width: 768px) {
  .home-view {
    padding: var(--space-2);
  }

  .view-container {
    flex-direction: column;
    height: auto;
    gap: var(--space-3);
  }

  .graph-section {
    height: 500px;
    min-height: 400px;
  }

  .fab-container {
    bottom: var(--space-3);
    right: var(--space-3);
  }

  .fab-button {
    width: 56px;
    height: 56px;
  }
}

@media (max-width: 480px) {
  .home-view {
    height: auto;
    min-height: auto;
    padding: var(--space-2);
  }

  .view-container {
    gap: var(--space-2);
  }

  .graph-section {
    height: 400px;
    min-height: 350px;
    border-radius: var(--border-radius);
  }

  .fab-button {
    width: 52px;
    height: 52px;
  }

  .error-message {
    top: var(--space-2);
    left: var(--space-2);
    right: var(--space-2);
  }
}

/* Smooth loading transitions */
.graph-section {
  animation: fadeInUp 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
