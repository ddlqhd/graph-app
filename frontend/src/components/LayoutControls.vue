<template>
  <el-select
    v-model="currentLayout"
    placeholder="选择布局"
    @change="changeLayout"
    style="width: 150px;"
  >
    <el-option
      v-for="layout in availableLayouts"
      :key="layout.value"
      :label="layout.label"
      :value="layout.value"
    />
  </el-select>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Graph } from '@antv/g6'
import { layoutRegistry } from '@/utils/layoutRegistry'

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

// Computed property to get available layouts from registry
const availableLayouts = computed(() => layoutRegistry.getAllLayouts())

// Register new layout types dynamically
const registerLayout = (value: string, label: string, config: any) => {
  layoutRegistry.registerLayout(value, label, config);
}

// Unregister a layout type
const unregisterLayout = (value: string) => {
  layoutRegistry.unregisterLayout(value);
}

// Change layout
const changeLayout = (layoutType: string) => {
  if (!props.graph) return

  currentLayout.value = layoutType
  emit('layoutChanged', layoutType)

  // Use the layout registry to apply the layout
  layoutRegistry.applyLayout(props.graph, layoutType, props.graphData);
}

// Watch for graph changes and reset to force layout if graph changes
watch(() => props.graph, (newGraph) => {
  if (newGraph) {
    // Optionally reset to default layout when new graph is provided
    currentLayout.value = 'force'
  }
})

// Expose registration functions for dynamic layouts
defineExpose({
  registerLayout,
  unregisterLayout
})
</script>

<style scoped>
/* Layout controls style will inherit from parent */
</style>