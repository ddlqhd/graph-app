# GraphSQL 开发指南

## 项目架构

### 技术栈

**前端技术栈：**
- Vue 3 + TypeScript - 现代化的前端框架
- Element Plus - 企业级 UI 组件库
- AntV G6 - 专业图可视化引擎
- Pinia - Vue 3 状态管理
- Vite - 快速构建工具
- Axios - HTTP 客户端

**后端技术栈：**
- Node.js + Express - 服务端框架
- Neo4j - 图数据库
- Neo4j Driver - 数据库驱动

### 目录结构

```
graphsql/
├── frontend/                 # Vue 3 前端应用
│   ├── src/
│   │   ├── components/       # 公共组件
│   │   ├── views/           # 页面组件
│   │   ├── stores/          # Pinia 状态管理
│   │   ├── services/        # API 服务
│   │   ├── utils/           # 工具函数
│   │   └── main.ts          # 应用入口
│   ├── public/              # 静态资源
│   └── package.json
├── backend/                 # Node.js 后端服务
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── models/          # 数据模型
│   │   ├── routes/          # 路由定义
│   │   ├── config/          # 配置文件
│   │   └── middleware/      # 中间件
│   └── package.json
├── database/                # Neo4j 数据库相关
│   ├── init/               # 初始化脚本
│   ├── import-data.js      # 数据导入工具
│   └── package.json
├── docs/                   # 项目文档
├── docker-compose.yml      # Docker 编排
└── README.md
```

## 开发环境搭建

### 1. 环境准备

```bash
# 安装 Node.js (推荐使用 nvm)
nvm install 18
nvm use 18

# 验证安装
node --version  # v18.x.x
npm --version   # 9.x.x
```

### 2. 克隆项目

```bash
git clone https://github.com/your-repo/graphsql.git
cd graphsql
```

### 3. 启动 Neo4j

```bash
# 使用 Docker 启动
docker-compose up -d neo4j

# 或手动启动
docker run -d \
  --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password123 \
  neo4j:5.13
```

### 4. 初始化数据

```bash
cd database
npm install
npm run init
```

### 5. 启动后端服务

```bash
cd backend
npm install
npm run dev
```

### 6. 启动前端应用

```bash
cd frontend
npm install
npm run dev
```

## 代码规范

### TypeScript 配置

项目使用 TypeScript 进行类型检查，配置文件：

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "jsx": "preserve",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### ESLint 配置

```json
// .eslintrc.json
{
  "extends": [
    "@vue/typescript/recommended",
    "@vue/prettier",
    "@vue/prettier/@typescript-eslint"
  ],
  "rules": {
    "no-console": "warn",
    "no-debugger": "warn",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

### 代码风格

1. **命名规范**
   - 组件名：PascalCase (如 `GraphViewer.vue`)
   - 文件名：kebab-case (如 `graph-viewer.vue`)
   - 变量名：camelCase (如 `graphData`)
   - 常量名：UPPER_SNAKE_CASE (如 `API_BASE_URL`)

2. **Vue 组件规范**

```vue
<template>
  <div class="component-name">
    <!-- 模板内容 -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { ComponentProps } from './types'

// Props 定义
interface Props {
  data: ComponentProps
}

const props = defineProps<Props>()

// 响应式数据
const loading = ref(false)

// 计算属性
const computedValue = computed(() => {
  return props.data.length
})

// 方法
const handleClick = () => {
  // 处理逻辑
}

// 生命周期
onMounted(() => {
  // 初始化逻辑
})
</script>

<style scoped>
.component-name {
  /* 样式定义 */
}
</style>
```

## 数据流设计

### 状态管理

使用 Pinia 进行状态管理：

```typescript
// stores/graph.ts
export const useGraphStore = defineStore('graph', () => {
  // 状态
  const graphData = ref<GraphData>({ nodes: [], edges: [] })
  const loading = ref(false)

  // 计算属性
  const nodeCount = computed(() => graphData.value.nodes.length)

  // 操作
  const loadGraphData = async () => {
    loading.value = true
    try {
      const data = await graphAPI.getGraphData()
      graphData.value = data
    } finally {
      loading.value = false
    }
  }

  return {
    graphData,
    loading,
    nodeCount,
    loadGraphData
  }
})
```

### API 服务

```typescript
// services/graphService.ts
class GraphAPI {
  async getGraphData(limit = 100): Promise<GraphData> {
    const response = await api.get(`/api/graph/data?limit=${limit}`)
    return response.data
  }

