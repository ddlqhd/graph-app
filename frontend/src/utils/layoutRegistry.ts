// Layout registry for dynamic layout registration
import type { Graph } from '@antv/g6';
import { RectangularClusterLayout } from './RectangularClusterLayout';

export interface LayoutConfig {
  type: string;
  [key: string]: any;
}

export interface LayoutDefinition {
  value: string;
  label: string;
  config: LayoutConfig;
}

class LayoutRegistry {
  private layouts: Map<string, LayoutDefinition> = new Map();

  constructor() {
    // Register default layouts
    this.registerLayout('force', '力导向布局', {
      type: 'force',
      preventOverlap: true,
      nodeStrength: -300,
      linkDistance: 150
    });

    this.registerLayout('dagre', '层次布局', {
      type: 'dagre',
      rankdir: 'TB',
      nodesep: 20,
      ranksep: 50
    });

    this.registerLayout('radial', '辐射布局', {
      type: 'radial',
      center: [400, 300],
      linkDistance: 150,
      maxIteration: 1000
    });

    this.registerLayout('grid', '网格布局', {
      type: 'grid',
      begin: [0, 0],
      preventOverlap: true,
      nodeSize: 50
    });

    // Register the rectangular cluster layout with sample configuration
    this.registerLayout('rectangular-cluster', '矩形集群布局', {
      type: 'rectangular-cluster',
      layoutType: 'rectangular-cluster',
      layoutParams: {
        nodeSpacing: 20,
        clusterSpacing: 50,
        padding: 30
      },
      clusters: [
        {
          id: "cluster1",
          name: "工程部门",
          subAreas: ["Edge", "Storage"],
          position: { row: 0, col: 0 },
          layout: "grid",
          layoutParams: {
            nodeSize: 60
          }
        },
        {
          id: "cluster2",
          name: "市场营销",
          subAreas: ["Access", "Compute"],
          position: { row: 0, col: 1 },
          layout: "force",
          layoutParams: {
            nodeStrength: -30,
            edgeStrength: 0.1,
            linkDistance: 100
          }
        },
        {
          id: "cluster3",
          name: "销售部门",
          subAreas: ["Core"],
          position: { row: 1, col: 0 },
          layout: "grid",
          layoutParams: {
            nodeSize: 60
          }
        }
      ],
      interClusterConnections: {
        useOrthogonalEdges: true,
        minDistance: 30
      }
    });
  }

  // Register a new layout type
  registerLayout(value: string, label: string, config: LayoutConfig): void {
    this.layouts.set(value, { value, label, config });
  }

  // Unregister a layout type
  unregisterLayout(value: string): void {
    this.layouts.delete(value);
  }

  // Get a specific layout definition
  getLayout(value: string): LayoutDefinition | undefined {
    return this.layouts.get(value);
  }

  // Get all registered layouts
  getAllLayouts(): LayoutDefinition[] {
    return Array.from(this.layouts.values());
  }

  // Apply a layout to a graph instance
  applyLayout(graph: Graph, layoutType: string, graphData?: { nodes: Array<{ id: string }> }): void {
    const layout = this.getLayout(layoutType);
    if (!layout || !graph) return;

    let layoutConfig = { ...layout.config };

    // Special handling for radial layout which needs a focus node
    if (layoutType === 'radial' && graphData?.nodes && graphData.nodes.length > 0) {
      layoutConfig.focusNode = graphData.nodes[0]?.id;
    }

    graph.updateLayout(layoutConfig);
  }
}

// Create a singleton instance
export const layoutRegistry = new LayoutRegistry();

// Export the class as well for potential direct instantiation
export { LayoutRegistry };