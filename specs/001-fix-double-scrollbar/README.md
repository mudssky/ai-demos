---
status: planned
created: '2025-12-25'
tags:
  - ui
  - bugfix
  - scrollbar
priority: high
created_at: '2025-12-25T16:12:04.881Z'
---

# 修复演示容器的双滚动条问题

> **Status**: 📅 Planned · **Priority**: High · **Created**: 2025-12-25

## Overview

移除 iframe demo 和 React 组件 demo 中容器级别的滚动条，只保留页面级别的滚动条，改善用户体验。

## Problem Analysis

### 当前问题

通过代码审查发现双滚动条问题的根本原因：

1. **PreviewSection.tsx** (line 36, 39):
   - 外层容器设置固定高度 `style={{ height: '720px' }}`
   - 容器缺少 `overflow` 控制，当内容超出时浏览器自动添加滚动条

2. **ReactPreview.tsx** (line 28, 36):
   - 容器使用 `overflow-hidden`
   - 但 `SandpackPreview` 内部可能有自己的滚动条

3. **HtmlPreview.tsx** (line 23, 31):
   - 容器使用 `overflow-hidden`
   - iframe 设置为 `w-full h-full`，可能在内部产生滚动条

### 滚动条层级

```
页面滚动条 (浏览器默认)
  └─ PreviewSection 容器 (720px 固定高度，缺少 overflow 控制)
      └─ ReactPreview/HtmlPreview (overflow-hidden)
          └─ SandpackPreview/iframe (内部滚动)
```

## Design

### 解决方案

**核心原则**：只保留最内层的滚动条（预览内容内部），移除中间容器的滚动条

1. **PreviewSection 容器**
   - 添加 `overflow: hidden` 防止容器级滚动条
   - 保持固定高度以维持布局

2. **内部预览组件**
   - 确保 SandpackPreview 和 iframe 正确处理内容溢出
   - 不改变现有的 overflow-hidden 设置

3. **Sandpack 特殊处理**
   - 检查 SandpackPreview 的默认样式
   - 可能需要通过 `customStyle` prop 调整其滚动行为

### 技术细节

#### 修改点 1: PreviewSection.tsx

```tsx
// 修改前 (line 35)
const containerClass = cn("relative", className);

// 修改后
const containerClass = cn("relative overflow-hidden", className);
```

#### 修改点 2: ReactPreview.tsx (可选)

如果 SandpackPreview 仍有问题，添加自定义样式：

```tsx
<SandpackPreview
  style={{ height: "100%" }}
  customStyle={{
    width: "100%",
    height: "100%",
    overflow: "auto",
  }}
/>
```

#### 修改点 3: HtmlPreview.tsx (无需修改)

当前实现已正确，iframe 会自动处理内部滚动。

## Plan

1. **修改 PreviewSection.tsx**
   - 在容器 className 中添加 `overflow-hidden`
   - 测试 HTML demo 是否正常

2. **测试 React demo**
   - 验证 React 组件预览的滚动行为
   - 如有问题，调整 SandpackPreview 配置

3. **全屏模式验证**
   - 确保全屏模式下滚动行为正确
   - 检查 overlay 状态下的预览

4. **浏览器兼容性测试**
   - Chrome/Edge
   - Firefox
   - Safari

5. **回归测试**
   - 运行 `pnpm typecheck`
   - 运行 `pnpm lint`
   - 手动测试多个 demo

## Test

### 验收标准

- [ ] **HTML Demo**: 容器无滚动条，只有 iframe 内部可滚动
- [ ] **React Demo**: 容器无滚动条，只有 SandpackPreview 内部可滚动
- [ ] **全屏模式**: 全屏状态下滚动行为正常
- [ ] **布局完整**: 固定高度 (720px) 保持不变，无布局破坏
- [ ] **代码质量**: 通过类型检查和 lint 检查

### 测试用例

1. 访问任意 HTML 演示页面，验证只有页面滚动条和 iframe 内部滚动条
2. 访问任意 React 演示页面，验证只有页面滚动条和预览区域滚动条
3. 点击全屏按钮，验证全屏模式下滚动正常
4. 在不同浏览器中测试，确认行为一致

## Notes

### 已探索的替代方案

1. **使用 `overflow-y: auto`** ❌
   - 问题：会在容器上创建新的滚动条，与内部滚动条并存

2. **移除固定高度** ❌
   - 问题：破坏现有布局，影响全屏功能的实现

3. **使用 CSS 隐藏滚动条** (`::-webkit-scrollbar { display: none }`) ❌
   - 问题：仅影响视觉，滚动功能仍存在，且不兼容所有浏览器

### 依赖项

- 无
- 可独立实施，不影响其他功能
