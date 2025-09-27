<template>
  <div class="network-path-query">
    <div class="path-query-section">
      <div class="section-title">
        <h3>网络路径查询</h3>
      </div>
      
      <div class="path-inputs">
        <el-input
          v-model="sourceIP"
          placeholder="请输入源节点IP"
          clearable
          class="source-input"
        />
        <el-input
          v-model="targetIP"
          placeholder="请输入目标节点IP"
          clearable
          class="target-input"
        />
      </div>
      
      <div class="query-actions">
        <el-button 
          type="primary" 
          @click="queryPath"
          :disabled="!sourceIP || !targetIP || loading"
          :loading="loading"
          class="query-button"
        >
          查询路径
        </el-button>
        <el-button 
          @click="clearPath"
          class="clear-button"
        >
          清除结果
        </el-button>
      </div>
      
      <div v-if="queryError" class="error-message">
        <el-alert
          :title="queryError"
          type="error"
          show-icon
          :closable="false"
        />
      </div>
      
      <div v-if="pathFound && pathResult" class="result-info">
        <el-alert
          title="路径查询成功"
          type="success"
          show-icon
          :closable="false"
        >
          <template #default>
            <p>从 <strong>{{ sourceIP }}</strong> 到 <strong>{{ targetIP }}</strong> 的路径已找到</p>
            <p>路径长度: {{ pathResult.nodes.length }}</p>
          </template>
        </el-alert>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { graphAPI, type GraphData } from '@/services/graphService';
import { useGraphStore } from '@/stores/graph';

// Store
const graphStore = useGraphStore();

// 获取 GraphViewer 引用
const graphViewer = inject<any>('graphViewer');

// 响应式数据
const sourceIP = ref('');
const targetIP = ref('');
const loading = ref(false);
const queryError = ref('');
const pathFound = ref(false);
const pathResult = ref<GraphData | null>(null);

// 查询路径
const queryPath = async () => {
  if (!sourceIP.value.trim() || !targetIP.value.trim()) {
    ElMessage.warning('请输入源节点IP和目标节点IP');
    return;
  }

  loading.value = true;
  queryError.value = '';
  pathFound.value = false;
  pathResult.value = null;

  try {
    const result = await graphAPI.findPath(sourceIP.value.trim(), targetIP.value.trim());

    if (result && result.nodes && result.nodes.length > 0) {
      pathFound.value = true;
      pathResult.value = result;

      // 1. 不再刷新图，直接在当前图上高亮简化路径
      if (graphViewer && graphViewer.value && graphViewer.value.highlightSimplifiedPath) {
        graphViewer.value.highlightSimplifiedPath(result);
      } else {
        console.warn('GraphViewer 或 highlightSimplifiedPath 方法不可用');
      }
      
      ElMessage.success('路径查询成功');
    } else {
      queryError.value = '未找到从 ' + sourceIP.value + ' 到 ' + targetIP.value + ' 的路径';
      // 如果之前有高亮，则清除
      if (graphViewer && graphViewer.value && graphViewer.value.clearPathHighlight) {
        graphViewer.value.clearPathHighlight();
      }
    }
  } catch (error: any) {
    console.error('路径查询失败:', error);
    queryError.value = error.message || '路径查询失败，请稍后重试';
    ElMessage.error('路径查询失败');
  } finally {
    loading.value = false;
  }
};

// 清除路径高亮
const clearPath = () => {
  if (graphViewer && graphViewer.value && graphViewer.value.clearPathHighlight) {
    graphViewer.value.clearPathHighlight();
  }

  sourceIP.value = '';
  targetIP.value = '';
  queryError.value = '';
  pathFound.value = false;
  pathResult.value = null;
  ElMessage.info('已清除路径高亮');
};

</script>

<style scoped>
.network-path-query {
  margin-bottom: var(--space-4);
  padding: var(--space-3);
  background: var(--color-bg-subtle);
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border-default);
}

.section-title {
  margin-bottom: var(--space-3);
}

.section-title h3 {
  color: var(--color-fg-default);
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  line-height: 20px;
}

.path-inputs {
  margin-bottom: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.source-input, .target-input {
  margin-bottom: 0;
}

.query-actions {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.query-button, .clear-button {
  flex: 1;
  border-radius: var(--border-radius);
  font-weight: 500;
}

.query-button {
  background: var(--color-primary);
  border-color: rgba(31, 35, 40, 0.15);
  color: var(--color-fg-on-emphasis);
}

.query-button:hover {
  background: var(--color-primary-hover);
}

.clear-button {
  border: 1px solid var(--color-border-default);
  background: var(--color-bg-default);
  color: var(--color-fg-default);
}

.clear-button:hover {
  background: var(--color-bg-subtle);
  border-color: var(--color-border-muted);
}

.error-message {
  margin-top: var(--space-2);
}

.result-info {
  margin-top: var(--space-2);
}

.result-info p {
  margin: var(--space-1) 0;
}

.result-info p strong {
  color: var(--color-fg-default);
}
</style>