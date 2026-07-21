<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Waline } from '@waline/client/component'
import '@waline/client/style'

const { locale } = useI18n()

const walineLang = computed(() => locale.value === 'zh-CN' ? 'zh-CN' : 'en')
</script>

<template>
  <section class="section">
    <h2 class="section-title">{{ $t('nav.guestbook') }}</h2>
    <div class="pixel-card waline-card">
      <Waline
        serverURL="https://leaveamessage.qhy-alfie.work/"
        path="/guestbook"
        :lang="walineLang"
        dark="html[data-theme='dark']"
        :emoji="['//unpkg.com/@waline/emojis@1.1.0/weibo']"
        :requiredMeta="['nick']"
        :wordLimit="500"
        :pageSize="10"
        commentSorting="latest"
      />
    </div>
  </section>
</template>

<style scoped>
.waline-card {
  padding: 28px 24px;
}
</style>

<style>
/* Waline theme — overrides CSS variables to match the site's dark pixel aesthetic.
   Unscoped so it penetrates Waline's internal DOM; scoped by .waline-card prefix. */
.waline-card [data-waline] {
  --waline-theme-color: var(--accent);
  --waline-active-color: var(--accent-strong);
  --waline-bg-color: var(--bg-card);
  --waline-bg-color-light: var(--bg-elevated);
  --waline-bg-color-hover: rgba(255, 128, 184, 0.06);
  --waline-color: var(--text);
  --waline-border-color: var(--border);
  --waline-info-bg-color: var(--bg-elevated);
  --waline-info-color: var(--text-muted);
  --waline-dark-grey: var(--text-muted);
  --waline-light-grey: var(--text-muted);
  --waline-white: var(--bg-card);
  --waline-font-size: 15px;
  --waline-avatar-radius: 6px;
  --waline-border: 1px solid var(--border);
  --waline-box-shadow: none;
  --waline-code-bg-color: var(--bg-deep);
  --waline-badge-color: var(--accent);
  --waline-bq-color: var(--bg-elevated);
  --waline-disable-bg-color: var(--bg-elevated);
  --waline-disable-color: var(--text-muted);
  --waline-warning-bg-color: rgba(255, 128, 184, 0.08);
  --waline-warning-color: var(--accent-strong);
  --waline-rank-gold-bg-color: var(--accent-strong);
  --waline-rank-silver-bg-color: #b04ad2;
  --waline-rank-copper-bg-color: #4a8ad4;
}

.waline-card .wl-card {
  padding-bottom: 1em;
  border-bottom: 1px dashed var(--border);
}

.waline-card .wl-panel {
  border-radius: var(--radius-md);
}

.waline-card .wl-header {
  border-top-left-radius: var(--radius-md);
  border-top-right-radius: var(--radius-md);
}

.waline-card .wl-editor {
  border-radius: var(--radius-sm);
}

.waline-card .wl-btn {
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--ease-out);
}

.waline-card .wl-btn:hover,
.waline-card .wl-btn:active {
  border-color: var(--accent);
  color: var(--accent);
}

.waline-card .wl-btn.primary {
  background: linear-gradient(135deg, #ff80b8 0%, #ff5090 100%);
  border-color: transparent;
  color: #fff;
}

.waline-card .wl-btn.primary:hover {
  background: linear-gradient(135deg, #ff95c5 0%, #ff6aa5 100%);
}

[data-theme="light"] .waline-card .wl-btn.primary {
  background: linear-gradient(135deg, #d44078 0%, #b81d58 100%);
  color: #fff;
}

[data-theme="light"] .waline-card .wl-btn.primary:hover {
  background: linear-gradient(135deg, #e05588 0%, #c83068 100%);
}

.waline-card .wl-card .wl-quote {
  border-inline-start-color: var(--accent);
  border-inline-start-style: solid;
  opacity: 0.6;
}

.waline-card .wl-card .wl-content.expand::before {
  background: linear-gradient(180deg, transparent, var(--bg-card));
}

.waline-card .wl-card .wl-content.expand::after {
  background: var(--bg-card);
  color: var(--accent);
}

/* Light mode: Waline comment cards need lighter hover backgrounds */
[data-theme="light"] .waline-card [data-waline] {
  --waline-bg-color-hover: rgba(212, 64, 120, 0.04);
  --waline-warning-bg-color: rgba(212, 64, 120, 0.06);
}

[data-theme="light"] .waline-card .wl-card .wl-content.expand::before {
  background: linear-gradient(180deg, transparent, var(--bg-card));
}
</style>
