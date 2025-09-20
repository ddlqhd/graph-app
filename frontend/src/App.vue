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
.app-container {
  min-height: 100vh;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 24px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  color: white;
}

.app-title {
  color: white;
  margin: 0;
  font-size: 24px;
  font-weight: bold;
}

.app-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin-left: 8px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-actions .el-button {
  color: white;
  border: none;
  background: transparent;
}

.header-actions .el-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.app-main {
  padding: 24px;
  background: #f5f7fa;
  min-height: calc(100vh - 120px);
}

.app-footer {
  background: #303133;
  color: white;
  padding: 12px 24px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.footer-links {
  display: flex;
  gap: 16px;
}

.footer-links .el-link {
  color: #409eff;
}
</style>
