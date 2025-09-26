# GraphSQL - 图数据可视化演示平台

## 项目概述

GraphSQL 是一个基于 Vue 3 + AntV G6 + Neo4j 的图数据可视化分析演示平台。该项目专注于提供直观的图数据可视化和交互式分析功能，主要用于演示和概念验证。

### 项目结构

```
graphsql/
├── frontend/          # Vue 3 前端应用
├── backend/           # Node.js/Express 后端 API
├── database/          # Neo4j 相关配置和初始化脚本
├── docs/             # 项目文档
├── docker-compose.yml # Docker 部署配置
├── README.md         # 项目说明
├── start.sh          # 快速启动脚本
└── product_design.md # 技术选型报告
```

### 技术栈

#### 前端
- **Vue 3** - 渐进式 JavaScript 框架
- **Element Plus** - Vue 3 UI 组件库
- **AntV G6 4.8.24** - 专业图可视化引擎
- **Pinia** - Vue 状态管理
- **Vue Router** - 路由管理
- **Vite** - 构建工具
- **Axios** - HTTP 客户端
- **TypeScript** - 类型检查

#### 后端
- **Node.js** - 运行时环境
- **Express** - Web 框架
- **Neo4j Driver** - 图数据库驱动
- **TypeScript** - 类型检查

#### 数据库
- **Neo4j** - 图数据库（社区版）

#### 部署
- **Docker & Docker Compose** - 容器化部署

## 项目架构

该项目采用前后端分离的三层架构：

1. **前端展示层**：Vue 3 应用，使用 G6 进行图可视化
2. **后端服务层**：Express API 服务，处理业务逻辑和数据转换
3. **数据层**：Neo4j 图数据库，存储图结构数据

### 数据流
1. 前端 Vue 应用初始化，通过 axios 向后台 API 发起请求
2. 后端服务接收到请求，使用 neo4j-driver 构造 Cypher 查询语句
3. 驱动执行查询，Neo4j 数据库返回原始结果
4. 后端对数据进行处理和组织，封装成前端 G6 约定的数据格式（`{ nodes: [], edges: [] }`），以 JSON 形式返回
5. 前端接收到数据，交由 G6 引擎进行渲染
6. 用户在前端与图谱进行交互（缩放、拖拽、点击等），G6 负责处理所有交互逻辑
7. 交互可能触发新的数据请求（如点击展开更多关系），循环步骤 1-6

### 示例数据场景
项目预置了公司组织架构图数据，包括员工、部门、项目和技能的关系网络，便于演示图数据可视化的效果。

## Building and Running

### 环境要求
- Node.js 16+
- Docker & Docker Compose（推荐）
- 4GB+ RAM

### 使用 Docker Compose（推荐）

```bash
# 克隆项目
git clone https://github.com/your-repo/graphsql.git
cd graphsql

# 启动所有服务
docker-compose up -d

# 访问应用
open http://localhost:5173
```

### 使用快速启动脚本

```bash
# 启动开发环境
./start.sh dev

# 启动生产环境
./start.sh prod

# 清理环境
./start.sh clean
```

### 手动安装

1. **启动 Neo4j 数据库**
   ```bash
   docker run -d \
     --name graphsql-neo4j \
     -p 7474:7474 -p 7687:7687 \
     -e NEO4J_AUTH=neo4j/password123 \
     neo4j:5.13
   ```

2. **初始化示例数据**
   ```bash
   cd database
   npm install
   npm run init
   ```

3. **启动后端服务**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

4. **启动前端应用**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### 访问地址
- 前端应用: http://localhost:5173
- 后端API: http://localhost:3000
- Neo4j Browser: http://localhost:7474

## 项目功能

### 功能特性
- 🎯 **多种布局算法** - 力导向、层次、网格等布局
- 🎨 **丰富交互** - 缩放、拖拽、点击展开、搜索
- 📱 **响应式设计** - 适配不同屏幕尺寸
- 🔍 **智能搜索** - 节点和关系搜索过滤
- 📊 **数据面板** - 实时展示图统计信息
- 🎭 **主题切换** - 支持明暗主题

### API 接口
- `GET /api/graph/data` - 获取图数据
- `GET /api/graph/stats` - 获取图统计信息
- `GET /api/graph/search?keyword=xxx` - 搜索节点
- `GET /api/graph/health` - 健康检查
- `GET /api/graph/department/:departmentName` - 获取部门子图
- `GET /api/graph/project/:projectId` - 获取项目图
- `GET /api/graph/node/:nodeId` - 获取节点详情

## Development Conventions

### 开发规范
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 和 Prettier 代码风格
- 编写单元测试和集成测试
- 更新相关文档

### 项目目录结构说明

#### backend/
- `src/index.js` - 后端服务入口文件
- `src/config/database.js` - 数据库连接配置
- `src/routes/graph.js` - 图数据API路由
- `src/controllers/graphController.js` - 图数据API控制器
- `src/models/GraphModel.js` - 图数据模型，负责与Neo4j交互

#### frontend/
- `src/main.ts` - 前端应用入口
- `src/App.vue` - 主应用组件
- `src/router/index.ts` - 路由配置
- `src/stores/graph.ts` - Pinia状态管理
- `src/components/GraphViewer.vue` - G6图可视化组件
- `src/services/graphService.ts` - API服务接口
- `src/utils/api.ts` - 通用API工具

#### database/
- `init-data.cypher` - Neo4j示例数据初始化脚本
- `import-data.js` - 数据导入脚本
- `clear-data.js` - 数据清除脚本

## 常见操作

### 如何添加自定义数据？
修改 `database/init-data.cypher` 文件，然后重新运行 `npm run init`。

### 如何修改图的样式？
在 `backend/src/models/GraphModel.js` 中修改 `getNodeStyle` 和 `getEdgeStyle` 方法。

### 支持的浏览器
支持现代浏览器，包括 Chrome 80+、Firefox 75+、Safari 14+、Edge 80+。

### 部署方案
支持 Docker Compose 部署，也支持单独部署前端(nginx)和后端(Node.js)。