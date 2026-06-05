# 羌花吟の个人网站

**Vue 3 + Vite** 全栈式个人主页 · 像素风 + 文艺气质

网址：[qhy-alfie.work](https://qhy-alfie.work)

## 技术栈

- **前端：** Vue 3 (Composition API) + Vue Router + Vite
- **架构：** 组件化 SPA，6 个页面由 Vue Router 管理
- **数据：** 本地 JS 数据模块驱动（src/data/）
- **部署：** Vite build → Vercel

## 项目结构

```
frontend/
├── src/
│   ├── components/     # 可复用组件（Header, Footer）
│   ├── views/          # 6 个页面视图
│   ├── data/           # 数据模块（技能/项目/日记/兴趣/ML知识）
│   ├── router/         # Vue Router 配置
│   ├── assets/         # 全局样式
│   ├── App.vue         # 根组件（含启动动画）
│   └── main.js         # 入口
├── public/             # 静态资源（头像、简历）
├── index.html
├── vite.config.js
└── vercel.json         # Vercel SPA 路由配置
```

## 本地运行

```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:5173

## 构建部署

```bash
cd frontend
npm run build     # 输出到 dist/
```

### Vercel 部署

1. 将仓库连接到 Vercel
2. **Root Directory** 设为 `frontend/`
3. Framework 自动识别为 Vite
4. 部署完成
