<template>
  <el-button-group>
    <el-tooltip content="力导向布局">
      <el-button
        @click="changeLayout('force')"
        :type="currentLayout === 'force' ? 'primary' : 'default'"
      >
        力导向
      </el-button>
    </el-tooltip>
    <el-tooltip content="层次布局">
      <el-button
        @click="changeLayout('dagre')"
        :type="currentLayout === 'dagre' ? 'primary' : 'default'"
      >
        层次
      </el-button>
    </el-tooltip>
    <el-tooltip content="辐射布局">
      <el-button
        @click="changeLayout('radial')"
        :type="currentLayout === 'radial' ? 'primary' : 'default'"
      >
        辐射
      </el-button>
    </el-tooltip>
    <el-tooltip content="网格布局">
      <el-button
        @click="changeLayout('grid')"
        :type="currentLayout === 'grid' ? 'primary' : 'default'"
      >
        网格
      </el-button>
    </el-tooltip>
  </el-button-group>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Graph } from '@antv/g6'

// Define props interface
interface Props {
  graph: Graph | null
  graphData: {
    nodes: Array<{ id: string, [key: string]: any }>,
    edges: Array<{ id: string, [key: string]: any }>
  }
}

// Define emitted events interface
interface Emits {
  (e: 'layoutChanged', layoutType: string): void
}

// Props and emits
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const currentLayout = ref('force')

// Change layout
const changeLayout = (layoutType: string) => {
  if (!props.graph) return

  currentLayout.value = layoutType
  emit('layoutChanged', layoutType)

  const layoutConfig: Record<string, any> = {
    force: {
      type: 'force',
      preventOverlap: true,
      nodeStrength: -300,
      linkDistance: 150
    },
    dagre: {
      type: 'dagre',
      rankdir: 'TB',
      nodesep: 20,
      ranksep: 50
    },
    radial: {
      type: 'radial',
      center: [400, 300],
      linkDistance: 150,
      maxIteration: 1000,
      focusNode: props.graphData.nodes[0]?.id
    },
    grid: {
      type: 'grid',
      begin: [0, 0],
      preventOverlap: true,
      nodeSize: 50
    }
  }

  // Update layout with new config
  props.graph.updateLayout(layoutConfig[layoutType])
}

// Watch for graph changes and reset to force layout if graph changes
watch(() => props.graph, (newGraph) => {
  if (newGraph) {
    // Optionally reset to default layout when new graph is provided
    currentLayout.value = 'force'
  }
})
</script>

<style scoped>
/* Layout controls style will inherit from parent */
</style>