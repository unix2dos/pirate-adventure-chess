# Pirate Adventure Chess

一个面向亲子和本地同屏场景的海盗冒险棋盘游戏。  
现在这版已经不是单文件 demo，而是基于 `Vite + ES Modules` 拆分后的可继续演进版本，重点做了更像实体棋盘的盘面、逐格移动演出、掷骰手感和程序化音效。

## What It Is

- `2-4` 人本地同屏游玩
- 支持 `AI` 补位
- 儿童向卡通海盗冒险主题
- 大棋盘主舞台，弱化右侧信息栏
- 掷骰后会有 `rolling → moving → landing` 的完整回合演出
- 使用 `Web Audio API` 做轻量交互音效和静音控制

## Current Experience

- 开局页可选择人数、船长名字和 AI
- 对局页以长画幅棋盘为核心
- 棋盘上有 `1-100` 格编号、事件贴纸、中心终点岛
- 事件会触发独立 overlay
- 胜利后进入结算页，可直接再来一局

## Tech Stack

- `Vite`
- 原生 `ES Modules`
- 原生 `CSS`
- `Canvas` + DOM 混合渲染
- `Vitest` + `jsdom`
- `Web Audio API`

## Project Structure

```text
src/
  app/       scene 切换、回合时序、启动入口
  audio/     音频引擎与声音预设
  core/      玩家、棋盘数据、事件、回合规则
  render/    棋盘渲染与动画层
  ui/        开局页、HUD、事件层、结算页
  styles/    基础、布局、组件、场景、动画样式
tests/
  app/
  audio/
  core/
  render/
  ui/
```

## Local Development

```bash
npm install
npm run dev
```

打开本地地址后直接点 `开始冒险` 即可进入一局。

## Scripts

```bash
npm run dev
npm run build
npm test
```

## Cloudflare Pages Auto Deploy

仓库现在包含了 [`.github/workflows/deploy-cloudflare-pages.yml`](.github/workflows/deploy-cloudflare-pages.yml)，推送到 `main` 会触发一次 Cloudflare Pages 部署。

要让它真正生效，还需要在 GitHub 仓库里补这两个 `Actions secrets`：

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

推荐在 Cloudflare 中先创建一个 Pages 项目，项目名用 `pirate-adventure-chess`。  
如果你已经有现成项目，但名字不同，把 workflow 里的 `CLOUDFLARE_PAGES_PROJECT_NAME` 改成实际项目名即可。

最短接线步骤：

```text
1. Cloudflare Dashboard -> Workers & Pages -> Create application -> Pages -> 先创建项目
2. GitHub Repo -> Settings -> Secrets and variables -> Actions -> 新增上面的两个 secrets
3. push 到 main，GitHub Actions 会自动 build 并部署 dist/ 到 Cloudflare Pages
```

## Design Direction

这版的设计目标不是“网页上的功能样机”，而是：

- 盘面像一张可以玩的儿童冒险棋盘
- 右下角骰子是主交互
- 每一步移动都能被看见
- 每一次关键动作都能被听见

## Notes

- 当前重点是桌面端体验，移动端可玩但还没有做到专门打磨
- 音效默认开启，可以在对局页右下角用 `🔊 / 🔇` 切换
- 现在的声音以程序化交互音为主，还可以继续补高光事件和环境层
