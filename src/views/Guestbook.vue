<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Waline } from '@waline/client/component'
import '@waline/client/style'
import EmojiPicker from '../components/EmojiPicker.vue'
import PageIntro from '../components/PageIntro.vue'

const { t, locale } = useI18n()
const isEnglish = computed(() => locale.value === 'en')
const walineLang = computed(() => isEnglish.value ? 'en' : 'zh-CN')
</script>

<template>
  <section class="guestbook-page">
    <PageIntro
      eyebrow="LEAVE A LITTLE SOMETHING"
      :title="t('nav.guestbook')"
      :description="isEnglish ? 'Glad our paths crossed. Leave a thought, a favorite line, or simply say hello.' : '很高兴，在这里遇见你。留下一点想法、一句喜欢的话，或者简单地打个招呼。'"
    >
      <span class="guestbook-note">{{ isEnglish ? 'A small corner for conversations.' : '让路过，变成一次相遇。' }}</span>
    </PageIntro>

    <div class="guestbook-layout">
      <aside class="guestbook-welcome">
        <span class="welcome-pixel" aria-hidden="true"></span>
        <h2>{{ isEnglish ? 'Make yourself at home.' : '像朋友一样，坐下来聊聊。' }}</h2>
        <p>{{ isEnglish ? 'Code, books, music, or life lately — there is always something to talk about.' : '关于代码、书、音乐，或是最近的生活，都可以。' }}</p>
        <p class="guestbook-tip">{{ isEnglish ? 'Choose a nickname to join the conversation. Messages can be up to 500 characters.' : '起一个昵称，就可以加入这场对话。每条留言最多 500 字。' }}</p>
      </aside>
      <div class="waline-card">
        <EmojiPicker />
        <Waline
          serverURL="https://leaveamessage.qhy-alfie.work/"
          path="/guestbook"
          :lang="walineLang"
          dark="html[data-theme='dark']"
          :emoji="[]"
          :requiredMeta="['nick']"
          :wordLimit="500"
          :pageSize="10"
          commentSorting="latest"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.guestbook-page { padding-bottom: 32px; }
.guestbook-note { display: block; color: var(--text-muted); font-family: var(--font-display); font-size: 15px; }
.guestbook-layout { display: grid; grid-template-columns: minmax(0, .65fr) minmax(0, 1.7fr); align-items: start; gap: clamp(32px, 5vw, 64px); }
.guestbook-welcome { position: sticky; top: var(--header-offset, 128px); align-self: start; max-height: calc(100dvh - var(--header-offset, 128px) - 24px); overflow-y: auto; padding-top: 26px; }
.welcome-pixel { display: block; width: 12px; height: 12px; margin-bottom: 25px; border-radius: 3px; background: var(--accent-light); box-shadow: 5px -5px 0 var(--accent); }
.guestbook-welcome h2 { margin: 0 0 15px; font-family: var(--font-display); font-size: 23px; font-weight: 500; line-height: 1.7; }
.guestbook-welcome p { margin: 0; color: var(--text-muted); font-size: 14px; line-height: 1.9; }
.guestbook-welcome .guestbook-tip { margin-top: 28px; padding-top: 20px; border-top: 1px solid var(--border); font-size: 13px; }
.waline-card { min-width: 0; padding: 28px; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-card); box-shadow: var(--shadow-sm); }
@media (max-width: 760px) {
  .guestbook-layout { grid-template-columns: 1fr; gap: 24px; }
  .guestbook-welcome { position: static; max-height: none; overflow-y: visible; padding-top: 0; }
  .welcome-pixel { display: none; }
  .guestbook-welcome h2 { margin-bottom: 7px; font-size: 21px; }
  .guestbook-welcome .guestbook-tip { margin-top: 10px; padding-top: 0; border: 0; }
  .guestbook-welcome p { font-size: 15px; }
  .waline-card { padding: 22px 18px; }
}
@media (max-width: 640px) {
  .guestbook-page { padding-bottom: 16px; }
  .guestbook-note { font-size: 13px; line-height: 1.6; }
  .guestbook-layout { gap: 14px; }
  .guestbook-welcome h2 { margin-bottom: 4px; font-size: 17px; line-height: 1.5; }
  .guestbook-welcome p { font-size: 14px; line-height: 1.65; }
  .guestbook-welcome .guestbook-tip { margin-top: 5px; font-size: 12px; line-height: 1.6; }
  .waline-card { padding: 14px 12px; }
}
</style>

