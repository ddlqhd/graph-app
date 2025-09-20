<template>
  <div class="about-view">
    <el-card class="about-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="24" class="header-icon">
            <Histogram />
          </el-icon>
          <span class="header-title">关于 GraphSQL</span>
        </div>
      </template>

      <div class="about-content">
        <div class="section">
          <h3>项目简介</h3>
          <p>
            GraphSQL 是一个基于 Vue 3 + AntV G6 + Neo4j 的图数据可视化演示平台。
            它旨在为用户提供直观、交互式的图数据分析体验，支持多种图布局算法和丰富的交互功能。
          </p>
        </div>

        <div class="section">
          <h3>技术栈</h3>
          <el-row :gutter="20">
            <el-col :span="12">
              <h4>前端技术</h4>
              <ul>
                <li>Vue 3 - 渐进式 JavaScript 框架</li>
                <li>TypeScript - 类型安全的 JavaScript</li>
                <li>Element Plus - Vue 3 UI 组件库</li>
                <li>AntV G6 - 专业图可视化引擎</li>
                <li>Pinia - Vue 状态管理</li>
                <li>Vite - 现代化构建工具</li>
              </ul>
            </el-col>
            <el-col :span="12">
              <h4>后端技术</h4>
              <ul>
                <li>Node.js - JavaScript 运行时</li>
                <li>Express - Web 应用框架</li>
                <li>Neo4j - 图数据库</li>
                <li>Neo4j Driver - 数据库驱动</li>
                <li>Docker - 容器化部署</li>
              </ul>
            </el-col>
          </el-row>
        </div>

        <div class="section">
          <h3>主要功能</h3>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-card class="feature-card">
                <template #header>
                  <el-icon><View /></el-icon>
                  图数据可视化
                </template>
                支持多种图布局算法，包括力导向、层次、辐射和网格布局
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card class="feature-card">
                <template #header>
                  <el-icon><Search /></el-icon>
                  智能搜索
                </template>
                支持节点和关系的搜索过滤，快速定位目标数据
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card class="feature-card">
                <template #header>
                  <el-icon><Mouse /></el-icon>
                  丰富交互
                </template>
                支持缩放、拖拽、点击展开等多种交互操作
              </el-card>
            </el-col>
          </el-row>
        </div>

        <div class="section">
          <h3>演示数据</h3>
          <p>
            本平台提供了公司组织架构的演示数据，包含以下节点类型：
          </p>
          <el-space wrap>
            <el-tag type="success">Person - 人员</el-tag>
            <el-tag type="primary">Department - 部门</el-tag>
            <el-tag type="warning">Project - 项目</el-tag>
            <el-tag type="info">Skill - 技能</el-tag>
          </el-space>
          <p style="margin-top: 16px;">
            以及多种关系类型：管理关系(MANAGES)、工作关系(WORKS_IN)、项目参与(PARTICIPATES_IN)、
            技能拥有(HAS_SKILL)、协作关系(COLLABORATES_WITH)等。
          </p>
        </div>

        <div class="section">
          <h3>使用指南</h3>
          <el-steps direction="vertical">
            <el-step title="查看图数据" description="启动应用后会自动加载演示数据，显示完整的组织架构图" />
            <el-step title="交互操作" description="可以拖拽节点、缩放画布、点击节点查看详细信息" />
            <el-step title="搜索过滤" description="使用左侧控制面板搜索特定节点或按部门/项目过滤" />
            <el-step title="布局切换" description="使用工具栏切换不同的图布局算法" />
          </el-steps>
        </div>

        <div class="section">
          <h3>项目信息</h3>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="版本">1.0.0</el-descriptions-item>
            <el-descriptions-item label="开发者">GraphSQL Team</el-descriptions-item>
            <el-descriptions-item label="许可证">MIT License</el-descriptions-item>
            <el-descriptions-item label="GitHub">
              <el-link href="https://github.com/your-repo/graphsql" target="_blank" type="primary">
                查看源码
              </el-link>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import {
  Histogram,
  View,
  Search,
  Mouse
} from '@element-plus/icons-vue'
</script>

<style scoped>
.about-view {
  max-width: 1200px;
  margin: 0 auto;
}

.about-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  color: #409eff;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
}

.about-content {
  line-height: 1.6;
}

.section {
  margin-bottom: 32px;
}

.section h3 {
  color: #303133;
  margin-bottom: 16px;
  border-bottom: 2px solid #409eff;
  padding-bottom: 8px;
}

.section h4 {
  color: #606266;
  margin-bottom: 12px;
}

.section ul {
  padding-left: 20px;
}

.section li {
  margin-bottom: 8px;
  color: #606266;
}

.feature-card {
  text-align: center;
  height: 120px;
}

.feature-card .el-card__header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: bold;
}

.feature-card .el-card__body {
  font-size: 14px;
  color: #606266;
}

.el-steps {
  margin-top: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .about-view {
    margin: 0 16px;
  }

  .section {
    margin-bottom: 24px;
  }

  .el-col {
    margin-bottom: 16px;
  }
}
</style>
