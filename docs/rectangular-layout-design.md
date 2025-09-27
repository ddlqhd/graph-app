# 自定义矩形布局算法设计文档

## 1. 概述

本文档描述了为GraphSQL平台开发的自定义G6矩形布局算法。该算法基于节点的`SubArea`属性将节点聚类成矩形排布，然后以二维数组的形式定义多个矩形的排布关系。

## 2. 需求分析

### 2.1 功能需求
- 创建一种G6自定义矩形布局算法，以配置文件的形式定义具体的布局。
- 算法基于节点的`SubArea`属性将节点聚类成矩形排布（支持将多种`SubArea`聚类到一个矩阵）。
- 以二维数组的形式定义多个矩形的排布关系。
- 支持配置项的灵活定义，允许用户自定义布局参数。

### 2.2 非功能需求
- 算法需具备良好的可扩展性，以支持新的布局类型。
- 算法应具有良好的性能，能在大数据量下保持稳定。
- 代码应具有良好的可维护性。

## 3. 系统架构

### 3.1 技术栈
- G6 4.8.24
- Vue 3 + TypeScript
- Element Plus

### 3.2 架构组件
- 配置文件解析器
- 自定义矩形布局算法实现
- 配置文件注册与管理系统
- 布局应用接口

## 4. 详细设计

### 4.1 配置文件格式

配置文件采用JSON格式定义，包含以下结构：

```json
{
  "layoutType": "rectangular-cluster",
  "layoutParams": {
    "nodeSpacing": 20,
    "clusterSpacing": 50,
    "padding": 30
  },
  "clusters": [
    {
      "id": "cluster1",
      "name": "工程部门",
      "subAreas": ["Development", "Testing", "DevOps"],
      "position": {"row": 0, "col": 0},
      "layout": "grid",
      "layoutParams": {
        "nodeSize": 60
      }
    },
    {
      "id": "cluster2",
      "name": "市场营销",
      "subAreas": ["Digital Marketing", "Content Creation"],
      "position": {"row": 0, "col": 1},
      "layout": "force",
      "layoutParams": {
        "nodeStrength": -30,
        "edgeStrength": 0.1,
        "linkDistance": 100
      }
    },
    {
      "id": "cluster3",
      "name": "销售部门",
      "subAreas": ["Domestic Sales", "International Sales"],
      "position": {"row": 1, "col": 0},
      "layout": "grid",
      "layoutParams": {
        "nodeSize": 60
      }
    }
  ],
  "interClusterConnections": {
    "useOrthogonalEdges": true,
    "minDistance": 30
  }
}
```

#### 4.1.1 配置说明

1. **相对位置关系**：每个cluster的position属性定义了其在二维网格中的相对位置，使用row和col表示行列坐标。
   - 例如：cluster1 position(0,0) 和 cluster2 position(0,1) 表示这两个cluster在最顶层，左右排布
   - cluster3 position(1,0) 表示cluster3在cluster1和cluster2的下方

2. **自适应大小**：每个cluster的大小不再固定，而是根据cluster中节点的数量自适应计算。
   - 系统会根据节点数量和所选布局算法自动计算每个cluster的大小
   - 布局算法（如grid、force等）会根据节点数量动态调整cluster的尺寸

### 4.2 核心算法设计

#### 4.2.1 布局流程
1. 解析配置文件，获取布局参数和集群配置
2. 根据节点的`SubArea`属性对节点进行分组
3. 对每个集群应用指定的布局算法（如grid、force等）
4. 根据集群中节点的数量和所选布局算法，动态计算每个集群的自适应尺寸
5. 根据集群的相对位置配置（二维网格坐标），确定各集群在画布上的绝对位置
6. 更新所有节点的最终位置

#### 4.2.2 关键接口
- `RectangularClusterLayout`：主布局类
- `Cluster`：集群数据结构类
- `LayoutConfig`：布局配置接口

### 4.3 数据结构定义

```ts
interface LayoutConfig {
  layoutType: string;
  layoutParams: {
    nodeSpacing: number;
    clusterSpacing: number;
    padding: number;
  };
  clusters: ClusterConfig[];
  interClusterConnections: {
    useOrthogonalEdges: boolean;
    minDistance: number;
  };
}

interface ClusterConfig {
  id: string;
  name: string;
  subAreas: string[];
  position: { row: number; col: number };  // Relative position in a 2D grid
  layout: string;  // Layout algorithm to use within the cluster (e.g., 'grid', 'force', 'circular')
  layoutParams: any;  // Parameters specific to the chosen layout algorithm
}
```

### 4.4 实现策略

- 创建一个继承自G6布局基类的自定义布局算法
- 使用现有的布局算法（如grid、force等）作为集群内部布局
- 通过配置文件动态定义集群分组和排布

## 5. 实现步骤

### 5.1 配置文件管理
1. 创建配置文件解析器
2. 设计配置文件的存储和获取机制
3. 实现配置文件更新和验证

### 5.2 核心算法实现
1. 实现`RectangularClusterLayout`类
2. 实现节点分组逻辑
3. 实现集群内布局分配
4. 实现集群间位置计算

### 5.3 集成到现有系统
1. 将新布局注册到`layoutRegistry`
2. 更新`LayoutControls`组件，添加新布局选项
3. 测试与现有功能的兼容性

## 6. 测试策略

### 6.1 单元测试
- 测试配置文件解析功能
- 测试节点分组逻辑
- 测试布局位置计算

### 6.2 集成测试
- 测试与G6的集成
- 测试在不同数据集上的表现

### 6.3 性能测试
- 测试在大数据量下的性能表现
- 验证布局算法的时间复杂度

## 7. 扩展性考虑

- 支持多种集群内布局算法
- 支持动态添加/移除集群
- 支持用户自定义子区域分组规则

## 8. 风险与缓解措施

### 8.1 性能风险
- 风险：大数据量下布局计算时间过长
- 缓解：使用优化的算法和数据结构，考虑分步计算

### 8.2 兼容性风险
- 风险：新布局算法与其他功能冲突
- 缓解：充分测试与现有功能的集成

## 9. 预期成果

- 可配置的自定义矩形布局算法
- 灵活的集群分组和布局方式
- 完整的文档和测试用例
- 与现有系统的无缝集成