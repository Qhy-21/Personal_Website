import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('../views/Home.vue') },
  { path: '/about', name: 'About', component: () => import('../views/About.vue') },
  { path: '/skills', name: 'Skills', component: () => import('../views/Skills.vue') },
  { path: '/projects', name: 'Projects', component: () => import('../views/Projects.vue') },
  { path: '/journal', name: 'Journal', component: () => import('../views/Journal.vue') },
  { path: '/contact', redirect: '/about' },
  { path: '/guestbook', name: 'Guestbook', component: () => import('../views/Guestbook.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
