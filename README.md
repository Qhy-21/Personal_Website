# 羌花吟の个人网站

**Vue 3 + Vite** 全栈式个人主页 · 像素风 · 玻璃态 · 文艺气质

网址：[qhy-alfie.work](https://qhy-alfie.work)

---

## 特性

- **像素风玻璃态设计**：Press Start 2P 像素字体 + 毛玻璃卡片 + 星空网格背景
- **粉白矩阵雨开屏动画**：Canvas 绘制的片假名落雨效果，按任意键或点击进入
- **中英双语**：vue-i18n (Composition API) 完整中英文切换，语言选择 localStorage 持久化
- **暗色/亮色主题**：CSS 变量驱动，一键切换含圆形裁剪过渡动画
- **Waline 评论系统**：留言板集成 Waline，支持登录和表情，EmojiPicker 增强
- **访客统计**：Vercel Serverless Function + Upstash Redis 持久化，IP 地域分布条形图 + 最近访客列表
- **兴趣标签云**：16 个兴趣标签弹跳动画，点击弹出详情模态框（Markdown 描述 + 图片轮播 + 分页阅读）
- **3D 书页翻页**：碎碎念诗歌以翻书动画展示，支持 20 秒自动翻页和手动翻页
- **简历内联**：简历内容直接展示在关于页面，无需额外跳转
- **许嵩歌曲淘汰赛**：Bracket 树淘汰赛交互，歌曲卡片投票，锦标赛制对战

---

## 技术栈

- **框架：** Vue 3 (Composition API) + Vue Router 4
- **构建：** Vite 5
- **国际化：** vue-i18n (Composition API 模式)
- **评论：** Waline
- **架构：** 组件化 SPA，8 条路由（含 /contact 重定向至 /about），全部 lazy-load
- **数据：** 本地 JS 数据模块驱动（技能、项目、日记、兴趣、ML 知识树、许嵩歌曲库）
- **后端：** Vercel Serverless Function（`api/visitor.js`），Upstash Redis 持久化访客计数
- **部署：** Vite build → Vercel（SPA fallback）

## 项目结构

```
├── src/
│   ├── components/          # 可复用组件
│   │   ├── PixelHeader.vue  # 玻璃态导航栏（路由 + 中英/主题切换）
│   │   ├── PixelFooter.vue  # 页脚
│   │   ├── MatrixRain.vue   # 粉白矩阵雨开屏动画（Canvas）
│   │   ├── EmojiPicker.vue  # 留言板表情选择器
│   │   ├── BracketTree.vue  # 许嵩歌曲淘汰赛 Bracket 树
│   │   └── SongCard.vue     # 许嵩歌曲卡片（投票用）
│   ├── views/               # 7 个页面 + 1 个重定向
│   │   ├── Home.vue         # 首页（头像、心情、兴趣云、访客统计）
│   │   ├── About.vue        # 关于（简介、时间轴、联络方式、简历内联）
│   │   ├── Skills.vue       # 技能树（进度条 + ML 知识卡片）
│   │   ├── Projects.vue     # 项目作品（模态框展示）
│   │   ├── Journal.vue      # 碎碎念（3D 书页翻页）
│   │   ├── Guestbook.vue    # 留言板（Waline + EmojiPicker）
│   │   └── XusongBot.vue    # 许嵩歌曲淘汰赛（BracketTree + SongCard）
│   ├── composables/
│   │   └── useTournament.js # 淘汰赛状态管理逻辑
│   ├── data/                # 数据模块
│   │   ├── skills.js        # 技能数据（4 组进度条）
│   │   ├── projects.js      # 项目数据（6 个项目，中英双语）
│   │   ├── journals.js      # 诗歌/碎碎念数据
│   │   ├── interests.js     # 兴趣标签定义（16 个兴趣）
│   │   ├── mlCards.js       # ML 知识树卡片
│   │   ├── interests/       # 各兴趣的描述 Markdown + 配图（15 个子目录）
│   │   └── xusongSongs/     # 许嵩歌曲数据（按专辑分文件，12 个模块）
│   ├── i18n/
│   │   ├── index.js         # vue-i18n 配置（Composition API，legacy: false）
│   │   └── locales/         # zh-CN.json / en.json
│   ├── router/index.js      # Vue Router 配置（全部路由 lazy-load）
│   ├── assets/styles.css    # 全局设计令牌（CSS 变量）+ 基础样式 + 动画
│   ├── App.vue              # 根组件（splash → 主题/背景/布局）
│   └── main.js              # 入口
├── api/
│   └── visitor.js           # Vercel Serverless 访客计数（Upstash Redis REST API）
├── public/                  # 静态资源
│   ├── avatar.png
│   ├── Qhy_introduction.html
│   └── wechat-qr.jpg
├── _archive/                # 已归档的旧文件（.gitignore）
├── index.html
├── vite.config.js
├── vercel.json              # Vercel SPA 路由 fallback
├── package.json
└── .gitignore
```

## 本地运行

```bash
npm install
npm run dev
```

访问 http://localhost:5173

## 部署

```bash
npm run build      # 输出到 dist/
```

连接到 Vercel 自动部署，Framework 自动识别为 Vite。
