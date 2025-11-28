# 项目技术栈说明

## 核心技术栈说明

- 框架：`Next.js 16.0.5`（`next.config.ts` 已启用 `reactCompiler: true`）
- 运行时：`React 19.2.0`、`react-dom 19.2.0`
- 语言与类型：`TypeScript ^5`、`@types/node ^24.10.1`、`@types/react ^19`、`@types/react-dom ^19`
- 样式系统：`Tailwind CSS ^4` + `@tailwindcss/postcss ^4`（`src/app/globals.css` 使用 v4 语法与 CSS 变量主题）
- 测试框架：`Vitest ^4.0.8` + 覆盖率：`@vitest/coverage-v8 ^4.0.8`
- 代码质量：`@biomejs/biome 2.3.8`、`husky ^9.1.7`、`lint-staged ^16.2.7`
- 编译优化：`babel-plugin-react-compiler 1.0.0`
- 校验与类型安全：`zod ^4`（已集成）
- UI 组件：`shadcn/ui`（已初始化，存在 `components.json` 与 `src/components/ui`）

## Shadcn 组件使用规范（已集成）

- 现状：依赖已安装，`Button`、`Input`、`Label` 可用；`components.json` 指定样式 `new-york`、别名与 Tailwind v4 CSS 路径。
- 依赖栈：`class-variance-authority`、`tailwind-merge`、`@radix-ui/react-slot`、`lucide-react`。
- 目录规范：所有 UI 组件位于 `src/components/ui/*`，工具函数位于 `src/lib/utils.ts`（`cn`）。
- Tailwind v4 要点：无需传统 `tailwind.config.*`，通过 `@theme inline` 与 CSS 变量维护主题；`globals.css` 顶部需 `@import "tailwindcss"`。
- 使用示例：

  ```tsx
  "use client";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  ```

## Zod 使用规范（已集成）

- 场景：表单输入校验、数据解析与安全边界检查。
- 示例页面：`src/app/demo/zod-form/page.tsx`（路由：`/demo/zod-form`）。
- 基本模式：

  ```ts
  import { z } from "zod";
  const Schema = z.object({ name: z.string().min(2), email: z.string().email() });
  const res = Schema.safeParse(data);
  ```

- 单元测试：`tests/zod.test.ts` 验证成功与失败用例。

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
  Shadcn[shadcn/ui 已集成] --> Tailwind
  Shadcn --> Radix[@radix-ui/react-*]
  Shadcn --> CVA[CVA/clsx/tailwind-merge]
  Zod[Zod 校验] --> React
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
- 环境变量：当前项目未使用环境变量（未发现 `.env*` 与 `process.env` 引用）。如需添加，遵循 Next.js 规范：客户端以 `NEXT_PUBLIC_` 前缀，服务端变量不加前缀，并更新 `.env.example`。

---

- 依据当前仓库文件：
  - 已发现：`components.json`、`src/components/ui/button.tsx`、`class-variance-authority`、`tailwind-merge`、`@radix-ui/react-slot`、`lucide-react`、`zod`。
  - 未发现：`tailwind.config.*`、`.env*`、`three`。
