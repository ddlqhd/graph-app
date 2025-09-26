const GraphModel = require('../models/GraphModel');

// 获取图数据
async function getGraphData(req, res) {
  try {
    const { limit } = req.query;
    const graphData = await GraphModel.getGraphData(limit || 100);
    res.json(graphData);
  } catch (error) {
    console.error('获取图数据失败:', error);
    res.status(500).json({ error: '获取图数据失败' });
  }
}

// 根据数据中心获取子图
async function getSubgraphByDataCenter(req, res) {
  try {
    const { dcName } = req.params;
    const graphData = await GraphModel.getSubgraphByDataCenter(dcName);
    res.json(graphData);
  } catch (error) {
    console.error('获取数据中心子图失败:', error);
    res.status(500).json({ error: '获取数据中心子图失败' });
  }
}

// 根据设备获取图数据
async function getDeviceGraph(req, res) {
  try {
    const { deviceName } = req.params;
    const graphData = await GraphModel.getDeviceGraph(deviceName);
    res.json(graphData);
  } catch (error) {
    console.error('获取设备图数据失败:', error);
    res.status(500).json({ error: '获取设备图数据失败' });
  }
}

// 搜索节点
async function searchNodes(req, res) {
  try {
    const { keyword, type } = req.query;
    const nodes = await GraphModel.searchNodes(keyword, type);
    res.json(nodes);
  } catch (error) {
    console.error('搜索节点失败:', error);
    res.status(500).json({ error: '搜索节点失败' });
  }
}

// 获取节点详情
async function getNodeDetails(req, res) {
  try {
    const { nodeId } = req.params;
    const nodeData = await GraphModel.getNodeDetails(nodeId);
    res.json(nodeData);
  } catch (error) {
    console.error('获取节点详情失败:', error);
    res.status(500).json({ error: '获取节点详情失败' });
  }
}

// 获取图统计信息
async function getGraphStats(req, res) {
  try {
    const stats = await GraphModel.getGraphStats();
    res.json(stats);
  } catch (error) {
    console.error('获取图统计信息失败:', error);
    res.status(500).json({ error: '获取图统计信息失败' });
  }
}

// 健康检查
async function healthCheck(req, res) {
  try {
    await GraphModel.getGraphStats();
    res.json({ status: 'OK', message: 'GraphSQL 服务运行正常' });
  } catch (error) {
    console.error('健康检查失败:', error);
    res.status(500).json({ status: 'ERROR', message: '服务异常' });
  }
}

module.exports = {
  getGraphData,
  getSubgraphByDataCenter,
  getDeviceGraph,
  searchNodes,
  getNodeDetails,
  getGraphStats,
  healthCheck
};