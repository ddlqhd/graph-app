<template>
  <div class="demo-container">
    <div class="demo-header">
      <h1>GitHub Style Components Demo</h1>
      <p>展示优化后的按钮、输入框、下拉框等组件的GitHub风格设计</p>

      <!-- 主题切换演示 -->
      <div class="theme-demo">
        <h4>主题切换</h4>
        <div class="theme-buttons">
          <el-button
            :type="currentTheme === 'light' ? 'primary' : 'default'"
            @click="handleThemeChange('light')"
          >
            浅色主题
          </el-button>
          <el-button
            :type="currentTheme === 'dark' ? 'primary' : 'default'"
            @click="handleThemeChange('dark')"
          >
            深色主题
          </el-button>
          <el-button
            :type="currentTheme === 'auto' ? 'primary' : 'default'"
            @click="handleThemeChange('auto')"
          >
            跟随系统
          </el-button>
        </div>
        <p class="theme-status">
          当前主题：{{ getThemeLabel(currentTheme) }}
          <span v-if="currentTheme === 'auto'">
            （实际显示：{{ isDark ? '深色' : '浅色' }}）
          </span>
        </p>
      </div>
    </div>

    <div class="demo-sections">
      <!-- 按钮组件演示 -->
      <el-card class="demo-section">
        <template #header>
          <h3>按钮 Buttons</h3>
        </template>
        <div class="button-demo">
          <div class="button-group">
            <h4>基础按钮</h4>
            <div class="button-row">
              <el-button>Default</el-button>
              <el-button type="primary">Primary</el-button>
              <el-button type="info">Info</el-button>
              <el-button type="danger">Danger</el-button>
            </div>
          </div>

          <div class="button-group">
            <h4>不同尺寸</h4>
            <div class="button-row">
              <el-button size="large">Large</el-button>
              <el-button>Default</el-button>
              <el-button size="small">Small</el-button>
            </div>
          </div>

          <div class="button-group">
            <h4>状态</h4>
            <div class="button-row">
              <el-button loading>Loading</el-button>
              <el-button disabled>Disabled</el-button>
              <el-button type="primary" disabled>Primary Disabled</el-button>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 输入框组件演示 -->
      <el-card class="demo-section">
        <template #header>
          <h3>输入框 Inputs</h3>
        </template>
        <div class="input-demo">
          <div class="input-group">
            <h4>基础输入框</h4>
            <el-input v-model="basicInput" placeholder="请输入内容" />
          </div>

          <div class="input-group">
            <h4>带图标输入框</h4>
            <el-input v-model="iconInput" placeholder="搜索..." :prefix-icon="Search" />
          </div>

          <div class="input-group">
            <h4>输入框组合</h4>
            <el-input v-model="groupInput" placeholder="请输入网址">
              <template #prepend>Http://</template>
              <template #append>.com</template>
            </el-input>
          </div>

          <div class="input-group">
            <h4>文本域</h4>
            <el-input
              v-model="textareaInput"
              type="textarea"
              :rows="3"
              placeholder="请输入多行文本..."
            />
          </div>

          <div class="input-group">
            <h4>不同尺寸</h4>
            <div class="size-inputs">
              <el-input v-model="largeInput" size="large" placeholder="Large" />
              <el-input v-model="defaultInput" placeholder="Default" />
              <el-input v-model="smallInput" size="small" placeholder="Small" />
            </div>
          </div>
        </div>
      </el-card>

      <!-- 选择器组件演示 -->
      <el-card class="demo-section">
        <template #header>
          <h3>选择器 Selects</h3>
        </template>
        <div class="select-demo">
          <div class="select-group">
            <h4>基础选择器</h4>
            <el-select v-model="basicSelect" placeholder="请选择">
              <el-option label="选项1" value="option1" />
              <el-option label="选项2" value="option2" />
              <el-option label="选项3" value="option3" />
              <el-option label="禁用选项" value="disabled" disabled />
            </el-select>
          </div>

          <div class="select-group">
            <h4>多选</h4>
            <el-select v-model="multiSelect" multiple placeholder="请选择多个选项">
              <el-option label="Vue" value="vue" />
              <el-option label="React" value="react" />
              <el-option label="Angular" value="angular" />
              <el-option label="Svelte" value="svelte" />
            </el-select>
          </div>

          <div class="select-group">
            <h4>下拉菜单</h4>
            <el-dropdown @command="handleDropdownCommand">
              <el-button type="primary">
                更多操作 <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">编辑</el-dropdown-item>
                  <el-dropdown-item command="copy">复制</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-card>

      <!-- 表单组件演示 -->
      <el-card class="demo-section">
        <template #header>
          <h3>表单组件 Form Components</h3>
        </template>
        <div class="form-demo">
          <el-form :model="form" label-width="120px">
            <el-form-item label="单选框">
              <el-radio-group v-model="form.radio">
                <el-radio label="1">选项1</el-radio>
                <el-radio label="2">选项2</el-radio>
                <el-radio label="3" disabled>禁用选项</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="复选框">
              <el-checkbox-group v-model="form.checkboxes">
                <el-checkbox label="vue">Vue</el-checkbox>
                <el-checkbox label="react">React</el-checkbox>
                <el-checkbox label="angular">Angular</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="开关">
              <el-switch v-model="form.switch" />
            </el-form-item>

            <el-form-item label="标签">
              <div class="tag-demo">
                <el-tag>默认标签</el-tag>
                <el-tag type="primary">主要标签</el-tag>
                <el-tag type="success">成功标签</el-tag>
                <el-tag type="warning">警告标签</el-tag>
                <el-tag type="danger">危险标签</el-tag>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useTheme } from '@/composables/useTheme'

