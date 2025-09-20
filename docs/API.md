# GraphSQL API 文档

## 概述

GraphSQL 后端提供了一套完整的 RESTful API，用于图数据的查询和可视化。所有 API 端点都返回统一的 JSON 格式响应。

## 基础信息

- **Base URL**: `http://localhost:3000`
- **Content-Type**: `application/json`
- **Response Format**: 统一的 JSON 响应格式

## 响应格式

所有 API 响应都遵循以下格式：

```json
{
  "success": boolean,
  "data": any,
  "message": string
}
```

## API 端点

### 1. 健康检查

检查服务和数据库连接状态。

**GET** `/api/graph/health`

**响应示例:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  "message": "服务运行正常"
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
  "success": true,
  "data": {
    "nodes": [
      {
        "id": "1",
        "label": "张总",
        "type": "Person",
        "properties": {
          "name": "张总",
          "title": "CEO",
          "department": "总裁办",
          "level": 1
        },
        "color": "#FF6B6B",
        "size": 40
      }
    ],
    "edges": [
      {
        "id": "1",
        "source": "1",
        "target": "2",
        "label": "MANAGES",
        "type": "MANAGES",
        "properties": {},
        "color": "#E74C3C",
        "style": {
          "lineWidth": 3,
          "lineDash": [0]
        }
      }
    ]
  },
  "message": "图数据获取成功"
}
```

### 3. 获取图统计信息

获取图的统计信息，包括节点数、边数和类型分布。

**GET** `/api/graph/stats`

**响应示例:**
```json
{
  "success": true,
  "data": {
    "totalNodes": 20,
    "totalEdges": 25,
    "nodeTypes": [
      {"type": "Person", "count": 15},
      {"type": "Department", "count": 4},
      {"type": "Project", "count": 3},
      {"type": "Skill", "count": 7}
    ],
    "edgeTypes": [
      {"type": "MANAGES", "count": 10},
      {"type": "WORKS_IN", "count": 15},
      {"type": "PARTICIPATES_IN", "count": 8},
      {"type": "HAS_SKILL", "count": 12}
    ]
  },
  "message": "图统计信息获取成功"
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
{
  "success": true,
  "data": [
    {
      "id": "1",
      "label": "张总",
      "type": "Person",
      "properties": {
        "name": "张总",
        "title": "CEO"
      },
      "color": "#FF6B6B",
      "size": 40
    }
  ],
  "message": "搜索到 1 个相关节点"
}
```

### 5. 获取部门子图

获取特定部门的子图数据。

**GET** `/api/graph/department/:departmentName`

**路径参数:**
- `departmentName`: 部门名称

**响应示例:**
```json
{
  "success": true,
  "data": {
    "nodes": [...],
    "edges": [...]
  },
  "message": "技术部 部门图数据获取成功"
}
```

### 6. 获取项目图

获取特定项目的相关图数据。

**GET** `/api/graph/project/:projectId`

**路径参数:**
- `projectId`: 项目ID

**响应示例:**
```json
{
  "success": true,
  "data": {
    "nodes": [...],
    "edges": [...]
  },
  "message": "项目 web_project 图数据获取成功"
}
```

### 7. 获取节点详情

获取节点的详细信息和相邻节点。

**GET** `/api/graph/node/:nodeId`

**路径参数:**
- `nodeId`: 节点ID

**响应示例:**
```json
{
  "success": true,
  "data": {
    "nodes": [...],
    "edges": [...]
  },
  "message": "节点详情获取成功"
}
```

## 错误处理

当 API 请求失败时，将返回错误响应：

```json
{
  "success": false,
  "data": null,
  "message": "错误描述信息"
}
```

**常见错误状态码:**
- `400`: 请求参数错误
- `404`: 资源不存在
- `500`: 服务器内部错误
- `503`: 数据库连接失败

## 数据模型

### 节点类型

1. **Person (人员)**
   - `name`: 姓名
   - `title`: 职位
   - `department`: 部门
   - `level`: 级别

2. **Department (部门)**
   - `name`: 部门名称
   - `description`: 部门描述

3. **Project (项目)**
   - `name`: 项目名称
   - `status`: 项目状态
   - `description`: 项目描述

4. **Skill (技能)**
   - `name`: 技能名称
   - `category`: 技能分类
   - `level`: 技能等级

### 关系类型

1. **MANAGES**: 管理关系
2. **WORKS_IN**: 工作关系
3. **PARTICIPATES_IN**: 项目参与关系
4. **HAS_SKILL**: 技能拥有关系
5. **COLLABORATES_WITH**: 协作关系
6. **OVERSEES**: 监督关系

## 使用示例

### 使用 curl 获取图数据

```bash
curl -X GET "http://localhost:3000/api/graph/data?limit=50" \
  -H "Content-Type: application/json"
```

### 使用 JavaScript fetch 搜索节点

```javascript
const response = await fetch('/api/graph/search?keyword=张&type=Person');
const result = await response.json();
console.log(result.data);
```

### 使用 axios 获取部门数据

```javascript
import axios from 'axios';

const response = await axios.get('/api/graph/department/技术部');
console.log(response.data);
```