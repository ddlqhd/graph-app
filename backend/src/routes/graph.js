const express = require('express');
const router = express.Router();
const graphController = require('../controllers/graphController');

// 图数据路由
router.get('/data', graphController.getGraphData);

// 数据中心子图路由
router.get('/datacenter/:dcName', graphController.getSubgraphByDataCenter);

// 设备图路由
router.get('/device/:deviceName', graphController.getDeviceGraph);

// 节点搜索路由
router.get('/search', graphController.searchNodes);

// 节点详情路由
router.get('/node/:nodeId', graphController.getNodeDetails);

// 图统计信息路由
router.get('/stats', graphController.getGraphStats);

// 健康检查路由
router.get('/health', graphController.healthCheck);

// 路径查询路由
router.get('/path', graphController.findPath);

module.exports = router;