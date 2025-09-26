<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useGraphStore } from '@/stores/graph'
import { useTheme } from '@/composables/useTheme'
import { graphAPI } from '@/services/graphService'
import ThemeToggle from '@/components/ThemeToggle.vue'
import {
  Histogram,
  Refresh,
  Monitor
} from '@element-plus/icons-vue'
import { ElMessage, ElNotification } from 'element-plus'

// Store
const graphStore = useGraphStore()
const { loading } = storeToRefs(graphStore)

// Theme
const { initTheme } = useTheme()

// 清理函数
let cleanupTheme: (() => void) | null = null

// 方法
const refreshData = async () => {
  try {
    await Promise.all([
      graphStore.loadGraphData(),
      graphStore.loadGraphStats()
    ])
    ElMessage.success('数据刷新成功')
  } catch (error) {
    ElMessage.error('数据刷新失败')
  }
}

const checkHealth = async () => {
  try {
    const healthData = await graphAPI.healthCheck()
    ElNotification({
      title: '系统状态',
      message: `服务运行正常 - ${healthData.status}`,
      type: 'success'
    })
  } catch (error: any) {
    ElNotification({
      title: '系统状态',
      message: `服务异常: ${error.message}`,
      type: 'error'
    })
  }
}

// 生命周期
onMounted(() => {
  cleanupTheme = initTheme()
})

onUnmounted(() => {
  if (cleanupTheme) {
    cleanupTheme()
  }
})
</script>

<template>
  <div id="app">
    <el-container class="app-container">
      <!-- 顶部导航栏 -->
      <el-header class="app-header">
        <div class="header-content">
          <div class="logo-section">
            <el-icon class="logo-icon" :size="24">
              <component :is="Histogram" />
            </el-icon>
            <h1 class="app-title">GraphSQL</h1>
            <span class="app-subtitle">图数据可视化演示平台</span>
          </div>

          <div class="header-actions">
            <el-tooltip content="刷新数据">
              <el-button
                type="text"
                :icon="Refresh"
                @click="refreshData"
                :loading="loading"
              />
            </el-tooltip>

            <el-tooltip content="健康检查">
              <el-button
                type="text"
                :icon="Monitor"
                @click="checkHealth"
              />
            </el-tooltip>

            <el-tooltip content="组件演示">
              <el-button
                type="text"
                @click="$router.push('/demo')"
              >
                演示
              </el-button>
            </el-tooltip>

            <ThemeToggle />
          </div>
        </div>
      </el-header>

      <!-- 主要内容区域 -->
      <el-main class="app-main">
        <router-view />
      </el-main>

      <!-- 底部信息 -->
      <el-footer class="app-footer">
        <div class="footer-content">
          <span>© 2024 GraphSQL - 基于 Vue 3 + AntV G6 + Neo4j 的图数据可视化平台</span>
          <div class="footer-links">
            <el-link
              href="https://github.com/your-repo/graphsql"
              target="_blank"
              type="primary"
            >
              GitHub
            </el-link>
            <el-link
              href="/docs"
              type="primary"
            >
              文档
            </el-link>
          </div>
        </div>
      </el-footer>
    </el-container>
  </div>
</template>

<style scoped>
/* GitHub-style App Container */
.app-container {
  min-height: 100vh;
  background: var(--color-bg-default);
  display: flex;
  flex-direction: column;
}

/* GitHub-style Header */
.app-header {
  background: var(--color-bg-emphasis);
  box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.1);
  padding: 0;
  border-bottom: 1px solid rgba(240, 246, 252, 0.1);
  height: 64px;
  position: sticky;
  top: 0;
  z-index: 1000;
}

/* Dark theme header adjustments */
:root[data-theme="dark"] .app-header,
.dark .app-header {
  box-shadow: inset 0 -1px 0 rgba(48, 54, 61, 0.5);
  border-bottom: 1px solid var(--color-border-default);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 var(--space-4);
  max-width: 95%;
  margin: 0 auto;
  width: 100%;
}

/* Responsive header and footer adjustments */
@media (min-width: 768px) {
  .header-content {
    max-width: 90%;
  }
  .footer-content {
    max-width: 90%;
  }
}

@media (min-width: 1024px) {
  .header-content {
    max-width: 90%; /* Adjusted for wider display */
  }
  .footer-content {
    max-width: 90%; /* Adjusted for wider display */
  }
}

@media (min-width: 1280px) {
  .header-content {
    max-width: 1400px; /* Increased max width for large screens */
  }
  .footer-content {
    max-width: 1400px; /* Increased max width for large screens */
  }
}

