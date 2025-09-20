const express = require('express');
const router = express.Router();
const graphController = require('../controllers/graphController');

// 图数据路由
router.get('/data', graphController.getGraph);

// 部门子图路由
router.get('/department/:departmentName', graphController.getDepartmentSubgraph);

// 项目图路由
router.get('/project/:projectId', graphController.getProjectGraph);

// 节点搜索路由
router.get('/search', graphController.searchNodes);

// 节点详情路由
router.get('/node/:nodeId', graphController.getNodeDetails);

// 图统计信息路由
router.get('/stats', graphController.getGraphStats);

// 健康检查路由
router.get('/health', graphController.healthCheck);

module.exports = router;