<!-- Copilot / AI agent 指南（由代码自动生成，供 AI 编码助手参考） -->

# 快速指南 — 给 AI 编码助手的项目要点

本文件帮助 AI 代理快速理解并在本仓库中高效工作。优先关注“可执行/可验证”的信息：运行命令、关键文件、接口约定、常见陷阱与例子。

1. 大体架构（Big picture）

- 前端：React + Vite + Tailwind，源代码位于仓库根（`App.tsx`, `index.tsx`）与 `components/`、`contexts/`、`hooks/`。
- 后端：Cloudflare Pages Functions（serverless）。函数入口：`functions/_worker.ts`。具体 API 在 `functions/api/`：`bootstrap`(GET)、`health`(GET)、`auth`(POST)、`update`(POST)。
- 数据库：Cloudflare D1。wrangler 绑定变量名必须为 `DB`（见 `wrangler.toml`）。

2. 关键数据流与约定

- 客户端保存与同步逻辑集中在 `services/storage.ts`。重要方法/行为：`fetchAllData()`（从 `/api/bootstrap` 拉取并写入 localStorage）、`_saveItem()`（写本地并异步 POST `/api/update`）、`syncPendingChanges()`（冲突检测与同步）。
- 本地缓存键名统一前缀 `modernNav_`（例如 `modernNav_categories`、`modernNav_token`）。修改存储时请沿用该前缀。
- 鉴权：客户端通过 `/api/auth` 完成 `login`/`refresh`/`logout`/`update` 操作；API 用 Bearer token（无状态 HMAC 签名）保护。请参见 `services/storage.ts` 中的 `ensureAccessToken()` / `tryRefreshToken()` 使用示例。

3. 本地开发与运行（必读）

- 安装依赖：`npm install`。
- 前端快速运行（仅 UI）：`npm run dev`。
- 全栈本地调试（模拟 Cloudflare Pages + D1）：
  - 安装 `wrangler`：`npm install -D wrangler`。
  - 初始化/导入 D1 schema：仓库含 `schema.sql`（README 也提到 `schema.txt`，优先使用 `schema.sql`）。
  - 启动 Pages 本地模拟并绑定本地 D1：
    `npx wrangler pages dev . --d1 DB=modern-nav-db`

注意：`functions/_worker.ts` 中对非 `/api/` 路径的默认重定向目标是 `http://localhost:3000`，因此在模拟场景下请确保前端 dev server 在端口 3000（例如 `npm run dev -- --port 3000`），否则页面会被重定向到不存在的地址。

4. 常见约束与工程约定（对 AI 很重要）

- 优先不破坏 LocalStorage 同步逻辑：任何修改到 `storageService` 的行为都必须保留乐观更新与离线降级（即先写 localStorage，再尝试同步）和 `_isSynced/_pendingSync` 标志。
- API 输入/输出格式：`/api/update` 接受 `{ type, data }`；`/api/bootstrap` 返回 `{ categories, background, prefs, isDefaultCode }`。在构造请求与解析响应时按这些字段处理。
- 代码中大量使用 TypeScript 类型定义（见 `types.ts`），请尽量使用或更新这些类型，而不是直接使用 `any`。

5. 代码位置举例（便于快速导航）

- 后端路由入口：`functions/_worker.ts`
- API 实现：`functions/api/auth.ts`、`functions/api/bootstrap.ts`、`functions/api/update.ts`
- 客户端存储/同步：`services/storage.ts`
- 主要 UI 组件：`components/` 目录（例如 `GlassCard.tsx`, `CategoryNav.tsx`, `LinkManagerModal.tsx`）

6. 编辑/提交时的注意事项

- 修改后端 API 或 D1 schema 时，请同时更新 `wrangler.toml`（binding 名称 `DB`）及 README 中的部署步骤。
- 如果改动会改变 localStorage 结构（备份版本、字段），请在 `services/storage.ts` 中加入向后兼容的解析逻辑（示例已存在），并考虑增加数据迁移代码。

7. 后续可选增强（请确认是否需要）

- 将 README 中 `schema.txt` 的引用统一为 `schema.sql`，并在 `README` 内补充 `npx wrangler d1 execute` 的示例。
- 自动检查 `functions/_worker.ts` 与 `package.json` 中 dev server 端口一致性，并给出修复建议。

---

如果需要我把这份说明进一步扩充为任务清单或 CI 检查脚本，请告诉我你想要的输出形式。