// Theme
const { currentTheme, isDark, setTheme, getThemeLabel } = useTheme()

// 响应式数据
const basicInput = ref('')
const iconInput = ref('')
const groupInput = ref('')
const textareaInput = ref('')
const largeInput = ref('')
const defaultInput = ref('')
const smallInput = ref('')

const basicSelect = ref('')
const multiSelect = ref([])

const form = ref({
  radio: '1',
  checkboxes: ['vue'],
  switch: true
})

// 方法
const handleDropdownCommand = (command: string) => {
  ElMessage.info(`点击了 ${command}`)
}

const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
  setTheme(theme)
  ElMessage.success(`已切换至${getThemeLabel(theme)}`)
}
</script>

<style scoped>
.demo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-4);
}

.demo-header {
  text-align: center;
  margin-bottom: var(--space-6);
}

.demo-header h1 {
  font-size: 32px;
  font-weight: 600;
  color: var(--color-fg-default);
  margin-bottom: var(--space-2);
}

.demo-header p {
  font-size: 16px;
  color: var(--color-fg-muted);
  line-height: 24px;
  margin-bottom: var(--space-4);
}

.theme-demo {
  background: var(--color-bg-subtle);
  padding: var(--space-4);
  border-radius: var(--border-radius-large);
  border: 1px solid var(--color-border-default);
  margin-bottom: var(--space-4);
}

.theme-demo h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-fg-default);
  margin: 0 0 var(--space-3) 0;
}

.theme-buttons {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
  flex-wrap: wrap;
}

.theme-status {
  font-size: 14px;
  color: var(--color-fg-muted);
  margin: 0;
  padding: var(--space-2);
  background: var(--color-bg-default);
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border-default);
}

.demo-sections {
  display: grid;
  gap: var(--space-4);
}

.demo-section {
  padding: 0;
}

.demo-section h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-fg-default);
  margin: 0;
}

.button-demo,
.input-demo,
.select-demo,
.form-demo {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.button-group,
.input-group,
.select-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.button-group h4,
.input-group h4,
.select-group h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-fg-default);
  margin: 0;
}

.button-row {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.size-inputs {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.tag-demo {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .demo-container {
    padding: var(--space-3);
  }

  .demo-header h1 {
    font-size: 24px;
  }

  .button-row {
    flex-direction: column;
  }
}
</style>