# 图数据可视化演示平台

基于 Vue 3 + AntV G6 + Neo4j 的图数据可视化分析演示产品。

## 项目结构

```
graphsql/
├── frontend/          # Vue 3 前端应用
├── backend/           # Node.js/Express 后端 API
├── database/          # Neo4j 相关配置和初始化脚本
├── docs/             # 项目文档
├── docker-compose.yml # Docker 部署配置
├── README.md         # 项目说明
└── product_design.md # 技术选型报告
```

## 技术栈

### 前端
- **Vue 3** - 渐进式 JavaScript 框架
- **Element Plus** - Vue 3 UI 组件库
- **AntV G6** - 专业图可视化引擎
- **Pinia** - Vue 状态管理
- **Vue Router** - 路由管理
- **Vite** - 构建工具
- **Axios** - HTTP 客户端

### 后端
- **Node.js** - 运行时环境
- **Express** - Web 框架
- **Neo4j Driver** - 图数据库驱动

### 数据库
- **Neo4j** - 图数据库（社区版）

## 快速开始

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

5. **访问应用**
   - 前端应用: http://localhost:5173
   - 后端API: http://localhost:3000
   - Neo4j Browser: http://localhost:7474

### 环境要求
- Node.js 16+
- Docker & Docker Compose（推荐）
- 4GB+ RAM

### 演示数据

项目包含以下演示场景：
- 公司组织架构图
- 知识图谱网络
- 社交关系网络

## 功能特性

- 🎯 **多种布局算法** - 力导向、层次、网格等布局
- 🎨 **丰富交互** - 缩放、拖拽、点击展开、搜索
- 📱 **响应式设计** - 适配不同屏幕尺寸
- 🔍 **智能搜索** - 节点和关系搜索过滤
- 📊 **数据面板** - 实时展示图统计信息
- 🎭 **主题切换** - 支持明暗主题

## 文档

- [API 文档](./docs/API.md) - 后端 API 接口说明
- [开发指南](./docs/DEVELOPMENT.md) - 开发环境搭建和代码规范
- [部署指南](./docs/DEPLOYMENT.md) - 生产环境部署说明
- [技术选型](./product_design.md) - 技术架构和选型报告

## 截图演示

### 主界面
系统主界面展示了完整的组织架构图，支持多种布局算法和交互操作。

### 搜索功能
左侧控制面板提供了强大的搜索和过滤功能，可以按部门、项目或关键词进行筛选。

### 节点详情
点击节点后可以查看详细信息，包括属性、相关节点和连接关系。

## 贡献指南

我们欢迎各种形式的贡献！请参考 [开发指南](./docs/DEVELOPMENT.md) 了解更多细节。

### 提交流程
1. Fork 项目
2. 创建特性分支: `git checkout -b feature/new-feature`
3. 提交更改: `git commit -m 'Add new feature'`
4. 推送到分支: `git push origin feature/new-feature`
5. 创建 Pull Request

### 开发规范
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 和 Prettier 代码风格
- 编写单元测试和集成测试
- 更新相关文档

## 常见问题

### Q: 如何添加自定义数据？
A: 修改 `database/init-data.cypher` 文件，然后重新运行 `npm run init`。

### Q: 支持哪些浏览器？
A: 支持现代浏览器，包括 Chrome 80+、Firefox 75+、Safari 14+、Edge 80+。

### Q: 如何修改图的样式？
A: 在 `backend/src/models/GraphModel.js` 中修改 `getNodeStyle` 和 `getEdgeStyle` 方法。

### Q: 可以连接其他数据库吗？
A: 目前仅支持 Neo4j，但架构设计为易于扩展的模块化结构。

## 许可证

MIT License - 详情请查看 [LICENSE](./LICENSE) 文件。

## 联系方式

- GitHub Issues: [提交问题](https://github.com/your-repo/graphsql/issues)
- Email: your-email@example.com
- 项目主页: https://github.com/your-repo/graphsql

---

❤️ 由 GraphSQL 团队精心打造，致力于提供最佳的图数据可视化体验。