<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
const { t, locale } = useI18n()
const route = useRoute()
const year = new Date().getFullYear()
</script>
<template>
  <footer class="site-footer">
    <div class="footer-signature"><span class="pixel-spark" aria-hidden="true"></span><span>{{ t('footer.left', { year }) }}</span></div>
    <span class="footer-note">{{ t('footer.right2') }}</span>
    <router-link v-if="route.path !== '/'" to="/guestbook" class="footer-link">{{ locale === 'en' ? 'Leave a little trace' : '来过，就留下一点痕迹' }}<span aria-hidden="true">↗</span></router-link>
  </footer>
</template>
<style scoped>
.site-footer { display: flex; justify-content: space-between; align-items: center; gap: 24px; margin-top: 64px; padding: 28px 0 0; border-top: 1px solid var(--border); color: var(--text-muted); font-size: 12px; }
.footer-signature { display: flex; gap: 14px; align-items: center; }
.footer-note { letter-spacing: .08em; }
.footer-link { display: inline-flex; align-items: center; gap: 16px; min-height: 44px; color: var(--text-muted); }
.footer-link:hover { color: var(--accent); }
@media (max-width: 640px) { .site-footer { flex-wrap: wrap; gap: 12px; margin-top: 40px; padding-top: 20px; } .footer-note { display: none; } .footer-link { font-size: 11px; gap: 8px; } }
</style>
