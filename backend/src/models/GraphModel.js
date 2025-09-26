const neo4jConnection = require('../config/database');

class GraphModel {
  constructor() {
    this.db = neo4jConnection;
  }

  // 获取所有节点和关系数据，用于图可视化
  async getGraphData(limit = 100) {
    // 优化查询，将端口间的连接直接转换为设备间的连接
    const query = `
      // 获取所有设备节点
      MATCH (d:Device)
      OPTIONAL MATCH (d)-[:HAS_PORT]->(p)-[:CONNECTS_TO]-(p2)<-[:HAS_PORT]-(d2)
      WHERE d2 IS NOT NULL
      RETURN d, d2, p, p2
      LIMIT toInteger($limit)
      
      UNION
      
      // 获取没有连接的设备节点
      MATCH (d:Device)
      WHERE NOT (d)-[:HAS_PORT]->(:Port)-[:CONNECTS_TO]-(:Port)<-[:HAS_PORT]-(:Device)
      AND NOT (d)-[:HAS_PORT]->(:Port)<-[:HAS_PORT]-(:Device)
      RETURN d, null as d2, null as p, null as p2
    `;

    try {
      const result = await this.db.executeReadQuery(query, { limit: parseInt(limit) });

      const nodes = new Map();
      const edges = [];

      result.records.forEach(record => {
        const device = record.get('d');
        const connectedDevice = record.get('d2');
        const port = record.get('p');
        const connectedPort = record.get('p2');

        // 添加设备节点
        if (device && !nodes.has(device.identity.toString())) {
          const nodeLabel = device.properties.device_name || 
                           device.properties.name || 
                           device.properties.id || 
                           'Unknown';
          nodes.set(device.identity.toString(), {
            id: device.identity.toString(),
            label: nodeLabel,
            type: 'Device',
            properties: device.properties,
            ...this.getNodeStyle('Device')
          });
        }

        // 如果存在连接的设备，则创建边
        if (connectedDevice) {
          // 添加连接的设备节点
          if (!nodes.has(connectedDevice.identity.toString())) {
            const nodeLabel = connectedDevice.properties.device_name || 
                             connectedDevice.properties.name || 
                             connectedDevice.properties.id || 
                             'Unknown';
            nodes.set(connectedDevice.identity.toString(), {
              id: connectedDevice.identity.toString(),
              label: nodeLabel,
              type: 'Device',
              properties: connectedDevice.properties,
              ...this.getNodeStyle('Device')
            });
          }

          // 创建设备之间的连接（基于端口连接）
          const edgeId = `${device.identity.toString()}-${connectedDevice.identity.toString()}`;
          edges.push({
            id: edgeId,
            source: device.identity.toString(),
            target: connectedDevice.identity.toString(),
            label: 'CONNECTS_TO_DEVICE',
            type: 'CONNECTS_TO_DEVICE',
            properties: {
              original_ports: {
                src_port: port ? port.properties.port_name : null,
                dst_port: connectedPort ? connectedPort.properties.port_name : null
              }
            },
            ...this.getEdgeStyle('CONNECTS_TO_DEVICE')
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
      'Device': {
        color: '#3498DB',
        size: 45,
        icon: {
          type: 'font',
          value: '🖥️',
          size: 22
        }
      },
      'Port': {
        color: '#E74C3C',
        size: 30,
        icon: {
          type: 'font',
          value: '🔌',
          size: 16
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
      'HAS_PORT': {
        color: '#3498DB',
        style: {
          lineWidth: 2,
          lineDash: [0]
        }
      },
      'CONNECTS_TO': {
        color: '#2ECC71',
        style: {
          lineWidth: 1,
          lineDash: [5, 5]
        }
      }
    };

    return styleMap[edgeType] || {
      color: '#BDC3C7',
      style: {
        lineWidth: 1,
        lineDash: [0]
      },
      label: ''  // 不显示默认标签
    };
  }

  // 根据数据中心获取子图
  async getSubgraphByDataCenter(dcName) {
    const query = `
      MATCH (d:Device {dc: $dcName})
      OPTIONAL MATCH (d)-[r]-(other)
      RETURN d, r, other
    `;

    try {
      const result = await this.db.executeReadQuery(query, { dcName });
      return this.processGraphResult(result);
    } catch (error) {
      console.error('获取数据中心子图失败:', error);
      throw new Error('获取数据中心子图失败: ' + error.message);
    }
  }

  // 根据设备获取相关图数据
  async getDeviceGraph(deviceName) {
    const query = `
      MATCH (d:Device {device_name: $deviceName})
      OPTIONAL MATCH (d)-[r]-(other)
      RETURN d, r, other
    `;

    try {
      const result = await this.db.executeReadQuery(query, { deviceName });
      return this.processGraphResult(result);
    } catch (error) {
      console.error('获取设备图数据失败:', error);
      throw new Error('获取设备图数据失败: ' + error.message);
    }
  }

  // 搜索节点
  async searchNodes(keyword, nodeType = null) {
    let query = `
      MATCH (n)
      WHERE n.device_name CONTAINS $keyword OR n.port_name CONTAINS $keyword OR n.name CONTAINS $keyword
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
        const nodeLabel = node.properties.device_name || node.properties.port_name || 
                         node.properties.name || node.properties.id;
        return {
          id: node.identity.toString(),
          label: nodeLabel,
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
            const nodeLabel = value.properties.device_name || value.properties.port_name || 
                             value.properties.name || value.properties.id || 'Unknown';
            nodes.set(nodeId, {
              id: nodeId,
              label: nodeLabel,
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