# 天机观象公网部署说明

目标：即使你的个人电脑关机、断网，用户也能正常打开网站并使用测算功能。

## 一、必须理解的一点

本地地址例如：

```text
http://127.0.0.1:5173
http://127.0.0.1:8787
```

只在你自己的电脑上可用。你的电脑关机后，用户无法访问。

要让大众用户随时访问，必须把项目部署到公网服务器或云平台。

## 二、推荐部署结构

正式上线建议分成两部分：

```text
用户浏览器
  ↓
前端网站：Vercel / Netlify / Cloudflare Pages / 国内云静态托管
  ↓
后端 API：云服务器 / Render / Railway / 国内云服务器
  ↓
数据库：PostgreSQL / MySQL / Supabase / 云数据库
```

当前项目已经具备：

- 前端：React + Vite
- 后端：Node 原生 API
- 本地报告存储：server/storage/reports.json

注意：`reports.json` 只适合本地 MVP，不适合正式商业上线。正式上线要换数据库。

## 三、最快上线方案

### 方案 A：先上线纯前端体验版

适合：快速给别人看页面、收集反馈。

优点：

- 快
- 成本低
- 电脑关机也能打开首页

缺点：

- 报告只能前端模拟生成
- 不能长期保存历史
- 不能做真实用户系统、订单、会员

步骤：

```bash
npm run build
```

把 `dist/` 部署到：

- Vercel
- Netlify
- Cloudflare Pages
- 阿里云 OSS + CDN
- 腾讯云 COS + CDN

### 方案 B：前端 + 后端一起上线

适合：真正开始做产品。

优点：

- 用户电脑访问公网地址即可使用
- 可以保存报告历史
- 后续能接登录、支付、会员、订单

缺点：

- 需要云服务器或后端托管
- 需要配置域名、HTTPS、数据库

前端构建：

```bash
npm run build
```

后端启动：

```bash
npm run api
```

生产环境需要设置：

```text
VITE_XUANXUE_API_BASE=https://api.your-domain.com
XUANXUE_API_PORT=8787
```

## 四、推荐你当前采用的路线

现在不要一上来就做复杂架构。建议按顺序：

1. 先把前端部署到 Vercel 或 Cloudflare Pages。
2. 后端先部署到一台云服务器。
3. 把 `reports.json` 替换成数据库。
4. 再接用户登录。
5. 再接订单和支付。
6. 最后做会员和后台管理。

## 五、生产环境必须改掉的点

当前后端还是 MVP，需要逐步升级：

- `server/storage/reports.json` 改成数据库。
- 增加用户表。
- 报告绑定用户 ID。
- 增加订单表。
- 增加支付回调。
- 增加管理员审核。
- 增加内容安全过滤。
- 增加日志和备份。

## 六、域名建议

正式网站建议准备：

```text
www.your-domain.com      前端网站
api.your-domain.com      后端接口
admin.your-domain.com    后台管理，后期再做
```

前端 `.env.production` 示例：

```text
VITE_XUANXUE_API_BASE=https://api.your-domain.com
```

## 七、你本地继续开发怎么跑

本地开发需要两个终端：

终端 1：

```bash
npm run api
```

终端 2：

```bash
npm run dev
```

访问：

```text
http://127.0.0.1:5173
```

## 八、下一步开发建议

下一步建议先做数据库版后端，不要急着接支付。

最小数据库表：

- users：用户
- reports：报告
- intakes：用户提交资料
- products：测算产品
- orders：订单

只有这些打好，网站才从“页面”变成“可运营系统”。
