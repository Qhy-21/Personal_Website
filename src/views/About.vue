<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import PageIntro from '../components/PageIntro.vue'
import SiteIcon from '../components/SiteIcon.vue'
import { AVATAR } from '../constants/assets.js'

const { t, locale } = useI18n()
const isEnglish = computed(() => locale.value === 'en')
const timelineEntries = [
  { id: '2023', year: '2023', titleKey: 'tl2023Title', textKey: 'tl2023Text' },
  { id: '2024', year: '2024', titleKey: 'tl2024Title', textKey: 'tl2024Text' },
  { id: '2025', year: '2025', titleKey: 'tl2025Title', textKey: 'tl2025Text' },
  { id: 'early-2026', year: '2026', titleKey: 'tl2026Title', textKey: 'tl2026Text' },
  { id: 'mid-2026', year: '2026', titleKey: 'tl2026MidTitle', textKey: 'tl2026MidText' },
  { id: 'late-2026', year: '2026', titleKey: 'tl2026LateTitle', current: true },
] as const
const profileDetails = computed(() => [
  { label: t('about.location'), value: t('about.locationValue') },
  { label: t('about.age'), value: t('about.ageValue') },
  { label: t('about.school'), value: t('about.schoolValue') },
  { label: t('about.phone'), value: '151********' },
])
</script>

<template>
  <div class="about-page">
    <PageIntro
      eyebrow="A LITTLE ABOUT ME"
      :title="isEnglish ? 'The person behind the pixels.' : '像素背后，是这样的我。'"
      :description="isEnglish ? 'A place for the code I write, the things I love, and the person I am becoming.' : '这里放着我写过的代码、喜欢的事物，还有一点正在成为自己的过程。'"
    />

    <section class="profile-section" aria-labelledby="profile-name">
      <div class="profile-identity">
        <div class="profile-avatar-wrap">
          <img :src="AVATAR" :alt="isEnglish ? 'Alfie’s avatar' : '羌花吟的头像'" width="112" height="112" class="profile-avatar">
          <span class="avatar-pixel-mark" aria-hidden="true"></span>
        </div>
        <div>
          <p class="profile-alias">{{ isEnglish ? '羌花吟 / QHY' : 'QHY / ALFIE' }}</p>
          <h2 id="profile-name">{{ isEnglish ? 'Alfie' : '羌花吟' }}</h2>
          <p class="profile-role">{{ t('about.role') }}</p>
        </div>
      </div>
      <p class="profile-thought">{{ t('about.slogan') }}</p>
    </section>

    <div class="about-content">
      <section class="personal-details" aria-labelledby="details-title">
        <div class="section-heading">
          <span class="section-kicker">PROFILE</span>
          <h2 id="details-title">{{ t('about.basicInfo') }}</h2>
        </div>
        <dl class="profile-facts">
          <div v-for="detail in profileDetails" :key="detail.label" class="profile-fact">
            <dt>{{ detail.label }}</dt>
            <dd>{{ detail.value }}</dd>
          </div>
        </dl>
        <div class="profile-links">
          <a href="https://qhy-alfie.work" target="_blank" rel="noopener noreferrer">
            <span><span class="link-label">{{ t('about.website') }}</span>qhy-alfie.work</span>
            <SiteIcon name="arrow-up-right" aria-hidden="true" />
          </a>
          <a href="https://github.com/Qhy-21" target="_blank" rel="noopener noreferrer">
            <span><span class="link-label">GitHub</span>github.com/Qhy-21</span>
            <SiteIcon name="arrow-up-right" aria-hidden="true" />
          </a>
          <a href="mailto:zhf1830657854@163.com">
            <span><span class="link-label">{{ t('about.email') }}</span>zhf1830657854@163.com</span>
            <SiteIcon name="arrow-up-right" aria-hidden="true" />
          </a>
        </div>
      </section>

      <section class="journey-section" aria-labelledby="journey-title">
        <div class="section-heading">
          <span class="section-kicker">ALONG THE WAY</span>
          <h2 id="journey-title">{{ isEnglish ? 'A few steps along the way' : '慢慢走过的路' }}</h2>
        </div>
        <ol class="journey-list">
          <li v-for="entry in timelineEntries" :key="entry.id" class="journey-step" :class="{ 'is-current': 'current' in entry && entry.current }">
            <span class="journey-year" aria-hidden="true">{{ entry.year }}</span>
            <div class="journey-copy">
              <h3>{{ t(`about.${entry.titleKey}`) }}</h3>
              <p v-if="'textKey' in entry">{{ t(`about.${entry.textKey}`) }}</p>
            </div>
          </li>
        </ol>
      </section>
    </div>

    <aside class="future-letter" aria-labelledby="letter-title">
      <div class="letter-heading">
        <span class="section-kicker">A NOTE TO MY FUTURE SELF</span>
        <h2 id="letter-title">{{ t('contact.messageToFuture') }}</h2>
      </div>
      <div class="letter-copy">
        <p>{{ t('contact.msg1') }}</p>
        <p>{{ t('contact.msg2') }}</p>
        <span class="letter-signature">{{ isEnglish ? '— Alfie' : '—— 羌花吟' }}</span>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.about-page { padding-bottom: 24px; }
