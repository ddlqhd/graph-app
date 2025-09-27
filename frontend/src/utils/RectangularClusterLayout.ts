import G6 from '@antv/g6';
import cloneDeep from 'lodash/cloneDeep';

// Define TypeScript interfaces based on the design document
export interface LayoutConfig {
  layoutType: string;
  layoutParams: {
    nodeSpacing: number;
    clusterSpacing: number;
    padding: number;
    width?: number;
    height?: number;
  };
  clusters: ClusterConfig[];
  interClusterConnections: {
    useOrthogonalEdges: boolean;
    minDistance: number;
  };
}

export interface ClusterConfig {
  id: string;
  name: string;
  subAreas: string[];
  position: { row: number; col: number };  // Relative position in a 2D grid
  layout: string;  // Layout algorithm to use within the cluster (e.g., 'grid', 'force', 'circular')
  layoutParams: any;  // Parameters specific to the chosen layout algorithm
}

// Define the RectangularClusterLayout class that implements G6's layout interface
export class RectangularClusterLayout {
  public nodes: any[];
  public edges: any[];
  public width: number;
  public height: number;
  private config: LayoutConfig;

  constructor(config: LayoutConfig) {
    this.config = config || {
      layoutParams: {
        nodeSpacing: 20,
        clusterSpacing: 50,
        padding: 30
      },
      clusters: [],
      interClusterConnections: {
        useOrthogonalEdges: false,
        minDistance: 30
      }
    };
    this.nodes = [];
    this.edges = [];
    this.width = 500;
    this.height = 500;
  }

  public init(data: any) {
    this.nodes = data.nodes || [];
    this.edges = data.edges || [];

    // Update width and height from config if available
    if (this.config.layoutParams?.width) this.width = this.config.layoutParams.width;
    if (this.config.layoutParams?.height) this.height = this.config.layoutParams.height;
  }

  public execute() {
    // Step 1: Group nodes by their SubArea property
    const clusters = this.groupNodesBySubArea(this.config.clusters);
    console.log("groupNodesBySubArea", clusters);

    // Step 2: Apply internal layout to each cluster
    const positionedClusters = this.positionClusters(clusters);

    // Step 3: Position clusters relative to each other based on their grid positions
    this.calculateFinalPositions(positionedClusters);

    return {
      nodes: this.nodes,
      edges: this.edges
    };
  }

  // This is called when the layout is updated
  public updateCfg(cfg: any) {
    this.config = { ...this.config, ...cfg };
    if (cfg.width) this.width = cfg.width;
    if (cfg.height) this.height = cfg.height;
  }

  public layout(data: any) {
    this.init(data);
    return this.execute();
  }

  // Group nodes by their SubArea property
  private groupNodesBySubArea(clusterConfigs: ClusterConfig[]): any[] {
    // Create a mapping from SubArea values to cluster IDs
    const subAreaToClusterMap = new Map<string, string>();
    clusterConfigs.forEach(cluster => {
      cluster.subAreas.forEach(subArea => {
        subAreaToClusterMap.set(subArea, cluster.id);
      });
    });

    // Group nodes by their cluster
    const clusterNodeMap = new Map<string, any[]>();

    this.nodes?.forEach(node => {
      console.log("node", node)
      // Get the SubArea property from the node
      // Check if node has a properties attribute first
      let subArea = 'default';

      if (node.properties) {
        // If properties exist, check for SubArea in various forms
        subArea = node.properties?.SubArea ||
                  node.properties?.subarea ||
                  node.properties?.subArea ||
                  'default';
      } else {
        // If no properties attribute, try to find SubArea as a direct property
        subArea = node.SubArea ||
                  node.subarea ||
                  node.subArea ||
                  'default';
      }
      console.log("subArea", subArea)
      const clusterId = subAreaToClusterMap.get(subArea) || 'default';
      console.log("clusterId", clusterId)

      if (!clusterNodeMap.has(clusterId)) {
        clusterNodeMap.set(clusterId, []);
      }

      clusterNodeMap.get(clusterId)?.push(node);
    });
    const clusters: any[] = [];
    // Create cluster objects with their configurations
    clusterConfigs.forEach(clusterConfig => {
      const nodes = clusterNodeMap.get(clusterConfig.id) || [];
      const nodesCopy = nodes.map(node => JSON.parse(JSON.stringify(node)));
      console.log("nodesCopy", nodesCopy);
      const temp = {
        config: clusterConfig,
        nodes: nodesCopy,
        bounds: null // Will be calculated during layout
      };
      console.log("temp", temp);
      clusters.push(temp);
    });

    console.log("return clusters", clusters)
    return clusters;
  }

