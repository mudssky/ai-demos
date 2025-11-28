# 项目技术栈说明

## 核心技术栈说明
- 框架：`Next.js 16.0.5`（配置见 `next.config.ts`，已启用 `reactCompiler: true`）
- 运行时：`React 19.2.0`、`react-dom 19.2.0`
- 语言与类型：`TypeScript ^5`、`@types/node ^24.10.1`、`@types/react ^19`、`@types/react-dom ^19`
- 样式系统：`Tailwind CSS ^4` 搭配 `@tailwindcss/postcss ^4`（`postcss.config.mjs` 已配置、`src/app/globals.css` 采用 v4 语法）
- 测试框架：`Vitest ^4.0.8`、覆盖率：`@vitest/coverage-v8 ^4.0.8`（配置见 `vitest.config.ts`，别名 `@` 指向 `src`）
- 代码质量：`@biomejs/biome 2.3.8`、`husky ^9.1.7`、`lint-staged ^16.2.7`
- 编译优化：`babel-plugin-react-compiler 1.0.0`
- 包管理器：`pnpm`（存在 `pnpm-lock.yaml`）
- Node 要求：推荐 `Node.js 20 LTS`（最低建议 `>=18.18`）

## Shadcn 组件使用规范
- 当前状态：项目暂未引入 `shadcn/ui`（无相关依赖与导入）。以下为统一的引入规范与最佳实践。
- 版本建议：
  - `shadcn@latest` CLI（用于生成组件）
  - `@radix-ui/react-*` 按需安装（如 `react-slot`、`dialog`、`popover` 等）
  - `class-variance-authority ^0.7`、`clsx ^2`、`tailwindcss-animate ^1`、`tailwind-merge ^2`（推荐）
  - 与本项目兼容：`Next.js 16`、`React 19`、`Tailwind v4`
- 集成步骤（Next.js 16 + Tailwind v4）：
  1. 安装依赖：
     - `pnpm add class-variance-authority clsx tailwindcss-animate tailwind-merge`
     - 按需安装 Radix 组件，如：`pnpm add @radix-ui/react-slot @radix-ui/react-dialog`
  2. 安装并初始化 CLI：
     - `pnpm dlx shadcn@latest init`
     - 组件目录建议：`src/components/ui`
  3. 生成组件：
     - 例如：`pnpm dlx shadcn@latest add button input textarea dialog`
     - 生成文件将位于 `src/components/ui/*`
  4. Tailwind v4 注意事项：
     - 保持 `globals.css` 顶部 `@import "tailwindcss"`
     - 无需传统 `tailwind.config.js`，样式令牌可通过 `@theme inline` 注入 CSS 变量
     - 如组件依赖动画类，确保已安装并引入 `tailwindcss-animate`
  5. `cn` 工具函数：
     - 新增 `src/lib/cn.ts`，示例：
       ```ts
       import { clsx } from "clsx";
       import { twMerge } from "tailwind-merge";
       export function cn(...inputs: any[]) { return twMerge(clsx(inputs)); }
       ```
- 最佳实践：
  - 组件统一放置在 `src/components/ui`，避免跨层级引用混乱
  - 仅在 `ui` 层封装样式与状态，业务逻辑放在上层容器组件
  - 通过 `CVA` 管理样式变体，避免在业务中扩散类名拼接
  - 图标建议使用 `lucide-react`，统一主题与尺寸规范
  - 避免直接修改生成组件的第三方依赖，统一通过局部封装与主题变量扩展
- 使用示例（Button）：
  ```tsx
  "use client";
  import { Button } from "@/components/ui/button";
  export default function Demo() {
    return <Button variant="default" size="sm">提交</Button>;
  }
  ```

## Three.js 集成指南
- 当前状态：项目暂未引入 `three`。以下为规范化引入与使用建议。
- 版本建议：
  - 核心：`three ^0.168.0`
  - 可选生态：`@react-three/fiber ^9`、`@react-three/drei ^9`（更易于在 React 中组织 3D 场景）
- 安装：
  - 仅 Three.js：`pnpm add three`
  - 推荐 React 生态：`pnpm add three @react-three/fiber @react-three/drei`
