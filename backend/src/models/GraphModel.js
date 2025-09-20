const neo4jConnection = require('../config/database');

class GraphModel {
  constructor() {
    this.db = neo4jConnection;
  }

  // 获取所有节点和关系数据，用于图可视化
  async getGraphData(limit = 100) {
    const query = `
      MATCH (n)
      OPTIONAL MATCH (n)-[r]->(m)
      RETURN n, r, m
      LIMIT toInteger($limit)
    `;

    try {
      const result = await this.db.executeReadQuery(query, { limit: parseInt(limit) });

      const nodes = new Map();
      const edges = [];

      result.records.forEach(record => {
        const startNode = record.get('n');
        const relationship = record.get('r');
        const endNode = record.get('m');

        // 添加起始节点
        if (startNode && !nodes.has(startNode.identity.toString())) {
          nodes.set(startNode.identity.toString(), {
            id: startNode.identity.toString(),
            label: startNode.properties.name || startNode.properties.id || 'Unknown',
            type: startNode.labels[0] || 'Unknown',
            properties: startNode.properties,
            ...this.getNodeStyle(startNode.labels[0])
          });
        }

        // 添加关系和目标节点
        if (relationship && endNode) {
          if (!nodes.has(endNode.identity.toString())) {
            nodes.set(endNode.identity.toString(), {
              id: endNode.identity.toString(),
              label: endNode.properties.name || endNode.properties.id || 'Unknown',
              type: endNode.labels[0] || 'Unknown',
              properties: endNode.properties,
              ...this.getNodeStyle(endNode.labels[0])
            });
          }

          edges.push({
            id: relationship.identity.toString(),
            source: startNode.identity.toString(),
            target: endNode.identity.toString(),
            label: relationship.type,
            type: relationship.type,
            properties: relationship.properties,
            ...this.getEdgeStyle(relationship.type)
          });
        }
      });

      return {
        nodes: Array.from(nodes.values()),
        edges: edges
      };
    } catch (error) {
      console.error('获取图数据失败:', error);
      throw new Error('获取图数据失败: ' + error.message);
    }
  }

  // 根据节点类型获取样式
  getNodeStyle(nodeType) {
    const styleMap = {
      'Person': {
        color: '#FF6B6B',
        size: 40,
        icon: {
          type: 'font',
          value: '👤',
          size: 20
        }
      },
      'Department': {
        color: '#4ECDC4',
        size: 50,
        icon: {
          type: 'font',
          value: '🏢',
          size: 24
        }
      },
      'Project': {
        color: '#45B7D1',
        size: 45,
        icon: {
          type: 'font',
          value: '📋',
          size: 22
        }
      },
      'Skill': {
        color: '#F7DC6F',
        size: 35,
        icon: {
          type: 'font',
          value: '⚡',
          size: 18
        }
      }
    };

    return styleMap[nodeType] || {
      color: '#95A5A6',
      size: 30,
      icon: {
        type: 'font',
        value: '⭕',
        size: 16
      }
    };
  }

  // 根据关系类型获取样式
  getEdgeStyle(edgeType) {
    const styleMap = {
      'MANAGES': {
        color: '#E74C3C',
        style: {
          lineWidth: 3,
          lineDash: [0]
        }
      },
      'WORKS_IN': {
        color: '#3498DB',
        style: {
          lineWidth: 2,
          lineDash: [0]
        }
      },
      'PARTICIPATES_IN': {
        color: '#2ECC71',
        style: {
          lineWidth: 2,
          lineDash: [5, 5]
        }
      },
      'HAS_SKILL': {
        color: '#F39C12',
        style: {
          lineWidth: 1,
          lineDash: [2, 2]
        }
      },
      'COLLABORATES_WITH': {
        color: '#9B59B6',
        style: {
          lineWidth: 2,
          lineDash: [0]
        }
      },
      'OVERSEES': {
        color: '#E67E22',
        style: {
          lineWidth: 3,
          lineDash: [10, 5]
        }
      }
    };

    return styleMap[edgeType] || {
      color: '#BDC3C7',
      style: {
        lineWidth: 1,
        lineDash: [0]
      }
    };
  }

  // 根据部门获取子图
  async getSubgraphByDepartment(departmentName) {
    const query = `
      MATCH (d:Department {name: $departmentName})
      MATCH (p:Person)-[:WORKS_IN]->(d)
      OPTIONAL MATCH (p)-[r]-(other)
      RETURN p, r, other, d
    `;

    try {
      const result = await this.db.executeReadQuery(query, { departmentName });
      return this.processGraphResult(result);
    } catch (error) {
      console.error('获取部门子图失败:', error);
      throw new Error('获取部门子图失败: ' + error.message);
    }
  }