@media (min-width: 1440px) {
  .header-content {
    max-width: 1800px; /* Increased max width for very large screens */
  }
  .footer-content {
    max-width: 1800px; /* Increased max width for very large screens */
  }
}

@media (min-width: 1920px) {
  .header-content {
    max-width: 2200px; /* Increased max width for wide screens */
  }
  .footer-content {
    max-width: 2200px; /* Increased max width for wide screens */
  }
}

@media (min-width: 2560px) {
  .header-content {
    max-width: 2560px; /* Maximum width for ultra-wide screens */
  }
  .footer-content {
    max-width: 2560px; /* Maximum width for ultra-wide screens */
  }
}

/* Logo Section with GitHub-style branding */
.logo-section {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.logo-icon {
  color: var(--color-fg-on-emphasis);
  font-size: 24px;
}

.app-title {
  color: var(--color-fg-on-emphasis);
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.003em;
  line-height: 1.25;
}

.app-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin-left: var(--space-2);
  font-weight: 400;
  opacity: 0.9;
}

/* Dark theme subtitle color adjustment */
:root[data-theme="dark"] .app-subtitle,
.dark .app-subtitle {
  color: rgba(230, 237, 243, 0.8);
}

/* GitHub-style Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.header-actions .el-button {
  color: var(--color-fg-on-emphasis);
  border: 1px solid rgba(240, 246, 252, 0.1);
  background: transparent;
  border-radius: var(--border-radius);
  width: 32px;
  height: 32px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.3, 0, 0.5, 1);
  position: relative;
  overflow: hidden;
}

/* Dark theme button border */
:root[data-theme="dark"] .header-actions .el-button,
.dark .header-actions .el-button {
  border: 1px solid rgba(48, 54, 61, 0.5);
}

:root[data-theme="dark"] .header-actions .el-button:hover,
.dark .header-actions .el-button:hover {
  border-color: rgba(48, 54, 61, 0.8);
}

.header-actions .el-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  opacity: 0;
  transition: opacity 0.2s ease;
}

/* Dark theme button hover effect */
:root[data-theme="dark"] .header-actions .el-button::before,
.dark .header-actions .el-button::before {
  background: rgba(230, 237, 243, 0.1);
}

.header-actions .el-button:hover::before {
  opacity: 1;
}

.header-actions .el-button:hover {
  border-color: rgba(240, 246, 252, 0.3);
  transform: translateY(-1px);
}

.header-actions .el-button:active {
  transform: translateY(0);
}

/* GitHub-style Main Content */
.app-main {
  padding: var(--space-4);
  background: var(--color-bg-subtle);
  flex: 1;
  min-height: 0;
}

/* Responsive main content adjustments */
@media (max-width: 768px) {
  .app-main {
    padding: var(--space-2);
  }
}

/* GitHub-style Footer */
.app-footer {
  background: var(--color-bg-default);
  color: var(--color-fg-muted);
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid var(--color-border-default);
  margin-top: auto;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  font-weight: 400;
  max-width: 95%;
  margin: 0 auto;
  width: 100%;
}

/* Responsive footer adjustments */


.footer-links {
  display: flex;
  gap: var(--space-3);
  align-items: center;
}

.footer-links .el-link {
  color: var(--color-primary);
  font-weight: 500;
  font-size: 12px;
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.3, 0, 0.5, 1);
  padding: 4px 8px;
  border-radius: 4px;
}

.footer-links .el-link:hover {
  color: var(--color-primary-hover);
  background: rgba(9, 105, 218, 0.1);
  text-decoration: none;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    max-width: 98%;
    padding: 0 var(--space-3);
  }

  .app-subtitle {
    display: none;
  }

  .app-main {
    padding: var(--space-3);
  }

  .footer-content {
    max-width: 98%;
    flex-direction: column;
    gap: var(--space-2);
    text-align: center;
  }
}

/* GitHub-style dropdown improvements */
:deep(.el-dropdown-menu) {
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-large);
  box-shadow: var(--shadow-large);
  background: var(--color-bg-default);
  padding: var(--space-2);
}

:deep(.el-dropdown-menu__item) {
  color: var(--color-fg-default);
  padding: 6px 12px;
  border-radius: var(--border-radius);
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 400;
}

:deep(.el-dropdown-menu__item:hover) {
  background: var(--color-bg-subtle);
  color: var(--color-fg-default);
}
</style>