<style>
/* Keep the hosted comment service within the site's semantic theme. */
.waline-card [data-waline] {
  --waline-theme-color: var(--accent-strong);
  --waline-active-color: var(--accent);
  --waline-bg-color: var(--bg-card);
  --waline-bg-color-light: var(--bg-elevated);
  --waline-bg-color-hover: var(--accent-light);
  --waline-color: var(--text);
  --waline-border-color: var(--border-strong);
  --waline-info-bg-color: var(--bg-elevated);
  --waline-info-color: var(--text-muted);
  --waline-dark-grey: var(--text-muted);
  --waline-light-grey: var(--text-muted);
  --waline-white: var(--bg-card);
  --waline-font-size: 15px;
  --waline-avatar-radius: 10px;
  --waline-border: 1px solid var(--border-strong);
  --waline-box-shadow: none;
  --waline-code-bg-color: var(--bg-elevated);
  --waline-badge-color: var(--accent-strong);
  --waline-bq-color: var(--bg-elevated);
  --waline-disable-bg-color: var(--bg-elevated);
  --waline-disable-color: var(--text-muted);
  --waline-warning-bg-color: var(--accent-light);
  --waline-warning-color: var(--accent-strong);
  --waline-rank-gold-bg-color: var(--accent-strong);
  --waline-rank-silver-bg-color: var(--text-muted);
  --waline-rank-copper-bg-color: var(--text-muted);
}
.waline-card .wl-card { padding-bottom: 1.3em; border-bottom: 1px solid var(--border); }
.waline-card .wl-panel { border-radius: var(--radius-md); }
.waline-card .wl-header { border-radius: var(--radius-md) var(--radius-md) 0 0; }
.waline-card .wl-editor { min-height: 150px; border-radius: var(--radius-sm); line-height: 1.8; }
.waline-card .wl-input { min-height: 44px; }
.waline-card .wl-editor, .waline-card .wl-input { font-family: var(--font-body), 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji'; }
.waline-card .wl-btn { min-height: 44px; padding-inline: 18px; border-radius: var(--radius-sm); transition: color var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out), background var(--duration-fast) var(--ease-out); }
.waline-card .wl-btn:hover, .waline-card .wl-btn:active { border-color: var(--accent-strong); color: var(--accent-strong); }
.waline-card .wl-btn.primary { background: var(--accent-strong); border-color: var(--accent-strong); color: var(--bg-card); }
.waline-card .wl-btn.primary:hover { background: var(--accent); border-color: var(--accent); color: var(--bg-deep); }
.waline-card .wl-btn:focus-visible, .waline-card .wl-input:focus-visible, .waline-card .wl-editor:focus-visible { outline: 2px solid var(--accent-strong); outline-offset: 3px; }
.waline-card .wl-card .wl-quote { border-inline-start-color: var(--accent); border-inline-start-style: solid; }
.waline-card .wl-card .wl-content.expand::before { background: linear-gradient(180deg, transparent, var(--bg-card)); }
.waline-card .wl-card .wl-content.expand::after { background: var(--bg-card); color: var(--accent-strong); }
/* EmojiPicker supplies emoji; preserve the site's existing upload/preview policy. */
.waline-card .wl-emoji,
.waline-card .wl-action[title="预览"],
.waline-card .wl-action[title="Preview"],
.waline-card .wl-action[href*="guides.github.com"],
.waline-card label[title="上传图片"],
.waline-card label[title="Upload Image"],
.waline-card label[for*="image"],
.waline-card .wl-upload,
.waline-card .wl-meta-foot { display: none; }
@media (max-width: 900px) {
  .waline-card .wl-editor, .waline-card .wl-input { font-size: 16px; }
  .waline-card .wl-action { display: inline-flex; align-items: center; justify-content: center; min-width: 44px; min-height: 44px; padding: 6px; }
}
@media (max-width: 600px) {
  .waline-card .wl-editor { min-height: 112px; }
  .waline-card .wl-header { padding-inline: 6px; }
}
</style>