  // 根据项目获取相关图数据
  async getProjectGraph(projectId) {
    const query = `
      MATCH (proj:Project {id: $projectId})
      MATCH (p:Person)-[:PARTICIPATES_IN]->(proj)
      OPTIONAL MATCH (p)-[r]-(other)
      WHERE other:Person OR other:Department OR other:Skill
      RETURN p, r, other, proj
    `;

    try {
      const result = await this.db.executeReadQuery(query, { projectId });
      return this.processGraphResult(result);
    } catch (error) {
      console.error('获取项目图数据失败:', error);
      throw new Error('获取项目图数据失败: ' + error.message);
    }
  }

  // 搜索节点
  async searchNodes(keyword, nodeType = null) {
    let query = `
      MATCH (n)
      WHERE n.name CONTAINS $keyword
    `;

    if (nodeType) {
      query += ` AND $nodeType IN labels(n)`;
    }

    query += ` RETURN n LIMIT 20`;

    try {
      const result = await this.db.executeReadQuery(query, {
        keyword,
        nodeType
      });

      return result.records.map(record => {
        const node = record.get('n');
        return {
          id: node.identity.toString(),
          label: node.properties.name || node.properties.id,
          type: node.labels[0],
          properties: node.properties,
          ...this.getNodeStyle(node.labels[0])
        };
      });
    } catch (error) {
      console.error('搜索节点失败:', error);
      throw new Error('搜索节点失败: ' + error.message);
    }
  }

  // 获取节点详细信息和相邻节点
  async getNodeDetails(nodeId) {
    const query = `
      MATCH (n)
      WHERE id(n) = $nodeId
      OPTIONAL MATCH (n)-[r]-(neighbor)
      RETURN n, r, neighbor
    `;

    try {
      const result = await this.db.executeReadQuery(query, { nodeId: parseInt(nodeId) });
      return this.processGraphResult(result);
    } catch (error) {
      console.error('获取节点详情失败:', error);
      throw new Error('获取节点详情失败: ' + error.message);
    }
  }

  // 获取图统计信息
  async getGraphStats() {
    const queries = {
      totalNodes: 'MATCH (n) RETURN count(n) as count',
      totalEdges: 'MATCH ()-[r]->() RETURN count(r) as count',
      nodeTypes: 'MATCH (n) RETURN distinct labels(n) as labels, count(n) as count',
      edgeTypes: 'MATCH ()-[r]->() RETURN type(r) as type, count(r) as count'
    };

    try {
      const stats = {};

      for (const [key, query] of Object.entries(queries)) {
        const result = await this.db.executeReadQuery(query);
        if (key === 'nodeTypes' || key === 'edgeTypes') {
          stats[key] = result.records.map(record => ({
            type: key === 'nodeTypes' ? record.get('labels')[0] : record.get('type'),
            count: record.get('count').low || record.get('count')
          }));
        } else {
          stats[key] = result.records[0]?.get('count').low || 0;
        }
      }

      return stats;
    } catch (error) {
      console.error('获取图统计信息失败:', error);
      throw new Error('获取图统计信息失败: ' + error.message);
    }
  }

  // 处理查询结果的通用方法
  processGraphResult(result) {
    const nodes = new Map();
    const edges = [];

    result.records.forEach(record => {
      record.keys.forEach(key => {
        const value = record.get(key);

        if (value && value.labels) { // 这是一个节点
          const nodeId = value.identity.toString();
          if (!nodes.has(nodeId)) {
            nodes.set(nodeId, {
              id: nodeId,
              label: value.properties.name || value.properties.id || 'Unknown',
              type: value.labels[0] || 'Unknown',
              properties: value.properties,
              ...this.getNodeStyle(value.labels[0])
            });
          }
        } else if (value && value.type) { // 这是一个关系
          const start = record.get(record.keys.find(k =>
            record.get(k) && record.get(k).labels &&
            record.get(k).identity.toString() === value.start.toString()
          ));
          const end = record.get(record.keys.find(k =>
            record.get(k) && record.get(k).labels &&
            record.get(k).identity.toString() === value.end.toString()
          ));

          if (start && end) {
            edges.push({
              id: value.identity.toString(),
              source: start.identity.toString(),
              target: end.identity.toString(),
              label: value.type,
              type: value.type,
              properties: value.properties,
              ...this.getEdgeStyle(value.type)
            });
          }
        }
      });
    });

    return {
      nodes: Array.from(nodes.values()),
      edges: edges
    };
  }
}

module.exports = new GraphModel();