  // Position nodes within each cluster according to the specified layout algorithm
  private positionClusters(clusters: any[]) {
    return clusters.map(cluster => {
      if (cluster.nodes.length === 0) {
        return cluster;
      }

      const { config } = cluster;

      // For internal cluster layout, we'll create a temporary G6 graph instance
      // and apply the layout configuration to it
      try {
        // Use G6's built-in layout execution
        const layoutConfig = this.createLayoutInstance(config.layout, config.layoutParams);

        // Create a temporary DOM container for the graph
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.visibility = 'hidden';
        tempContainer.style.width = '500px';
        tempContainer.style.height = '500px';
        document.body.appendChild(tempContainer);

        // Create a temporary graph instance to execute the layout
        const tempGraph = new G6.Graph({
          container: tempContainer,
          width: 500,
          height: 500,
          layout: layoutConfig,
          animate: false,
          // Don't render the graph, just use it for layout calculations
          plugins: [],
        });

        // Add the cluster's nodes to the temporary graph
        const subgraphData = {
          nodes: [...cluster.nodes],
          edges: [] // We'll handle edges later
        };

        // Apply the data to the temporary graph
        tempGraph.data(subgraphData);

        // Execute the layout
        tempGraph.layout();

        // Get the updated data with positions
        const updatedNodes = tempGraph.getNodes().map(node => node.getModel());

        // Calculate cluster bounds based on laid-out nodes
        const bounds = this.calculateBounds(updatedNodes);

        // Update the node positions in the original cluster data
        cluster.nodes = updatedNodes;
        cluster.bounds = bounds;

        // Clean up the temporary graph and container
        tempGraph.destroy();
        document.body.removeChild(tempContainer);
      } catch (error) {
        console.error(`Error applying layout for cluster ${config.id}:`, error);
        // If there's an error in the layout, use original positions
        cluster.bounds = this.calculateBounds(cluster.nodes);
      }

      return cluster;
    });
  }

  // Create an instance of the specified layout algorithm
  private createLayoutInstance(layoutType: string, layoutParams: any) {
    // Create the layout configuration object to be used with G6's built-in layouts
    // The actual layout execution will be handled by G6's layout system
    switch (layoutType) {
      case 'grid':
        return {
          type: layoutType,
          ...layoutParams
        };
      case 'force':
        return {
          type: layoutType,
          ...layoutParams
        };
      case 'circular':
        return {
          type: layoutType,
          ...layoutParams
        };
      case 'radial':
        return {
          type: layoutType,
          ...layoutParams
        };
      case 'dagre':
        return {
          type: layoutType,
          ...layoutParams
        };
      default:
        console.warn(`Unsupported layout type: ${layoutType}. Using force layout as fallback.`);
        return {
          type: 'force',
          preventOverlap: true,
          nodeStrength: -30,
          edgeStrength: 0.1,
          linkDistance: 100,
          ...layoutParams
        };
    }
  }

  // Calculate bounds for a set of nodes
  private calculateBounds(nodes: any[]) {
    if (!nodes || nodes.length === 0) {
      return { minX: 0, minY: 0, maxX: 100, maxY: 100 };
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    nodes.forEach(node => {
      if (node.x !== undefined && node.y !== undefined) {
        minX = Math.min(minX, node.x);
        minY = Math.min(minY, node.y);
        maxX = Math.max(maxX, node.x);
        maxY = Math.max(maxY, node.y);
      }
    });

    // Add padding if nodes have no initial position
    if (minX === Infinity) {
      minX = 0; minY = 0; maxX = 100; maxY = 100;
    }

    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  // Calculate the final positions for clusters based on their grid positions
  private calculateFinalPositions(clusters: any[]) {
    // Find the grid dimensions
    let maxRow = -1, maxCol = -1;
    clusters.forEach(cluster => {
      const { row, col } = cluster.config.position;
      maxRow = Math.max(maxRow, row);
      maxCol = Math.max(maxCol, col);
    });

    if (maxRow === -1 || maxCol === -1) {
      // No clusters defined, return early
      return;
    }

    // Calculate available space after accounting for cluster spacing and padding
    const totalClusterSpacingX = this.config.layoutParams.clusterSpacing * maxCol;
    const totalClusterSpacingY = this.config.layoutParams.clusterSpacing * maxRow;
    const availableWidth = this.width - (2 * this.config.layoutParams.padding) - totalClusterSpacingX;
    const availableHeight = this.height - (2 * this.config.layoutParams.padding) - totalClusterSpacingY;

    // Determine the required width and height for each grid cell based on cluster sizes
    const cellWidth = availableWidth / (maxCol + 1);
    const cellHeight = availableHeight / (maxRow + 1);

    // Position each cluster in its grid cell
    clusters.forEach(cluster => {
      const { row, col } = cluster.config.position;

      // Calculate the top-left position of the cell for this cluster
      const cellX = this.config.layoutParams.padding + (col * (cellWidth + this.config.layoutParams.clusterSpacing));
      const cellY = this.config.layoutParams.padding + (row * (cellHeight + this.config.layoutParams.clusterSpacing));

      // Calculate the offset needed to center the cluster in its cell
      const clusterWidth = cluster.bounds ? cluster.bounds.width : 100;
      const clusterHeight = cluster.bounds ? cluster.bounds.height : 100;

      const offsetX = cellX + (cellWidth - clusterWidth) / 2;
      const offsetY = cellY + (cellHeight - clusterHeight) / 2;

      // Adjust all nodes in the cluster by the offset
      cluster.nodes = cluster.nodes.map((node: any) => {
        const updatedNode = {
          ...node,
          x: (node.x || 0) + offsetX,
          y: (node.y || 0) + offsetY
        };

        // Update the main nodes array with the new position
        const nodeIndex = this.nodes.findIndex(n => n.id === node.id);
        if (nodeIndex !== -1) {
          this.nodes[nodeIndex] = updatedNode;
        }

        return updatedNode;
      });
    });
  }

  // This destroy function is required for G6 layouts
  public destroy() {
    this.nodes = null;
    this.edges = null;
    this.config = null;
  }
}

// Register the layout with G6
G6.registerLayout('rectangular-cluster', RectangularClusterLayout);