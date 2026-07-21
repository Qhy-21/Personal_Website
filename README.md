# 羌花吟の个人网站

**Vue 3 + Vite** 全栈式个人主页 · 像素风 · 玻璃态 · 文艺气质

网址：[qhy-alfie.work](https://qhy-alfie.work)

---

## 特性

- **像素风玻璃态设计**：Press Start 2P 像素字体 + 毛玻璃卡片 + 星空网格背景
- **中英双语**：vue-i18n 完整中英文切换，语言选择持久化
- **暗色/亮色主题**：CSS 变量驱动，一键切换含过渡动画
- **粉白矩阵雨开屏动画**：Canvas 绘制的片假名落雨效果，统一粉白配色
- **Waline 评论系统**：留言板集成 Waline，支持登录和表情
- **访客统计**：基于 IP 的访客计数与地域分布展示
- **兴趣标签云**：点击标签弹出详情模态框，含图片轮播与分页阅读
- **书页翻页效果**：碎碎念诗歌以 3D 翻书动画展示，支持 20 秒自动翻页
- **简历内联**：简历内容直接展示在关于页面，无需额外跳转

---

## 技术栈

- **框架：** Vue 3 (Composition API) + Vue Router 4
- **构建：** Vite 5
- **国际化：** vue-i18n
- **评论：** Waline
- **架构：** 组件化 SPA，7 个路由（含 /contact 重定向至 /about）
- **数据：** 本地 JS 数据模块驱动（技能、项目、日记、兴趣、ML 知识树）
- **部署：** Vite build → Vercel

## 项目结构

```
├── src/
│   ├── components/          # 可复用组件
│   │   ├── PixelHeader.vue  # 玻璃态导航栏
│   │   ├── PixelFooter.vue  # 页脚
│   │   ├── MatrixRain.vue   # 粉白矩阵雨开屏动画
│   │   ├── ResumeModal.vue  # 简历模态框（备用）
│   │   └── LoadingScreen.vue # 加载动画
│   ├── views/               # 7 个页面路由
│   │   ├── Home.vue         # 首页（头像、心情、兴趣云）
│   │   ├── About.vue        # 关于（简介、时间轴、联络方式、简历）
│   │   ├── Skills.vue       # 技能树（进度条 + ML 知识树）
│   │   ├── Projects.vue     # 小作品（模态框展示）
│   │   ├── Journal.vue      # 碎碎念（3D 书页翻页）
│   │   └── Guestbook.vue    # 留言板（Waline）
│   ├── data/                # 数据模块
│   │   ├── skills.js        # 技能数据
│   │   ├── projects.js      # 项目数据
│   │   ├── journals.js      # 诗歌数据
│   │   ├── interests.js     # 兴趣标签
│   │   └── ml-knowledge.js  # ML 知识树
│   ├── i18n/locales/        # 中英文翻译文件
│   ├── router/index.js      # Vue Router 配置
│   ├── assets/styles.css    # 全局样式与设计令牌
│   ├── App.vue              # 根组件
│   └── main.js              # 入口
├── public/                  # 静态资源（头像、简历 HTML）
├── index.html
├── vite.config.js
├── vercel.json              # Vercel SPA 路由配置
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
