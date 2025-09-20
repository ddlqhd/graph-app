const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const neo4jConnection = require('./config/database');
const graphRoutes = require('./routes/graph');
const { errorHandler, notFound, requestLogger } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// 安全中间件
app.use(helmet());

// CORS 配置
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// 请求解析中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 日志中间件
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(requestLogger);

// API 路由
app.use('/api/graph', graphRoutes);

// 根路由
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 GraphSQL API 服务运行中',
    data: {
      name: 'GraphSQL Backend',
      version: '1.0.0',
      description: '图数据可视化演示平台后端服务',
      endpoints: {
        graph: '/api/graph/data',
        stats: '/api/graph/stats',
        search: '/api/graph/search',
        health: '/api/graph/health',
        department: '/api/graph/department/:departmentName',
        project: '/api/graph/project/:projectId',
        node: '/api/graph/node/:nodeId'
      }
    }
  });
});

// API 信息路由
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'GraphSQL API v1.0.0',
    data: {
      endpoints: [
        'GET /api/graph/data - 获取图数据',
        'GET /api/graph/stats - 获取图统计信息',
        'GET /api/graph/search?keyword=xxx - 搜索节点',
        'GET /api/graph/health - 健康检查',
        'GET /api/graph/department/:departmentName - 获取部门子图',
        'GET /api/graph/project/:projectId - 获取项目图',
        'GET /api/graph/node/:nodeId - 获取节点详情'
      ]
    }
  });
});

// 错误处理中间件
app.use(notFound);
app.use(errorHandler);

// 启动服务器
async function startServer() {
  try {
    // 连接数据库
    await neo4jConnection.connect();

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`
🚀 GraphSQL 后端服务已启动
📍 服务地址: http://localhost:${PORT}
🌍 环境: ${process.env.NODE_ENV || 'development'}
📊 API 文档: http://localhost:${PORT}/api
🔍 健康检查: http://localhost:${PORT}/api/graph/health
      `);
    });
  } catch (error) {
    console.error('❌ 服务启动失败:', error.message);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('\n🔄 正在关闭服务...');
  await neo4jConnection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 正在关闭服务...');
  await neo4jConnection.close();
  process.exit(0);
});

// 启动应用
startServer();

module.exports = app;