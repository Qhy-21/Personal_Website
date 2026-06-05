<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
const navItems = [
  { path: '/', label: '首页' },
  { path: '/about', label: '关于我' },
  { path: '/skills', label: '技能树' },
  { path: '/projects', label: '小作品' },
  { path: '/journal', label: '碎碎念' },
  { path: '/contact', label: '联络' },
]
</script>

<template>
  <header class="pixel-header">
    <div class="site-logo">
      <span class="logo-mark">◆</span>
      <span class="logo-text">羌花吟の个人网站</span>
    </div>
    <nav class="pixel-nav">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        :class="{ 'is-active': route.path === item.path }"
      >
        {{ item.label }}
      </router-link>
    </nav>
  </header>
</template>
