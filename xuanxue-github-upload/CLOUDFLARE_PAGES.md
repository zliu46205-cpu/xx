# Cloudflare Pages 部署指南

本项目可以先用 Cloudflare Pages 上线前端，让用户在你的电脑关机时也能打开网站。

## 重要说明

Cloudflare Pages 默认托管的是静态前端。

当前项目里的本地后端：

```text
server/index.mjs
```

不能直接在 Cloudflare Pages 静态托管里运行。

所以第一步上线后：

- 首页、功能页、表单、报告展示都能打开。
- 如果没有云端 API，报告会走前端离线生成模式。
- 历史报告保存、登录、订单、会员、支付，需要后续接 Cloudflare Workers / Pages Functions / 云服务器 / 数据库。

## 一、推荐的 Cloudflare Pages 配置

在 Cloudflare Pages 创建项目时填写：

```text
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: /
Node version: 20 或更高
```

环境变量：

如果只上线前端体验版，先不填也可以。

如果以后有云端 API，添加：

```text
VITE_XUANXUE_API_BASE=https://api.your-domain.com
```

## 二、通过 GitHub 自动部署

推荐方式：

1. 把项目推到 GitHub。
2. 打开 Cloudflare Dashboard。
3. 进入 `Workers & Pages`。
4. 选择 `Create application`。
5. 选择 `Pages`。
6. 连接 GitHub 仓库。
7. 填写构建配置：

```text
Build command: npm run build
Build output directory: dist
```

8. 点击 Deploy。

以后你每次推送到 GitHub，Cloudflare Pages 会自动重新部署。

## 三、手动上传 dist

如果你暂时不想接 GitHub，也可以：

```bash
npm run build
```

然后把 `dist/` 目录上传到 Cloudflare Pages。

这种方式适合临时测试，不适合长期维护。

## 四、项目已经准备好的 Cloudflare 文件

已添加：

```text
public/_redirects
public/_headers
```

`_redirects` 用于单页应用刷新不 404：

```text
/* /index.html 200
```

`_headers` 用于静态资源缓存和基础安全响应头。

Vite 构建时会自动把它们复制到 `dist/`。

## 五、上线后的限制

如果只用 Cloudflare Pages 静态部署，以下功能还不是正式后端能力：

- 用户登录
- 历史报告云端保存
- 管理员后台
- 订单
- 支付
- 会员
- 真实数据库

这些要在第二阶段做。

## 六、第二阶段推荐架构

Cloudflare 体系内推荐：

```text
Cloudflare Pages：前端
Cloudflare Pages Functions 或 Workers：后端 API
Cloudflare D1 / Supabase / Neon：数据库
Cloudflare R2：报告导出文件、图片、缓存资源
```

如果你想更简单：

```text
Cloudflare Pages：前端
一台云服务器：Node 后端
PostgreSQL / MySQL：数据库
```

## 七、建议你当前先做什么

先完成：

1. Cloudflare Pages 上线前端。
2. 拿到 `https://xxx.pages.dev` 地址。
3. 确认手机和别人电脑都能打开。
4. 再开始做云端 API 和数据库。

不要一开始就把登录、支付、会员全部接上，先把公网访问跑通。
