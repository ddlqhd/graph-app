<template>
  <div class="test-view">
    <h1>G6 测试页面</h1>
    <div ref="graphContainer" id="test-graph" style="width: 800px; height: 600px; border: 1px solid #ccc;"></div>
    <div class="test-info">
      <h3>测试结果:</h3>
      <pre>{{ testResults }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as G6 from '@antv/g6'

const graphContainer = ref<HTMLDivElement>()
const testResults = ref('')

const addResult = (message: string) => {
  testResults.value += message + '\n'
  console.log(message)
}

onMounted(async () => {
  addResult('开始G6测试...')

  try {
    const g6Version = (G6 as any).version || ''

    addResult(`G6对象: ${typeof G6}`)
    addResult(`G6.Graph: ${typeof G6.Graph}`)
    addResult(`G6版本: ${g6Version}`)
    addResult(`G6版本检测完成`)

    if (typeof G6.Graph !== 'function') {
      addResult('❌ G6.Graph不是构造函数')
      return
    }

    if (!graphContainer.value) {
      addResult('❌ 容器元素不存在')
      return
    }

    addResult('创建Graph实例...')
    const graph = new G6.Graph({
      container: graphContainer.value,
      width: 800,
      height: 600,
      modes: {
        default: ['drag-canvas', 'zoom-canvas']
      }
    })

    addResult('✅ Graph实例创建成功')
    addResult(`data方法: ${typeof graph.data}`)
    addResult(`setData方法: ${typeof (graph as any).setData}`)
    addResult(`render方法: ${typeof graph.render}`)

    // 最简化测试数据
    const simpleData = {
      nodes: [
        { id: 'node1', label: '节点1' },
        { id: 'node2', label: '节点2' }
      ],
      edges: [
        { source: 'node1', target: 'node2' }
      ]
    }

    addResult('尝试加载最简化数据...')

    if (typeof graph.data === 'function') {
      addResult('使用G6 4.x data方法')
      graph.data(simpleData)
      graph.render()
      addResult('✅ 简化数据加载成功')
    } else {
      addResult('❌ G6 4.x data方法不可用')
    }

    // 验证渲染结果
    setTimeout(() => {
      const svg = graphContainer.value?.querySelector('svg')
      addResult(`SVG元素: ${!!svg}`)
      if (svg) {
        const elements = svg.querySelectorAll('*')
        addResult(`SVG子元素数量: ${elements.length}`)
      }
    }, 1000)

  } catch (error) {
    addResult(`❌ 错误: ${error.message}`)
    console.error('G6测试错误:', error)
  }
})
</script>

<style scoped>
.test-view {
  padding: 20px;
}

.test-info {
  margin-top: 20px;
}

pre {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
}
</style>