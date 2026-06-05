# 羌花吟の个人网站

**Vue 3 + Vite** 全栈式个人主页 · 像素风 · 文艺气质

网址：[qhy-alfie.work](https://qhy-alfie.work) · 简历：[qhy-alfie.work/Qhy_introduction.html](https://qhy-alfie.work/Qhy_introduction.html)

---

## 技术栈

- **框架：** Vue 3 (Composition API) + Vue Router
- **构建：** Vite 5
- **架构：** 组件化 SPA，6 个页面由 Vue Router 管理
- **数据：** 本地 JS 数据模块驱动
- **部署：** Vite build → Vercel

## 项目结构

```
├── src/
│   ├── components/       # 可复用组件（Header, Footer）
│   ├── views/            # 6 个页面（首页/关于/技能/作品/日记/联络）
│   ├── data/             # 数据模块（技能/项目/日记/兴趣/ML知识）
│   ├── router/           # Vue Router 配置
│   ├── assets/           # 全局样式
│   ├── App.vue           # 根组件（含像素风启动动画）
│   └── main.js           # 入口
├── public/               # 静态资源（头像、简历）
├── index.html
├── vite.config.js
├── vercel.json           # Vercel SPA 路由配置
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
