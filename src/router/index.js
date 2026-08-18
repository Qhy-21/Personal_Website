import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('../views/Home.vue') },
  { path: '/about', name: 'About', component: () => import('../views/About.vue') },
  { path: '/skills', name: 'Skills', component: () => import('../views/Skills.vue') },
  { path: '/projects', name: 'Projects', component: () => import('../views/Projects.vue') },
  { path: '/journal', name: 'Journal', component: () => import('../views/Journal.vue') },
  // Articles (文章)
  { path: '/journal/articles', name: 'JournalArticles', component: () => import('../views/JournalDetail.vue') },
  { path: '/journal/articles/:slug', name: 'JournalArticle', component: () => import('../views/JournalDetail.vue') },
  // Essays (随笔)
  { path: '/journal/essays', name: 'JournalEssays', component: () => import('../views/JournalDetail.vue') },
  { path: '/journal/essays/:slug', name: 'JournalEssay', component: () => import('../views/JournalDetail.vue') },
  // Poems (诗歌)
  { path: '/journal/poems', name: 'JournalPoems', component: () => import('../views/JournalDetail.vue') },
  { path: '/journal/poems/:slug', name: 'JournalPoem', component: () => import('../views/JournalDetail.vue') },
  { path: '/contact', redirect: '/about' },
  { path: '/guestbook', name: 'Guestbook', component: () => import('../views/Guestbook.vue') },
  { path: '/xusong-bot', name: 'XusongBot', component: () => import('../views/XusongBot.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
