# GraphSQL 部署指南

## 环境要求

### 开发环境
- Node.js 16.0+
- npm 或 yarn
- Docker (可选，用于 Neo4j)

### 生产环境
- Docker & Docker Compose
- 4GB+ RAM
- 2 CPU 核心

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-repo/graphsql.git
cd graphsql
```

### 2. 使用 Docker Compose（推荐）

最简单的方式是使用 Docker Compose 一键启动整个应用：

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

服务启动后可访问：
- 前端应用：http://localhost:5173
- 后端API：http://localhost:3000
- Neo4j Browser：http://localhost:7474

### 3. 手动部署

#### 3.1 启动 Neo4j 数据库

```bash
# 使用 Docker 启动 Neo4j
docker run -d \
  --name graphsql-neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password123 \
  -e NEO4J_PLUGINS='["apoc"]' \
  neo4j:5.13
```

#### 3.2 初始化数据

```bash
cd database
npm install
npm run init
```

#### 3.3 启动后端服务

```bash
cd backend
npm install
npm run dev  # 开发模式
# 或
npm start    # 生产模式
```

#### 3.4 启动前端应用

```bash
cd frontend
npm install
npm run dev  # 开发模式
# 或
npm run build && npm run preview  # 生产模式
```

## 环境配置

### 后端环境变量

创建 `backend/.env` 文件：

```env
# Neo4j 数据库配置
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password123

# 服务器配置
PORT=3000
NODE_ENV=development

# CORS 配置
CORS_ORIGIN=http://localhost:5173
```

### 前端环境变量

创建 `frontend/.env` 文件：

```env
# API 基础 URL
VITE_API_BASE_URL=http://localhost:3000

# 应用配置
VITE_APP_TITLE=GraphSQL - 图数据可视化演示平台
VITE_APP_VERSION=1.0.0
```

## 生产部署

### Docker 部署

1. **构建镜像**

```bash
# 构建后端镜像
cd backend
docker build -t graphsql-backend .

# 构建前端镜像
cd frontend
docker build -t graphsql-frontend .
```

2. **使用 Docker Compose**

```bash
# 生产模式启动
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Kubernetes 部署

1. **创建命名空间**

```bash
kubectl create namespace graphsql
```

2. **部署应用**

```bash
kubectl apply -f k8s/ -n graphsql
```

### 云服务部署

#### AWS ECS

1. 推送镜像到 ECR
2. 创建 ECS 任务定义
3. 创建 ECS 服务

#### 阿里云容器服务

1. 推送镜像到 ACR
2. 创建容器服务集群
3. 部署应用

## 性能优化

### 前端优化

1. **启用 gzip 压缩**

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_comp_level 6;
gzip_types text/plain text/css application/json application/javascript;
```

2. **静态资源缓存**

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 后端优化

1. **使用集群模式**

```javascript
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  require('./src/index.js');
}
```

2. **添加缓存**

```javascript
const redis = require('redis');
const client = redis.createClient();

// 缓存图数据
app.get('/api/graph/data', async (req, res) => {
  const cacheKey = 'graph:data';
  const cached = await client.get(cacheKey);

  if (cached) {
    return res.json(JSON.parse(cached));
  }

  const data = await getGraphData();
  await client.setex(cacheKey, 300, JSON.stringify(data)); // 5分钟缓存
  res.json(data);
});
```

### 数据库优化

1. **创建索引**

```cypher
CREATE INDEX person_name_index FOR (p:Person) ON (p.name);
CREATE INDEX department_name_index FOR (d:Department) ON (d.name);
```

2. **查询优化**

```cypher
// 使用参数化查询
MATCH (p:Person {name: $name})
RETURN p

// 限制结果集大小
MATCH (n)-[r]->(m)
RETURN n, r, m
LIMIT 100
```

## 监控和日志

### 应用监控

1. **健康检查端点**

```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

2. **Prometheus 指标**

```javascript
const prometheus = require('prom-client');

const http