  async searchNodes(keyword: string): Promise<GraphNode[]> {
    const response = await api.get(`/api/graph/search?keyword=${keyword}`)
    return response.data
  }
}

export const graphAPI = new GraphAPI()
```

## 组件开发

### 图可视化组件

核心组件 `GraphViewer.vue` 使用 AntV G6：

```typescript
// 初始化图实例
const initGraph = () => {
  graph = new Graph({
    container: graphContainer.value,
    width: props.width,
    height: props.height,
    modes: {
      default: ['drag-canvas', 'zoom-canvas', 'drag-node']
    },
    layout: {
      type: 'force',
      preventOverlap: true
    }
  })
}

// 更新图数据
const updateGraphData = () => {
  const g6Data = convertToG6Data(graphData.value)
  graph.data(g6Data)
  graph.render()
}
```

### 搜索控制组件

```vue
<template>
  <el-input
    v-model="searchKeyword"
    placeholder="搜索节点..."
    @keyup.enter="handleSearch"
  >
    <template #append>
      <el-button @click="handleSearch" :icon="Search" />
    </template>
  </el-input>
</template>

<script setup lang="ts">
const handleSearch = async () => {
  if (!searchKeyword.value) return

  const results = await graphStore.searchNodes(searchKeyword.value)
  // 处理搜索结果
}
</script>
```

## 后端开发

### 控制器开发

```javascript
// controllers/graphController.js
class GraphController {
  async getGraph(req, res) {
    try {
      const { limit = 100 } = req.query
      const graphData = await GraphModel.getGraphData(limit)

      res.json({
        success: true,
        data: graphData,
        message: '图数据获取成功'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }
}
```

### 数据模型开发

```javascript
// models/GraphModel.js
class GraphModel {
  async getGraphData(limit = 100) {
    const query = `
      MATCH (n)
      OPTIONAL MATCH (n)-[r]->(m)
      RETURN n, r, m
      LIMIT $limit
    `

    const result = await this.db.executeReadQuery(query, { limit })
    return this.processGraphResult(result)
  }
}
```

## 测试

### 前端测试

```bash
# 单元测试
npm run test:unit

# E2E 测试
npm run test:e2e

# 组件测试
npm run test:component
```

### 后端测试

```bash
# API 测试
npm run test

# 集成测试
npm run test:integration
```

### 测试示例

```javascript
// tests/api.test.js
describe('Graph API', () => {
  test('should return graph data', async () => {
    const response = await request(app)
      .get('/api/graph/data')
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.data).toHaveProperty('nodes')
    expect(response.body.data).toHaveProperty('edges')
  })
})
```

## 调试技巧

### 前端调试

1. **Vue DevTools**：安装浏览器插件进行组件调试
2. **Console 调试**：使用 `console.log` 输出调试信息
3. **Network 面板**：检查 API 请求和响应

### 后端调试

1. **使用 nodemon**：自动重启服务
2. **日志输出**：使用 `console.log` 或 winston
3. **断点调试**：使用 VS Code 断点调试

### Neo4j 调试

1. **Neo4j Browser**：可视化查询和调试 Cypher
2. **查询优化**：使用 `EXPLAIN` 和 `PROFILE`

```cypher
EXPLAIN MATCH (n:Person)-[:WORKS_IN]->(d:Department)
RETURN n.name, d.name
```

## 贡献指南

### 提交代码

1. Fork 项目
2. 创建特性分支：`git checkout -b feature/new-feature`
3. 提交更改：`git commit -m 'Add new feature'`
4. 推送到分支：`git push origin feature/new-feature`
5. 创建 Pull Request

### Commit 规范

使用约定式提交格式：

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

类型说明：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建或工具变动

示例：
```
feat(frontend): add search functionality to graph viewer

Add search input component with real-time filtering
Support search by node name and type
Update graph store to handle search results

Closes #123
```

## 常见问题

### Q: G6 图形渲染异常？

A: 检查容器尺寸是否正确设置，确保在 DOM 挂载后初始化图实例。

### Q: Neo4j 连接失败？

A: 检查连接配置，确保 Neo4j 服务已启动并且端口正确。

### Q: API 跨域问题？

A: 配置 CORS 中间件，允许前端域名访问。

### Q: 图数据加载慢？

A: 考虑添加分页或限制返回数据量，使用缓存优化重复请求。