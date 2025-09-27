# GraphSQL API 文档

## 概述

GraphSQL 后端提供了一套完整的 RESTful API，用于图数据的查询和可视化。

## 基础信息

- **Base URL**: `http://localhost:3000`
- **Content-Type**: `application/json`


## API 端点

### 1. 健康检查

检查服务和数据库连接状态。

**GET** `/api/graph/health`

**响应示例:**
```json
{
  "status": "OK",
  "message": "GraphSQL 服务运行正常"
}
```

### 2. 获取图数据

获取完整的图数据，包括节点和边。

**GET** `/api/graph/data`

**查询参数:**
- `limit` (可选): 限制返回的节点数量，默认为 100

**响应示例:**
```json
{
  "nodes": [
    {
      "id": "device_A",
      "label": "设备A",
      "type": "Device",
      "properties": {
        "device_name": "设备A",
        "subarea": "区域1",
        "dc": "DC1",
        "manage_ip": "192.168.1.1"
      }
    },
    {
      "id": "port_X",
      "label": "端口X",
      "type": "Port",
      "properties": {
        "port_name": "GigabitEthernet0/1"
      }
    }
  ],
  "edges": [
    {
      "id": "rel_1",
      "source": "device_A",
      "target": "port_X",
      "label": "HAS_PORT",
      "type": "HAS_PORT",
      "properties": {}
    },
    {
      "id": "rel_2",
      "source": "port_X",
      "target": "port_Y",
      "label": "CONNECTS_TO",
      "type": "CONNECTS_TO",
      "properties": {}
    }
  ]
}
```

### 3. 获取图统计信息

获取图的统计信息，包括节点数、边数和类型分布。

**GET** `/api/graph/stats`

**响应示例:**
```json
{
  "totalNodes": 20,
  "totalEdges": 25,
  "nodeTypes": [
    {"type": "Device", "count": 10},
    {"type": "Port", "count": 10}
  ],
  "edgeTypes": [
    {"type": "HAS_PORT", "count": 10},
    {"type": "CONNECTS_TO", "count": 5}
  ]
}
```

### 4. 搜索节点

根据关键词搜索节点。

**GET** `/api/graph/search`

**查询参数:**
- `keyword` (必需): 搜索关键词
- `type` (可选): 节点类型过滤

**响应示例:**
```json
[
  {
    "id": "device_A",
    "label": "设备A",
    "type": "Device",
    "properties": {
      "device_name": "设备A",
      "subarea": "区域1",
      "dc": "DC1",
      "manage_ip": "192.168.1.1"
    }
  }
]
```

```

```

### 5. 获取数据中心子图

获取特定数据中心的子图数据。

**GET** `/api/graph/datacenter/:dcName`

**路径参数:**
- `dcName`: 数据中心名称

**响应示例:**
```json
{
  "nodes": [
    {
      "id": "device_A",
      "label": "设备A",
      "type": "Device",
      "properties": {
        "device_name": "设备A",
        "subarea": "区域1",
        "dc": "DC1",
        "manage_ip": "192.168.1.1"
      }
    },
    {
      "id": "port_X",
      "label": "端口X",
      "type": "Port",
      "properties": {
        "port_name": "GigabitEthernet0/1"
      }
    }
  ],
  "edges": [
    {
      "id": "rel_1",
      "source": "device_A",
      "target": "port_X",
      "label": "HAS_PORT",
      "type": "HAS_PORT",
      "properties": {}
    }
  ]
}
```

### 6. 获取设备图

获取特定设备的图数据。

**GET** `/api/graph/device/:deviceName`

**路径参数:**
- `deviceName`: 设备名称

**响应示例:**
```json
{
  "nodes": [
    {
      "id": "device_A",
      "label": "设备A",
      "type": "Device",
      "properties": {
        "device_name": "设备A",
        "subarea": "区域1",
        "dc": "DC1",
        "manage_ip": "192.168.1.1"
      }
    },
    {
      "id": "port_X",
      "label": "端口X",
      "type": "Port",
      "properties": {
        "port_name": "GigabitEthernet0/1"
      }
    }
  ],
  "edges": [
    {
      "id": "rel_1",
      "source": "device_A",
      "target": "port_X",
      "label": "HAS_PORT",
      "type": "HAS_PORT",
      "properties": {}
    }
  ]
}
```

### 7. 路径查询

查询两个节点之间的路径。

**GET** `/api/graph/path`

**查询参数:**
- `source` (必需): 源节点ID
- `target` (必需): 目标节点ID

**响应示例:**
```json
{
  "nodes": [
    {
      "id": "nodeA",
      "label": "节点A",
      "type": "TypeA"
    },
    {
      "id": "nodeB",
      "label": "节点B",
      "type": "TypeB"
    }
  ],
  "edges": [
    {
      "id": "edge1",
      "source": "nodeA",
      "target": "nodeB",
      "label": "RELATES_TO"
    }
  ]
}
```

### 8. 获取节点详情

获取节点的详细信息和相邻节点。

**GET** `/api/graph/node/:nodeId`

**路径参数:**
- `nodeId`: 节点ID

**响应示例:**
```json
{
  "nodes": [
    {
      "id": "device_A",
      "label": "设备A",
      "type": "Device",
      "properties": {
        "device_name": "设备A",
        "subarea": "区域1",
        "dc": "DC1",
        "manage_ip": "192.168.1.1"
      }
    },
    {
      "id": "port_X",
      "label": "端口X",
      "type": "Port",
      "properties": {
        "port_name": "GigabitEthernet0/1"
      }
    }
  ],
  "edges": [
    {
      "id": "rel_1",
      "source": "device_A",
      "target": "port_X",
      "label": "HAS_PORT",
      "type": "HAS_PORT",
      "properties": {}
    }
  ]
}
```

## 错误处理

当 API 请求失败时，将返回错误响应，通常包含一个 `error` 字段或 `status` 字段：

```json
{
  "error": "错误描述信息"
}
```

或对于健康检查：

```json
{
  "status": "ERROR",
  "message": "服务异常"
}
```

**常见错误状态码:**
- `400`: 请求参数错误
- `404`: 资源不存在
- `500`: 服务器内部错误

## 数据模型

### 节点类型

1.  **Device (设备)**
    *   `device_name`: 设备名称 (String)
    *   `subarea`: 子区域 (String)
    *   `dc`: 数据中心 (String)
    *   `manage_ip`: 管理 IP (String)

2.  **Port (端口)**
    *   `port_name`: 端口名称 (String)

### 关系类型

1.  **HAS_PORT**: 设备拥有端口 (`Device` -> `Port`)
2.  **CONNECTS_TO**: 端口之间连接 (`Port` <-> `Port`)


## 使用示例

### 使用 curl 获取图数据

```bash
curl -X GET "http://localhost:3000/api/graph/data?limit=50" \
  -H "Content-Type: application/json"
```

### 使用 JavaScript fetch 搜索节点

```javascript
const response = await fetch('/api/graph/search?keyword=设备A&type=Device');
const result = await response.json();
console.log(result.data);
```

### 使用 axios 获取数据中心数据

```javascript
import axios from 'axios';

const response = await axios.get('/api/graph/datacenter/DC1');
console.log(response.data);
```