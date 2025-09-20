const GraphModel = require('../models/GraphModel');

class GraphController {
  // 获取图数据
  async getGraph(req, res) {
    try {
      const { limit = 100 } = req.query;
      const graphData = await GraphModel.getGraphData(limit);

      res.json({
        success: true,
        data: graphData,
        message: '图数据获取成功'
      });
    } catch (error) {
      console.error('获取图数据失败:', error);
      res.status(500).json({
        success: false,
        message: error.message,
        data: null
      });
    }
  }

  // 获取部门子图
  async getDepartmentSubgraph(req, res) {
    try {
      const { departmentName } = req.params;
      const graphData = await GraphModel.getSubgraphByDepartment(departmentName);

      res.json({
        success: true,
        data: graphData,
        message: `${departmentName} 部门图数据获取成功`
      });
    } catch (error) {
      console.error('获取部门子图失败:', error);
      res.status(500).json({
        success: false,
        message: error.message,
        data: null
      });
    }
  }

  // 获取项目相关图数据
  async getProjectGraph(req, res) {
    try {
      const { projectId } = req.params;
      const graphData = await GraphModel.getProjectGraph(projectId);

      res.json({
        success: true,
        data: graphData,
        message: `项目 ${projectId} 图数据获取成功`
      });
    } catch (error) {
      console.error('获取项目图数据失败:', error);
      res.status(500).json({
        success: false,
        message: error.message,
        data: null
      });
    }
  }

  // 搜索节点
  async searchNodes(req, res) {
    try {
      const { keyword, type } = req.query;

      if (!keyword) {
        return res.status(400).json({
          success: false,
          message: '搜索关键词不能为空',
          data: null
        });
      }

      const nodes = await GraphModel.searchNodes(keyword, type);

      res.json({
        success: true,
        data: nodes,
        message: `搜索到 ${nodes.length} 个相关节点`
      });
    } catch (error) {
      console.error('搜索节点失败:', error);
      res.status(500).json({
        success: false,
        message: error.message,
        data: null
      });
    }
  }

  // 获取节点详情
  async getNodeDetails(req, res) {
    try {
      const { nodeId } = req.params;
      const nodeData = await GraphModel.getNodeDetails(nodeId);

      res.json({
        success: true,
        data: nodeData,
        message: '节点详情获取成功'
      });
    } catch (error) {
      console.error('获取节点详情失败:', error);
      res.status(500).json({
        success: false,
        message: error.message,
        data: null
      });
    }
  }

  // 获取图统计信息
  async getGraphStats(req, res) {
    try {
      const stats = await GraphModel.getGraphStats();

      res.json({
        success: true,
        data: stats,
        message: '图统计信息获取成功'
      });
    } catch (error) {
      console.error('获取图统计信息失败:', error);
      res.status(500).json({
        success: false,
        message: error.message,
        data: null
      });
    }
  }

  // 健康检查
  async healthCheck(req, res) {
    try {
      // 简单的数据库连接测试
      await GraphModel.getGraphStats();

      res.json({
        success: true,
        data: {
          status: 'healthy',
          database: 'connected',
          timestamp: new Date().toISOString()
        },
        message: '服务运行正常'
      });
    } catch (error) {
      console.error('健康检查失败:', error);
      res.status(503).json({
        success: false,
        data: {
          status: 'unhealthy',
          database: 'disconnected',
          timestamp: new Date().toISOString()
        },
        message: '服务异常: ' + error.message
      });
    }
  }
}

module.exports = new GraphController();