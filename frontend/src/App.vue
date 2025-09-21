<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useGraphStore } from '@/stores/graph'
import { graphAPI } from '@/services/graphService'
import {
  Histogram,
  Refresh,
  Monitor,
  Setting
} from '@element-plus/icons-vue'
import { ElMessage, ElNotification } from 'element-plus'

// Store
const graphStore = useGraphStore()
const { loading } = storeToRefs(graphStore)

// 状态
const currentTheme = ref('light')

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

const handleThemeCommand = (command: string) => {
  currentTheme.value = command
  // 这里可以实现主题切换逻辑
  ElMessage.info(`已切换至${command === 'light' ? '亮色' : command === 'dark' ? '暗色' : '自动'}主题`)
}
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

            <el-dropdown @command="handleThemeCommand">
              <el-button type="text" :icon="Setting" />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="light">亮色主题</el-dropdown-item>
                  <el-dropdown-item command="dark">暗色主题</el-dropdown-item>
                  <el-dropdown-item command="auto">跟随系统</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 var(--space-4);
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
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
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
}

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
    padding: 0 var(--space-3);
  }

  .app-subtitle {
    display: none;
  }

  .app-main {
    padding: var(--space-3);
  }

  .footer-content {
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
