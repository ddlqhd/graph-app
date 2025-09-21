<template>
  <div class="theme-toggle">
    <el-dropdown @command="handleThemeCommand" trigger="click">
      <el-button 
        type="text" 
        class="theme-button"
        :title="`当前主题: ${getThemeLabel(currentTheme)}`"
      >
        <el-icon class="theme-icon">
          <component :is="themeIcon" />
        </el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu class="theme-dropdown">
          <el-dropdown-item 
            command="light"
            :class="{ 'is-active': currentTheme === 'light' }"
          >
            <div class="theme-option">
              <el-icon class="option-icon">
                <Sunny />
              </el-icon>
              <span>浅色主题</span>
              <el-icon v-if="currentTheme === 'light'" class="check-icon">
                <Check />
              </el-icon>
            </div>
          </el-dropdown-item>
          
          <el-dropdown-item 
            command="dark"
            :class="{ 'is-active': currentTheme === 'dark' }"
          >
            <div class="theme-option">
              <el-icon class="option-icon">
                <Moon />
              </el-icon>
              <span>深色主题</span>
              <el-icon v-if="currentTheme === 'dark'" class="check-icon">
                <Check />
              </el-icon>
            </div>
          </el-dropdown-item>
          
          <el-dropdown-item 
            command="auto"
            :class="{ 'is-active': currentTheme === 'auto' }"
          >
            <div class="theme-option">
              <el-icon class="option-icon">
                <Monitor />
              </el-icon>
              <span>跟随系统</span>
              <el-icon v-if="currentTheme === 'auto'" class="check-icon">
                <Check />
              </el-icon>
            </div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { Sunny, Moon, Monitor, Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// Theme composable
const { currentTheme, isDark, setTheme, getThemeLabel } = useTheme()

// 计算当前主题图标
const themeIcon = computed(() => {
  if (currentTheme.value === 'dark') return Moon
  if (currentTheme.value === 'light') return Sunny
  // auto 模式根据实际显示状态选择图标
  return isDark.value ? Moon : Sunny
})

// 处理主题切换
const handleThemeCommand = (command: string) => {
  const theme = command as 'light' | 'dark' | 'auto'
  setTheme(theme)
  ElMessage.success(`已切换至${getThemeLabel(theme)}`)
}
</script>

<style scoped>
.theme-toggle {
  display: inline-block;
}

.theme-button {
  color: var(--color-fg-on-emphasis);
  border: 1px solid rgba(240, 246, 252, 0.1);
  background: transparent;
  border-radius: var(--border-radius);
  width: 32px;
  height: 32px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.3, 0, 0.5, 1);
  position: relative;
  overflow: hidden;
}

.theme-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.theme-button:hover::before {
  opacity: 1;
}

.theme-button:hover {
  border-color: rgba(240, 246, 252, 0.3);
  transform: translateY(-1px);
}

.theme-button:active {
  transform: translateY(0);
}

.theme-icon {
  font-size: 16px;
  transition: all 0.2s ease;
}

.theme-dropdown {
  min-width: 180px;
  padding: var(--space-2);
}

.theme-option {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
}

.option-icon {
  font-size: 14px;
  color: var(--color-fg-muted);
}

.check-icon {
  margin-left: auto;
  font-size: 14px;
  color: var(--color-primary);
}

:deep(.el-dropdown-menu__item) {
  padding: 8px 12px;
  border-radius: var(--border-radius);
  transition: all 0.2s ease;
  margin-bottom: 2px;
}

:deep(.el-dropdown-menu__item:hover) {
  background: var(--color-bg-subtle);
}

:deep(.el-dropdown-menu__item.is-active) {
  background: var(--color-bg-subtle);
  color: var(--color-primary);
  font-weight: 500;
}

:deep(.el-dropdown-menu__item.is-active .option-icon) {
  color: var(--color-primary);
}
</style>