.profile-section { display: flex; align-items: center; justify-content: space-between; gap: 36px; padding: 36px 40px; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-card); box-shadow: var(--shadow-sm); }
.profile-identity { display: flex; align-items: center; gap: 28px; min-width: 0; }
.profile-avatar-wrap { position: relative; flex: 0 0 112px; }
.profile-avatar { display: block; border-radius: 24px; object-fit: cover; background: var(--bg-elevated); }
.avatar-pixel-mark { position: absolute; bottom: -5px; right: -5px; width: 18px; height: 18px; background: var(--accent); border: 4px solid var(--bg-card); border-radius: 5px; }
.profile-alias { margin: 0 0 5px; color: var(--text-muted); font: 11px/1.6 var(--font-mono); letter-spacing: .16em; }
.profile-identity h2 { margin: 0; font-family: var(--font-display); font-size: clamp(28px, 3vw, 38px); font-weight: 500; line-height: 1.4; }
.profile-role { margin: 8px 0 0; color: var(--text-muted); font-size: 14px; overflow-wrap: anywhere; }
.profile-thought { flex: 0 1 230px; margin: 0; padding-left: 28px; border-left: 1px solid var(--border-strong); color: var(--text-muted); font-family: var(--font-display); font-size: 17px; line-height: 1.9; }
.about-content { display: grid; grid-template-columns: minmax(0, .82fr) minmax(0, 1.35fr); gap: clamp(40px, 6vw, 88px); margin: 64px 0 68px; }
.section-heading { margin-bottom: 26px; }
.section-kicker { display: block; color: var(--text-muted); font: 10px/1.7 var(--font-mono); letter-spacing: .14em; }
.section-heading h2, .letter-heading h2 { margin: 7px 0 0; font-family: var(--font-display); font-weight: 500; font-size: 25px; line-height: 1.5; }
.profile-facts { margin: 0; }
.profile-fact { display: grid; grid-template-columns: 64px minmax(0, 1fr); gap: 18px; padding: 13px 0; border-bottom: 1px solid var(--border); font-size: 14px; }
.profile-fact dt { color: var(--text-muted); }
.profile-fact dd { margin: 0; overflow-wrap: anywhere; }
.profile-links { display: grid; gap: 2px; margin-top: 24px; }
.profile-links a { display: flex; min-height: 64px; align-items: center; justify-content: space-between; gap: 16px; padding: 9px 0; color: var(--text); font-size: 14px; }
.profile-links a > span { min-width: 0; overflow-wrap: anywhere; }
.link-label { display: block; margin-bottom: 2px; color: var(--text-muted); font-size: 12px; }
.profile-links svg { width: 17px; height: 17px; flex-shrink: 0; color: var(--text-muted); transition: color var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-out); }
.profile-links a:hover { color: var(--accent-strong); }
.profile-links a:hover svg { color: var(--accent-strong); transform: translate(2px, -2px); }
.journey-list { margin: 0; padding: 0; list-style: none; }
.journey-step { position: relative; display: grid; grid-template-columns: 52px minmax(0, 1fr); gap: 27px; padding-bottom: 30px; }
.journey-step:last-child { padding-bottom: 0; }
.journey-year { position: relative; padding-top: 3px; color: var(--text-muted); font: 12px/1.7 var(--font-mono); }
.journey-year::after { position: absolute; right: -18px; top: 10px; content: ''; width: 5px; height: 5px; border-radius: 1px; background: var(--border-strong); }
.journey-step::before { position: absolute; left: 67px; top: 22px; bottom: -3px; width: 1px; background: var(--border); content: ''; }
.journey-step:last-child::before { display: none; }
.journey-copy { min-width: 0; }
.journey-copy h3 { margin: 0; font-size: 15px; font-weight: 600; line-height: 1.7; }
.journey-copy p { margin: 7px 0 0; color: var(--text-muted); font-size: 14px; line-height: 1.85; }
.is-current .journey-year { color: var(--accent-strong); }
.is-current .journey-year::after { background: var(--accent); box-shadow: 0 0 0 4px var(--accent-light); }
.is-current h3 { color: var(--accent-strong); }
.future-letter { display: grid; grid-template-columns: minmax(0, .82fr) minmax(0, 1.35fr); gap: clamp(40px, 6vw, 88px); padding: 36px 0 0; border-top: 1px solid var(--border-strong); }
.letter-copy p { margin: 0 0 12px; color: var(--text-muted); font-family: var(--font-display); font-size: 18px; line-height: 1.9; }
.letter-signature { display: block; margin-top: 22px; color: var(--text-muted); font-size: 13px; text-align: right; }
@media (max-width: 900px) {
  .profile-section { padding: 30px; gap: 24px; }
  .profile-identity { gap: 20px; }
  .profile-thought { flex-basis: 190px; font-size: 15px; padding-left: 20px; }
  .about-content, .future-letter { gap: 40px; }
}
@media (max-width: 680px) {
  .profile-section { align-items: stretch; flex-direction: column; padding: 26px 22px; gap: 24px; }
  .profile-avatar-wrap { flex-basis: 80px; }
  .profile-avatar { width: 80px; height: 80px; border-radius: 18px; }
  .profile-identity { gap: 18px; }
  .profile-identity h2 { font-size: 29px; }
  .profile-role { font-size: 13px; }
  .profile-thought { flex-basis: auto; padding: 18px 0 0; border-left: none; border-top: 1px solid var(--border); font-size: 15px; }
  .about-content, .future-letter { grid-template-columns: 1fr; gap: 42px; }
  .about-content { margin: 44px 0 48px; }
  .section-heading { margin-bottom: 19px; }
  .profile-fact, .profile-links a { font-size: 15px; }
  .journey-copy p { font-size: 15px; }
  .future-letter { gap: 22px; padding-top: 30px; }
  .letter-copy p { font-size: 17px; }
}
</style>
