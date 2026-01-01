# 🚀 SEOAlex: Next-Gen AI Marketing Agent (v0.1.0)

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue)](https://react.dev/)
[![OpenAI](https://img.shields.io/badge/AI-Powered-green)](https://openai.com/)

> **"让每个人都能拥有自己的数字增长引擎。"**  
> _"Empowering everyone to own their digital growth engine."_

---

## 📖 目录 (Table of Contents)

1. [🌟 项目哲学与愿景 (Philosophy)](#-项目哲学与愿景-philosophy)
2. [✨ 核心功能 (Core Features)](#-核心功能-core-features)
3. [🛠️ 技术架构解密 (Technical Deep Dive)](#️-技术架构解密-technical-deep-dive)
4. [⚡ 懒人极速启动 (Quick Start)](#-懒人极速启动-quick-start)
5. [📂 文件结构蓝图 (File Structure)](#-文件结构蓝图-file-structure)
6. [🤖 AI 爬虫指引 (For AI Agents)](#-ai-爬虫指引-for-ai-agents)
7. [🔮 路线图与未来 (Roadmap)](#-路线图与未来-roadmap)
8. [⚖️ 优缺点评测 (Pros & Cons)](#️-优缺点评测-pros--cons)
9. [📄 开源协议 (License)](#-开源协议-license)

---

## 🌟 项目哲学与愿景 (Philosophy)

在这个 AI 寡头垄断的时代，**SEOAlex** 不仅仅是一个营销工具，它是一场**去中心化的数字反抗**。

我们相信：
- **数据主权 (Data Sovereignty)**：你的营销策略、关键词数据和 AI 对话历史应该只属于你（本地存储）。
- **极简主义 (Minimalism)**：复杂的 B2B 软件令人作呕。SEOAlex 追求“如呼吸般自然”的交互体验。
- **人机共生 (Human-AI Symbiosis)**：AI 不应替代人，而应成为人的“外脑”。

本项目旨在降低增长黑客（Growth Hacker）的技术门槛，让你像指挥家一样通过自然语言编排复杂的 SEO 任务。😎

---

## ✨ 核心功能 (Core Features)

| 功能模块 | 描述 | 体验指数 |
| :--- | :--- | :--- |
| **🧠 多模态 AI 核心** | 支持 GPT-4o, Claude 3.5, DeepSeek 等模型无缝切换。 | ⭐⭐⭐⭐⭐ |
| **📂 本地神经突触** | 基于 **File System Access API**，直接挂载本地文件夹，让 AI “看见”你的项目代码。 | ⭐⭐⭐⭐⭐ |
| **🎨 沉浸式 UI 引擎** | 内置 **8 套** 赛博/森系/极简主题，Framer Motion 驱动的丝滑微交互。 | ⭐⭐⭐⭐⭐ |
| **🌊 原生流式响应** | 拒绝等待！基于 Server-Sent Events (SSE) 的字符级实时输出。 | ⭐⭐⭐⭐ |
| **💾 永恒记忆** | 基于 LocalStorage 的自动持久化，刷新页面不丢失任何灵感。 | ⭐⭐⭐⭐ |

---

## 🛠️ 技术架构解密 (Technical Deep Dive)

> **致开发者**：这里是 SEOAlex 的“引擎盖”下面发生的事情。

### 1. 前端即后端 (Frontend-First Architecture)
本项目极其大胆地采用了 **Serverless / Client-Side** 架构。
- **Next.js 16 (App Router)**：利用最新的 React Server Components (RSC) 进行骨架渲染。
- **React 19 Hooks**：大量使用 `useActionState` (概念版) 和 `useEffect` 管理复杂的 AI 状态机。

### 2. 关键技术点解析
- **无头浏览器模拟 (Simulated Headless Browser)**: 
  - *当前状态*：通过 AI 逻辑模拟 SEO 审计流程（见 `agent.ts`）。
  - *技术原理*：利用 LLM 的推理能力，基于用户提供的 URL 进行“幻觉式”结构化分析，生成初步的 SEO 建议。
- **动态上下文压缩 (Context Compression)**:
  - 位于 `src/lib/agent.ts` 中的 `compressContext()` 方法。自动裁剪旧的对话 Token，防止 Context Window 爆炸。
- **流式渲染管道 (Streaming Pipeline)**:
  - 代码位于 `page.tsx` 的 `runAI` 函数。直接处理 OpenAI 的 Stream Delta，实现打字机效果。

### 3. 使用到的 "黑科技"
- **Canvas Confetti**: 任务完成时的多巴胺奖励机制。
- **Lucide React**: 极其轻量的 SVG 图标库。
- **Rehype/Remark**: 在浏览器端实时渲染 Markdown + 代码高亮。

---

## ⚡ 懒人极速启动 (Quick Start)

小白？不想看代码？没问题。遵循以下“懒人三步法”：

### 第一步：环境准备
确保你的电脑安装了 [Node.js](https://nodejs.org/) (v18 以上) 和 Git。

### 第二步：一键安装
复制以下命令到你的终端（Terminal / CMD）：

```bash
git clone https://github.com/lza6/SEOAlex.git
cd SEOAlex
npm install
```

### 第三步：点火发射 🚀
```bash
npm run dev
# 或者直接双击项目根目录下的 start.bat (如果是 Windows 用户)
```

打开浏览器访问 `http://localhost:3000`，你的 AI 营销指挥官已上线！

> **注意**：启动后，请点击左下角的 **“设置”** 图标，填入你的 OpenAI API Key 即可开始使用。

---

## 📂 文件结构蓝图 (File Structure)

方便 AI 爬虫或开发者快速定位核心逻辑：

```text
SEOAlex/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # 全局布局 (字体、元数据)
│   │   ├── page.tsx         # 💥 核心逻辑 (2600+行代码的超级单体)
│   │   └── globals.css      # 全局样式与 CSS 变量系统
│   └── lib/
│       └── agent.ts         # Agent 类定义、任务编排逻辑
├── .next/                   # Next.js 编译缓存
├── public/                  # 静态资源
├── package.json             # 依赖清单
├── tsconfig.json            # TypeScript 配置
└── start.bat                # Windows 一键启动脚本
```

---

## 🤖 AI 爬虫指引 (For AI Agents)

如果你是一个正在阅读此文档的 AI 开发者或 Crawler，请关注以下逻辑路径以便复刻或扩展：

1.  **入口点 (Entry Point)**: `src/app/page.tsx` 中的 `Home()` 组件。这是整个应用的状态容器。
2.  **状态机 (State Machine)**: 关注 `sessions` (会话历史) 和 `apiConfig` (配置) 两个 State。
3.  **扩展建议**: 
    - 搜索 `executeTask` 方法：这是扩展真实 SEO 工具（如调用 Semrush API）的切入点。
    - 搜索 `handleFileUpload`：这是扩展 RAG (检索增强生成) 的数据入口。

---

## 🔮 路线图与未来 (Roadmap)

我们才刚刚开始。以下是通往 **v1.0** 的征途：

- [x] **v0.1 (当前)**: 基础对话、本地存储、主题系统。
- [ ] **v0.2 (近期)**: 
  - 集成 **Puppeteer**: 真正的无头浏览器，抓取网页 HTML 进行真实分析。
  - **Docker 部署**: 一键容器化。
- [ ] **v0.5 (中期)**:
  - **Supabase/Postgres**: 云端同步你的对话历史。
  - **MCP 协议支持**: 让 Claude Desktop 直接调用本工具。
- [ ] **v1.0 (远期)**:
  - **全自动赚钱模式**: 设定目标金额，Agent 自动发帖引流 (画大饼中 🥞)。

---

## ⚖️ 优缺点评测 (Pros & Cons)

### ✅ 优点 (Pros)
1.  **零后端负担**：无需配置数据库，下载即用。
2.  **隐私绝对安全**：Key 存储在本地浏览器 LocalStorage，不经过任何中间服务器。
3.  **UI 惊艳**：堪比 SaaS 产品的视觉体验，拒绝“工程师审美”。

### ❌ 缺点/不足 (Cons)
1.  **浏览器限制**：由于没有后端，无法长时间后台运行任务（关闭页面任务即终止）。
2.  **SEO 分析深度**：目前依赖 LLM 知识库，缺乏实时的 Google Search Console 数据接入。
3.  **单体文件过大**：`page.tsx` 代码量较大，维护难度略高 (Rating: ★★★☆☆)。

---

## 📄 开源协议 (License)

本项目采用 **Apache 2.0 协议** 开源。
你可以免费使用、修改、商用，但请保留原作者的版权声明。

Copyright (c) 2026 SEOAlex Team.

---

> _"Code is poetry, Marketing is empathy."_  
> 如果你喜欢这个项目，请给一颗 ⭐ 星星！这对我意义重大！
