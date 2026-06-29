<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="glass-footer">
    <div class="footer-left">
      <span>{{ t('footer.left', { year }) }}</span>
    </div>
    <div class="footer-center">
      <span class="footer-sep">◆ ◆ ◆</span>
    </div>
    <div class="footer-right">
      <span>{{ t('footer.right1') }}</span>
      <span class="footer-divider">·</span>
      <span>{{ t('footer.right2') }}</span>
    </div>
  </footer>
</template>

<style scoped>
.glass-footer {
  margin-top: 32px;
  padding: 16px 24px;
  background: rgba(18, 18, 26, 0.5);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
  color: var(--text-muted);
  font-family: var(--font-body);
}

.footer-sep {
  color: var(--accent);
  font-size: 10px;
  letter-spacing: 4px;
  opacity: 0.5;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.footer-divider {
  color: rgba(255, 255, 255, 0.15);
}

@media (max-width: 768px) {
  .glass-footer {
    flex-direction: column;
    text-align: center;
    gap: 8px;
    padding: 16px;
  }

  .footer-right {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
