<script setup lang="ts">
import { computed, defineAsyncComponent, defineComponent, h, nextTick, onMounted, onUnmounted, shallowRef, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import interestsData from '../data/interests.js'
import VisitorStats from '../components/VisitorStats.vue'
import SiteIcon from '../components/SiteIcon.vue'
import { useDialog } from '../composables/useDialog'
import { AVATAR } from '../constants/assets.js'
import { shuffle } from '../utils/shuffle.js'

type Interest = typeof interestsData[number]
type Country = { name: string; count: number }
type Visit = { country: string; city: string; time: string }
const { t, locale } = useI18n()
const isEnglish = computed(() => locale.value === 'en')
const activeInterest = shallowRef<Interest | null>(null)
function interestLoadState(failed: boolean, dialogRef: Ref<HTMLElement | null>) {
  return h('div', { class: 'home-modal', onClick: (event: MouseEvent) => { if (event.target === event.currentTarget) onInterestClose() } }, [
    h('div', { ref: dialogRef, class: 'interest-load-state', role: 'dialog', tabindex: -1, 'aria-modal': 'true', 'aria-label': isEnglish.value ? 'Interest details' : '兴趣详情' }, [
      h('p', { role: failed ? 'alert' : 'status' }, failed
        ? (isEnglish.value ? 'The details could not be loaded. Reload the page to try again.' : '详情未能加载，请重新加载页面后重试。')
        : (isEnglish.value ? 'Loading details…' : '正在加载详情…')),
      ...(failed ? [h('button', { type: 'button', class: 'btn', onClick: () => window.location.reload() }, isEnglish.value ? 'Reload page' : '重新加载页面')] : []),
      h('button', { type: 'button', class: 'btn btn-ghost', onClick: onInterestClose }, isEnglish.value ? 'Close' : '关闭'),
    ]),
  ])
}
function interestStateComponent(failed: boolean) {
  return defineComponent({
    setup() {
      const open = computed({ get: () => Boolean(activeInterest.value), set: value => { if (!value) onInterestClose() } })
      const { dialogRef } = useDialog(open)
      return () => interestLoadState(failed, dialogRef)
    },
  })
}
function createInterestModal() {
  return defineAsyncComponent({
    loader: () => import('../components/InterestModal.vue'),
    delay: 120,
    timeout: 15000,
    loadingComponent: interestStateComponent(false),
    errorComponent: interestStateComponent(true),
  })
}
const InterestModal = shallowRef(createInterestModal())
const dismissedTags = shallowRef(new Set<string>())
const avatarModalOpen = shallowRef(false)
const qrModalOpen = shallowRef(false)
const visitorOpen = shallowRef(false)
const visitorTotal = shallowRef<number | null>(null)
const visitorCountries = shallowRef<Country[]>([])
const visitorRecent = shallowRef<Visit[]>([])
const visitorFailed = shallowRef(false)
const { dialogRef: avatarDialogRef } = useDialog(avatarModalOpen)
const { dialogRef: qrDialogRef } = useDialog(qrModalOpen)
const visitorRequest = new AbortController()
const interests = shuffle(interestsData) as Interest[]
const interestCloudRef = shallowRef<HTMLElement | null>(null)
const tagColors = ['#bb386c', '#ab3a70', '#9342b4', '#7550bc', '#6255a1', '#3970ad', '#316f98', '#227c7a', '#237b63', '#4c773b', '#aa442f', '#aa5b2b']
const tagStyles = interests.map((item, index) => ({
  '--tag-size': `${14 + item.weight * 4 + Math.floor(Math.random() * 6)}px`,
  '--tag-color': tagColors[index % tagColors.length],
  '--tag-angle': `${Math.round(Math.random() * 8 - 4)}deg`,
  '--tag-delay': `${index * .035}s`,
}))
function tagLabel(item: Interest) { return isEnglish.value && item.textEn ? item.textEn : item.text }
function dismissAndOpen(item: Interest) {
  dismissedTags.value = new Set([...dismissedTags.value, item.id])
  activeInterest.value = item
}
async function onInterestClose() {
  activeInterest.value = null
  const exploredAll = dismissedTags.value.size >= interests.length
  if (exploredAll) dismissedTags.value = new Set()
  await nextTick()
  // The trigger has disappeared: continue from the next available interest.
  interestCloudRef.value?.querySelector<HTMLButtonElement>('.cloud-tag:not(:disabled)')?.focus({ preventScroll: true })
  if (exploredAll) qrModalOpen.value = true
}
async function fetchVisitor() {
  try {
    const response = await fetch('/api/visitor', { cache: 'no-store', signal: visitorRequest.signal })
    if (!response.ok) throw new Error('Visitor service unavailable')
    const data = await response.json()
    if (!Number.isFinite(data.total) || data.total < 0) throw new Error('Invalid visit count')
    visitorTotal.value = data.total
    visitorCountries.value = data.countries || []
    visitorRecent.value = data.recent || []
  } catch {
    if (!visitorRequest.signal.aborted) visitorFailed.value = true
  }
}
onMounted(fetchVisitor)
onUnmounted(() => visitorRequest.abort())
</script>

<template>
  <section class="home-hero" aria-labelledby="home-title">
    <div class="hero-copy">
      <p class="eyebrow"><span class="pixel-spark" aria-hidden="true"></span>{{ isEnglish ? 'A personal space on the internet' : '一个写代码，也写字的人' }}</p>
      <h1 id="home-title" class="hero-title">{{ t('home.greeting') }}<span class="title-stop" aria-hidden="true">.</span></h1>
      <p class="hero-subtitle">{{ t('home.subtitle') }}</p>
      <p class="hero-text">{{ t('home.intro') }}</p>
      <div class="hero-footnote">
        <span class="status-marker" aria-hidden="true"></span><span>{{ t('home.status') }}</span>
      </div>
    </div>
    <div class="hero-scene">
      <div class="pixel-window">
        <div class="window-bar"><span class="window-dots" aria-hidden="true"><i></i><i></i><i></i></span><span>somewhere, in my pixel world</span><span class="window-corner" aria-hidden="true">↗</span></div>
        <button type="button" class="scene-button" @click="avatarModalOpen = true" :aria-label="isEnglish ? 'Enlarge the illustration' : '放大这幅插画'">
          <img :src="AVATAR" width="540" height="540" :alt="isEnglish ? 'A white car beside a golden field under a blue sky' : '蓝天下的金色田野，一辆白色小车停在路边'" class="scene-image" fetchpriority="high">
          <span class="scene-enlarge"><SiteIcon name="arrow-up-right" :size="18" /></span>
        </button>
        <div class="window-caption"><span>{{ isEnglish ? 'A little room, a wider world.' : '小小的房间，大大的世界。' }}</span><span class="caption-signature">QHY</span></div>
      </div>
      <div class="mood-note"><span class="mood-label">{{ isEnglish ? 'A MOMENT' : '此刻 · A MOMENT' }}</span><p>{{ t('home.mood') }}</p></div>
    </div>
  </section>

  <section class="interest-section" aria-labelledby="interest-title">
    <header class="interest-heading">
      <div><p class="eyebrow">FRAGMENTS OF ME</p><h2 id="interest-title">{{ isEnglish ? 'The things that make me, me.' : '构成我的一些碎片' }}</h2></div>
      <p>{{ isEnglish ? 'Pick a word. Get to know me a little.' : '点开一个词，认识多一点的我。' }}</p>
    </header>
    <div ref="interestCloudRef" class="interest-cloud">
      <button v-for="(item, index) in interests" :key="item.id" type="button" class="cloud-tag jelly" :class="{ 'tag-gone': dismissedTags.has(item.id) }" :style="tagStyles[index]" :disabled="dismissedTags.has(item.id)" :aria-hidden="dismissedTags.has(item.id) ? true : undefined" :aria-label="(isEnglish ? 'Explore ' : '了解') + tagLabel(item)" @click="dismissAndOpen(item)">
        {{ tagLabel(item) }}
      </button>
    </div>
    <div class="interest-foot"><span>{{ isEnglish ? 'Curiosity is a way of life.' : '对世界保持好奇。' }}</span><span class="explore-progress">{{ isEnglish ? 'EXPLORED' : '已探索' }}<b>{{ String(dismissedTags.size).padStart(2, '0') }}</b><span>/ {{ interests.length }}</span></span></div>
  </section>

  <div class="visitor-line">
    <button v-if="visitorTotal !== null" type="button" class="visitor-count" @click="visitorOpen = true"><SiteIcon name="globe" :size="14" />{{ t('home.visitorCount', { n: visitorTotal.toLocaleString() }) }}<SiteIcon name="arrow-up-right" :size="13" /></button>
    <span v-else-if="visitorFailed" class="visitor-unavailable">{{ isEnglish ? 'Visitor statistics are taking a little break.' : '访客统计暂时休息中。' }}</span>
  </div>

  <Teleport to="body">
    <Transition name="modal"><div v-if="avatarModalOpen" class="home-modal" @click.self="avatarModalOpen = false"><div ref="avatarDialogRef" class="avatar-dialog" role="dialog" aria-modal="true" :aria-label="isEnglish ? 'Illustration' : '插画大图'" tabindex="-1"><button type="button" class="dialog-close icon-button" @click="avatarModalOpen = false" :aria-label="isEnglish ? 'Close' : '关闭'"><SiteIcon name="close" /></button><img :src="AVATAR" width="540" height="540" :alt="isEnglish ? 'A white car beside a golden field' : '停在金色田野旁的白色小车'"></div></div></Transition>
    <Transition name="modal"><div v-if="qrModalOpen" class="home-modal" @click.self="qrModalOpen = false"><div ref="qrDialogRef" class="qr-dialog" role="dialog" aria-modal="true" aria-labelledby="qr-title" tabindex="-1"><button type="button" class="dialog-close icon-button" @click="qrModalOpen = false" :aria-label="isEnglish ? 'Close' : '关闭'"><SiteIcon name="close" /></button><p class="eyebrow">NICE TO MEET YOU</p><h2 id="qr-title">{{ isEnglish ? 'Let’s be friends.' : '很高兴，你看到了这里。' }}</h2><img src="/wechat-qr.jpg" width="200" height="200" :alt="isEnglish ? 'WeChat QR code' : '微信二维码'"><p>{{ t('home.qrFriendText') }}</p></div></div></Transition>
  </Teleport>
  <InterestModal v-if="activeInterest" :interest="activeInterest" :locale="locale" @close="onInterestClose" />
  <VisitorStats :total="visitorOpen ? visitorTotal : null" :countries="visitorCountries" :recent="visitorRecent" :locale="locale" @close="visitorOpen = false" />
</template>

<style scoped>
.home-hero { display: grid; grid-template-columns: 1.08fr 1fr; align-items: center; gap: clamp(32px, 6vw, 88px); padding: 40px 0 64px; }
.hero-copy { min-width: 0; padding-bottom: 20px; }
.hero-title { font: 500 clamp(54px, 6.6vw, 82px)/1.3 var(--font-display); letter-spacing: .1em; margin: 24px 0 10px; overflow-wrap: anywhere; }
.title-stop { color: var(--accent); letter-spacing: 0; }
.hero-subtitle { font: 400 clamp(20px, 2.5vw, 28px)/1.6 var(--font-display); letter-spacing: .07em; margin: 0 0 24px; color: var(--text); }
.hero-text { font-size: 15px; line-height: 2; color: var(--text-muted); white-space: pre-line; margin: 0 0 28px; max-width: 420px; }
.hero-footnote { display: flex; align-items: center; gap: 8px; margin-top: 30px; font-size: 11px; color: var(--text-muted); }
.status-marker { width: 5px; height: 5px; background: var(--sage); border-radius: 50%; }
.hero-scene { min-width: 0; padding: 8px 0 0; }
.pixel-window { padding: 0 10px; background: var(--bg-card); border: 1px solid var(--border-strong); border-radius: 12px; box-shadow: 9px 9px 0 var(--bg-elevated); overflow: hidden; transform: rotate(1.5deg); }
.window-bar { height: 38px; display: flex; align-items: center; justify-content: space-between; gap: 8px; font: 9px/1 var(--font-mono); color: var(--text-muted); }
.window-dots { display: flex; gap: 4px; }
.window-dots i { width: 5px; height: 5px; background: var(--border-strong); }
.window-dots i:first-child { background: var(--accent); }
.window-corner { font-size: 16px; }
.scene-button { position: relative; display: block; width: 100%; padding: 0; border: 0; background: var(--bg-elevated); overflow: hidden; border-radius: 3px; }
.scene-image { display: block; width: 100%; height: auto; aspect-ratio: 1.35; object-fit: cover; object-position: center bottom; transition: transform var(--duration-normal); }
.scene-button:hover .scene-image { transform: scale(1.025); }
.scene-enlarge { display: grid; place-items: center; position: absolute; bottom: 10px; right: 10px; height: 32px; width: 32px; background: var(--bg-card); color: var(--text); border-radius: 50%; }
.window-caption { display: flex; justify-content: space-between; align-items: center; gap: 12px; min-height: 45px; font-size: 11px; color: var(--text-muted); padding-inline: 2px; }
.caption-signature { font: 8px/1 var(--font-pixel); color: var(--accent); }
.mood-note { padding: 24px 8px 0 18px; display: flex; align-items: baseline; flex-wrap: wrap; gap: 10px 20px; }
.mood-label { color: var(--text-muted); font: 9px/1.8 var(--font-mono); letter-spacing: .08em; }
.mood-note p { font: 400 17px/1.7 var(--font-display); color: var(--accent); margin: 0; }
.interest-section { padding: 32px 36px 20px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); }
.interest-heading { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; }
.interest-heading .eyebrow { font-size: 10px; }
.interest-heading h2 { font: 500 26px/1.5 var(--font-display); letter-spacing: .04em; margin: 8px 0 0; }
.interest-heading > p { font-size: 12px; color: var(--text-muted); margin: 0 0 4px; }
.interest-cloud { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 20px 28px; padding: 36px 8px; min-height: 220px; }
.cloud-tag { display: block; position: relative; min-width: 0; min-height: 44px; max-width: 100%; overflow-wrap: anywhere; text-align: center; padding: 5px 14px; background: var(--accent-light); border: 1px solid transparent; border-radius: 20px; color: var(--tag-color); font-size: var(--tag-size); line-height: 1.5; transform: rotate(var(--tag-angle)); animation: tagPopIn .5s var(--ease-out) backwards; animation-delay: var(--tag-delay); transition: background .3s ease, border-color .3s ease, box-shadow .3s ease, transform .4s cubic-bezier(.34, 1.56, .64, 1); }
[data-theme="dark"] .cloud-tag { color: color-mix(in srgb, var(--tag-color) 55%, #fff); }
.jelly:hover:not(:disabled), .jelly:focus-visible:not(:disabled) { z-index: 1; animation: jellyBounce .55s cubic-bezier(.34, 1.56, .64, 1); transform: rotate(var(--tag-angle)) scale(1.18); border-color: var(--accent); background: var(--accent-glow); box-shadow: 0 0 20px var(--accent-glow); }
.cloud-tag.tag-gone { animation: tagPopOut .35s var(--ease-out) forwards; pointer-events: none; }
@keyframes tagPopIn { from { opacity: 0; transform: rotate(var(--tag-angle)) scale(.6) translateY(12px); } to { opacity: 1; transform: rotate(var(--tag-angle)) scale(1); } }
@keyframes jellyBounce { 0% { transform: rotate(var(--tag-angle)) scale(1); } 22% { transform: rotate(calc(var(--tag-angle) + 1.2deg)) scale(1.24, .92); } 40% { transform: rotate(calc(var(--tag-angle) - .6deg)) scale(.92, 1.1); } 58% { transform: rotate(calc(var(--tag-angle) + .3deg)) scale(1.07, .96); } 76% { transform: rotate(calc(var(--tag-angle) - .1deg)) scale(.97, 1.02); } 100% { transform: rotate(var(--tag-angle)) scale(1.18); } }
@keyframes tagPopOut { from { opacity: 1; transform: rotate(var(--tag-angle)) scale(1); visibility: visible; } to { opacity: 0; transform: rotate(var(--tag-angle)) scale(.3) translateY(-20px); visibility: hidden; } }
.interest-foot { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding-top: 16px; border-top: 1px solid var(--border); color: var(--text-muted); font-size: 11px; }
.explore-progress { display: flex; gap: 9px; align-items: baseline; font: 10px/1.8 var(--font-mono); letter-spacing: .04em; }
.explore-progress b { color: var(--accent); font-weight: 500; font-size: 15px; }
.visitor-line { display: flex; justify-content: center; min-height: 44px; margin-top: 24px; }
.visitor-count { display: inline-flex; align-items: center; gap: 10px; border: 0; min-height: 44px; background: transparent; color: var(--text-muted); font-size: 11px; }
.visitor-count:hover { color: var(--accent); }
.visitor-unavailable { align-self: center; color: var(--text-muted); font-size: 11px; }
.home-modal { position: fixed; inset: 0; z-index: 220; display: grid; place-items: center; padding: 24px; background: rgba(20, 15, 30, .62); backdrop-filter: blur(8px); }
.interest-load-state { width: min(100%, 420px); padding: 28px; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-card); color: var(--text); }
.interest-load-state .btn { margin: 12px 10px 0 0; }
.avatar-dialog { position: relative; background: var(--bg-card); border-radius: var(--radius-md); padding: 10px; max-width: 560px; max-height: 88dvh; outline: none; }
.avatar-dialog > img { display: block; width: auto; height: auto; max-height: 82dvh; object-fit: contain; border-radius: var(--radius-sm); }
.dialog-close { position: absolute; right: 18px; top: 18px; z-index: 1; background: var(--bg-card); color: var(--text); }
.qr-dialog { position: relative; width: min(100%, 400px); max-height: 88dvh; overflow-y: auto; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 64px 32px 32px; outline: none; }
.qr-dialog h2 { font: 500 24px/1.7 var(--font-display); text-wrap: balance; }
.qr-dialog img { display: block; margin: 24px auto; border-radius: var(--radius-sm); }
.qr-dialog > p:last-child { font-size: 14px; color: var(--text-muted); }
@media (max-width: 900px) { .home-hero { gap: 32px; padding-top: 24px; } .hero-title { font-size: 60px; } .hero-subtitle { font-size: 22px; } .window-bar { font-size: 8px; } .mood-note { padding-inline: 8px; gap: 6px; } .mood-note p { font-size: 16px; } }
@media (max-width: 640px), (max-width: 980px) and (max-height: 500px) {
  .home-hero { grid-template-columns: minmax(0, 1fr) minmax(92px, 30%); align-items: start; padding: 8px 0 22px; gap: 14px; }
  .hero-copy { padding-bottom: 0; }
  .hero-copy .eyebrow { font-size: 10px; line-height: 1.6; letter-spacing: .03em; gap: 7px; }
  .hero-title { font-size: clamp(36px, 10.4vw, 44px); line-height: 1.25; letter-spacing: .06em; margin: 12px 0 8px; }
  .hero-subtitle { font-size: 16px; line-height: 1.6; margin: 0 0 12px; letter-spacing: .02em; }
  .hero-text { font-size: 14px; line-height: 1.75; margin: 0; }
  .hero-footnote { margin-top: 12px; font-size: 10px; gap: 6px; align-items: baseline; }
  .status-marker { flex-shrink: 0; }
  .hero-scene { width: calc(100% - 4px); margin: 20px 0 0; padding: 0; }
  .pixel-window { padding-inline: 4px; border-radius: 7px; box-shadow: 4px 4px 0 var(--bg-elevated); }
  .window-bar { height: 19px; }
  .window-bar > span:nth-child(2) { display: none; }
  .window-dots { gap: 3px; }
  .window-dots i { width: 3px; height: 3px; }
  .window-corner { font-size: 12px; }
  .scene-image { aspect-ratio: 1; }
  .scene-enlarge { display: none; }
  .window-caption { justify-content: flex-end; min-height: 19px; }
  .window-caption > span:first-child { display: none; }
  .caption-signature { font-size: 6px; }
  .mood-note { padding: 10px 0 0; gap: 0; }
  .mood-label { display: none; }
  .mood-note p { font-size: 12px; line-height: 1.65; text-wrap: pretty; }
  .interest-section { padding: 16px 14px 12px; border-radius: 14px; }
  .interest-heading { align-items: flex-start; flex-direction: column; gap: 4px; }
  .interest-heading .eyebrow { font-size: 9px; }
  .interest-heading h2 { font-size: 20px; margin-top: 5px; }
  .interest-heading > p { font-size: 12px; margin: 0; }
  .interest-cloud { gap: 8px 10px; padding: 18px 0; min-height: 0; }
  .cloud-tag { max-width: calc(100% - 12px); min-height: 44px; padding: 5px 9px; font-size: calc(var(--tag-size) * .55); }
  .interest-foot { font-size: 10px; gap: 8px; padding-top: 10px; }
  .explore-progress { font-size: 9px; gap: 6px; }
  .explore-progress b { font-size: 13px; }
  .visitor-line { margin-top: 12px; }
  .home-modal { padding: 12px; }
  .qr-dialog { padding: 56px 22px 22px; }
  .qr-dialog h2 { font-size: 22px; margin-block: 12px; }
}
</style>
