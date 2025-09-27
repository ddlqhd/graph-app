<template>
  <div class="graph-legend">
    <div class="legend-title">图例</div>
    <div class="legend-items">
      <!-- Node legends -->
      <div
        v-for="nodeType in nodeTypes"
        :key="`node-${nodeType}`"
        class="legend-item"
      >
        <div
          class="legend-color"
          :style="{ backgroundColor: getNodeColor(nodeType) }"
        ></div>
        <span class="legend-label">
          {{ nodeType }} ({{ nodeCounts[nodeType] || 0 }})
        </span>
      </div>
      
      <!-- Edge legends -->
      <div
        v-for="edgeType in edgeTypes"
        :key="`edge-${edgeType}`"
        class="legend-item"
      >
        <div class="legend-line" 
             :style="{ backgroundColor: getEdgeColor(edgeType) }">
        </div>
        <span class="legend-label">
          {{ edgeType }} ({{ edgeCounts[edgeType] || 0 }})
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GraphNode, GraphEdge, GraphData } from '@/services/graphService'

// Define the props interface
interface Props {
  graphData: GraphData
}

// Define the props
const props = defineProps<Props>()

// Define the emitted events interface
interface Emits {
  // Add any events that need to be emitted
}

// Define emits
const emit = defineEmits<Emits>()

// Define type color mappings
const nodeTypeColors: Record<string, string> = {
  'Device': '#3498DB',
  'Port': '#E74C3C'
}

const edgeTypeColors: Record<string, string> = {
  'default': '#BDC3C7'  // Default color for edges
}

// Function to get node color
const getNodeColor = (nodeType: string) => {
  return nodeTypeColors[nodeType] || '#95A5A6'
}

// Function to get edge color
const getEdgeColor = (edgeType: string) => {
  return edgeTypeColors[edgeType] || '#BDC3C7'
}

// Get unique node types from current graph data
const nodeTypes = computed(() => {
  if (!props.graphData || !props.graphData.nodes) {
    return []
  }
  
  const types = new Set<string>()
  props.graphData.nodes.forEach((node: GraphNode) => {
    types.add(node.type)
  })
  
  return Array.from(types)
})

// Get unique edge types from current graph data
const edgeTypes = computed(() => {
  if (!props.graphData || !props.graphData.edges) {
    return []
  }
  
  const types = new Set<string>()
  props.graphData.edges.forEach((edge: GraphEdge) => {
    // Using the edge label as the type, or default if not available
    const type = edge.label || 'Relationship'
    types.add(type)
  })
  
  return Array.from(types)
})

// Count nodes of each type
const nodeCounts = computed(() => {
  const counts: Record<string, number> = {}
  
  if (props.graphData && props.graphData.nodes) {
    props.graphData.nodes.forEach((node: GraphNode) => {
      counts[node.type] = (counts[node.type] || 0) + 1
    })
  }
  
  return counts
})

// Count edges of each type
const edgeCounts = computed(() => {
  const counts: Record<string, number> = {}
  
  if (props.graphData && props.graphData.edges) {
    props.graphData.edges.forEach((edge: GraphEdge) => {
      const type = edge.label || 'Relationship'
      counts[type] = (counts[type] || 0) + 1
    })
  }
  
  return counts
})
</script>

<style scoped>
.graph-legend {
  position: absolute;
  bottom: var(--space-3);
  right: var(--space-3);
  background: var(--color-bg-default);
  padding: var(--space-3);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-medium);
  border: 1px solid var(--color-border-default);
  min-width: 120px;
  transition: all 0.2s cubic-bezier(0.3, 0, 0.5, 1);
}

.graph-legend:hover {
  box-shadow: var(--shadow-large);
  border-color: var(--color-border-muted);
}

.legend-title {
  font-weight: 600;
  margin-bottom: var(--space-2);
  font-size: 14px;
  color: var(--color-fg-default);
  line-height: 20px;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 2px 0;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid var(--color-border-default);
}

.legend-line {
  width: 20px;
  height: 2px;
  background-color: var(--color-fg-default);
  margin-top: 6px;
}

.legend-label {
  font-size: 12px;
  color: var(--color-fg-muted);
  font-weight: 400;
  line-height: 18px;
}
</style>