- 引入方式（Next.js + 客户端组件）：
  - 基本原则：3D 场景在客户端渲染，组件文件需加 `"use client"`
- 基本代码示例（原生 three.js）：
  ```tsx
  "use client";
  import { useEffect, useRef } from "react";
  import * as THREE from "three";

  export default function BasicScene() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const container = containerRef.current!;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
      container.appendChild(renderer.domElement);

      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshStandardMaterial({ color: 0x3399ff });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);

      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(3, 3, 3);
      scene.add(light);

      camera.position.z = 5;

      let raf = 0;
      const animate = () => {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
        raf = requestAnimationFrame(animate);
      };
      animate();

      const handleResize = () => {
        const { clientWidth: w, clientHeight: h } = container;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener("resize", handleResize);

      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", handleResize);
        renderer.dispose();
        geometry.dispose();
        material.dispose();
      };
    }, []);

    return <div ref={containerRef} style={{ width: "100%", height: 400 }} />;
  }
  ```
- 性能优化建议：
  - 控制像素比：`renderer.setPixelRatio(Math.min(2, devicePixelRatio))`
  - 复用与释放：`geometry/material/texture` 在卸载时调用 `dispose()`
  - 减少重建：将 `renderer`、`scene`、`camera` 保持在 `useEffect` 闭包内，避免重复创建
  - 降低开销：谨慎开启阴影、后处理，优先使用 `BufferGeometry`、`InstancedMesh`
  - 渲染策略：按需渲染（交互或数据变化时重绘），非必须时暂停动画帧
- 常见问题与解决：
  - SSR 报错：确保 3D 组件加 `"use client"`
  - 开发模式重复初始化：Next 严格模式可能导致副作用触发两次，使用 `ref` 标记避免重复构建
  - 画布尺寸异常：以容器尺寸计算相机纵横比并在 `resize` 时更新
  - `three/examples/jsm/*` 模块：按需动态导入，避免 SSR 参与

## 技术栈依赖关系图
```mermaid
graph TD
  Next[Next.js 16] --> React[React 19]
  Next --> Tailwind[Tailwind v4]
  Tailwind --> PostCSS[@tailwindcss/postcss]
  Next --> Vitest[Vitest 4]
  Vitest --> Coverage[V8 Coverage]
  Dev[Dev Tooling] --> Biome[Biome 2.3.8]
  Dev --> Husky[Husky 9]
  Dev --> LintStaged[lint-staged 16]
  Shadcn[shadcn/ui 指南] --> Tailwind
  Shadcn --> Radix[@radix-ui/react-*]
  Shadcn --> CVA[CVA/clsx/tailwind-merge]
  Three[Three.js 指南] --> React
```

## 开发环境配置
- 初始化依赖：
  - `pnpm install`
- 本地开发：
  - `pnpm dev`
- 构建与运行：
  - `pnpm build`
  - `pnpm start`
- 质量与校验：
  - 类型检查（快速）：`pnpm typecheck:fast`
  - 类型检查（严格）：`pnpm typecheck`
  - 格式与静态检查修复：`pnpm biome:fixAll`
  - 一体化质量检查：`pnpm qa`
- 单元测试：
  - 运行：`pnpm test`（配置：`tests/**/*.test.ts`，别名 `@` → `src`）
- 环境变量：
  - 当前项目未使用环境变量（未发现 `.env*` 与 `process.env` 引用）
  - 推荐规范（Next.js）：
    - 客户端可见变量以 `NEXT_PUBLIC_` 前缀放置于 `.env.local`
    - 仅服务端变量无前缀，使用 `process.env.VAR_NAME`，避免泄露到浏览器
    - 在 Vercel/CI 部署时通过平台环境配置注入

---
- 依据当前仓库文件：
  - `package.json`、`next.config.ts`、`postcss.config.mjs`、`src/app/globals.css`、`vitest.config.ts`
  - 未发现：`tailwind.config.*`、`.env*`、`shadcn/ui`、`@radix-ui/*`、`class-variance-authority`、`lucide-react`、`three`
