<script setup>
import { ref, onMounted } from 'vue'
import interestsData from '../data/interests.js'

const colors = [
  '#ffb3c6', '#ff9999', '#ffcc99', '#ffff99',
  '#99ff99', '#99ffff', '#99ccff', '#cc99ff',
  '#ff99cc', '#ff6666', '#ff9966', '#ffcc66',
  '#66ffcc', '#66ccff', '#cc66ff', '#ff66b3'
]

function shuffleArray(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const shuffledInterests = shuffleArray(interestsData)

function getTagStyle(item, index) {
  const baseSize = 14 + item.weight * 4
  const sizeVariation = Math.random() * 8
  const finalSize = baseSize + sizeVariation
  const color = colors[index % colors.length]
  const rotation = (Math.random() - 0.5) * 20
  return {
    fontSize: finalSize + 'px',
    color,
    textShadow: `0 0 10px ${color}80`,
    transform: `rotate(${rotation}deg)`,
  }
}

// Avatar modal
const avatarModalOpen = ref(false)

function openAvatarModal() {
  avatarModalOpen.value = true
}

function closeAvatarModal(e) {
  if (e && e.target !== e.currentTarget) return
  avatarModalOpen.value = false
}

function onKeydown(e) {
  if (e.key === 'Escape') avatarModalOpen.value = false
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})
</script>

<template>
  <section class="section section-intro">
    <div class="intro-left">
      <div class="intro-title">
        <div class="pixel-tag">COMPUTER SCIENCE</div>
        <h1>羌花吟<br><span class="intro-subtitle">在比特流之间生存</span></h1>
      </div>
      <p class="intro-text">
        这是我在互联网缝隙里搭起的一间像素小屋。<br>
        一名全栈学习者，既能写后端接口，也能在前端挥洒创意。
      </p>
      <div class="intro-actions">
        <router-link to="/projects" class="btn btn-primary">查看作品</router-link>
        <router-link to="/contact" class="btn btn-ghost">联络我</router-link>
      </div>
      <div class="intro-meta">
        <span>当前版本：v1.0 · Vue 3 + Vite 重构</span>
      </div>
    </div>
    <div class="intro-right">
      <div class="pixel-card avatar-card">
        <button type="button" class="avatar-pixel" @click="openAvatarModal" aria-label="查看头像大图"></button>
        <div class="avatar-info">
          <div class="avatar-name">羌花吟</div>
          <div class="avatar-desc">Java / CS / Words</div>
          <div class="avatar-status">「正在加载新的可能性…」</div>
          <router-link to="/contact" class="btn btn-sm">了解更多</router-link>
        </div>
      </div>
      <div class="pixel-card mood-card">
        <div class="card-label">今日心情 · PIXEL MOOD</div>
        <p class="mood-text">127.0.0.1</p>
        <div class="mood-decoration">
          <span class="pixel-dot"></span>
          <span class="pixel-dot"></span>
          <span class="pixel-dot"></span>
        </div>
      </div>
    </div>
  </section>

  <section class="section section-dark">
    <div class="interest-cloud">
      <span v-for="(item, index) in shuffledInterests" :key="index" class="cloud-tag" :style="getTagStyle(item, index)">
        {{ item.text }}
      </span>
    </div>
  </section>

  <Teleport to="body">
    <div class="avatar-modal" :class="{ 'is-open': avatarModalOpen }" @click="closeAvatarModal">
      <div class="avatar-modal-inner">
        <img src="/avatar.png" alt="羌花吟头像大图" class="avatar-modal-image">
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.section-intro {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2.4fr);
  gap: 20px;
  align-items: stretch;
}
.intro-left h1 { margin: 6px 0 8px; font-size: 26px; line-height: 1.2; animation: fadeInUp 0.8s ease-out; }
.intro-subtitle { display: inline-block; font-size: 14px; font-weight: 400; color: var(--accent); }
.pixel-tag { display: inline-block; padding: 2px 8px; border: 2px solid var(--border); font-size: 10px; letter-spacing: 1px; background: rgba(0,0,0,0.4); animation: fadeIn 1s ease-out 0.3s both; }
.intro-text { font-size: 14px; color: var(--text-muted); margin: 10px 0 14px; animation: fadeIn 1s ease-out 0.5s both; }
.intro-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 8px; animation: fadeIn 1s ease-out 0.7s both; }
.intro-meta { font-size: 11px; color: var(--text-muted); animation: fadeIn 1s ease-out 0.9s both; }
.intro-right { display: flex; flex-direction: column; gap: 12px; animation: fadeInRight 0.8s ease-out 0.4s both; }
.avatar-card { display: grid; grid-template-columns: 120px minmax(0,1fr); gap: 10px; align-items: center; }
.avatar-pixel { appearance: none; border: none; padding: 0; cursor: pointer; width: 100px; height: 100px; margin: 0 auto; background: url("/avatar.png") center/cover no-repeat, #0d0716; border: 3px solid var(--border); box-shadow: 0 0 0 2px #000, inset 0 0 0 2px #000; transition: all var(--transition-normal) ease; }
.avatar-pixel:hover { border-color: var(--accent); box-shadow: 0 0 0 2px #000, inset 0 0 0 2px #000, 0 0 15px var(--accent-glow); }
.avatar-info { font-size: 12px; }
.avatar-name { font-weight: 600; }
.avatar-desc { color: var(--accent); margin-top: 2px; }
.avatar-status { margin-top: 6px; font-size: 11px; color: var(--text-muted); }
.mood-card { text-align: center; }
.mood-card p { margin-top: 8px; font-size: 14px; }
.mood-text { font-family: monospace; color: var(--accent); }
.mood-decoration { display: flex; justify-content: center; gap: 8px; margin-top: 8px; }
.pixel-dot { width: 8px; height: 8px; background: var(--accent); animation: blink 1.5s ease-in-out infinite; }
.pixel-dot:nth-child(2) { animation-delay: 0.3s; }
.pixel-dot:nth-child(3) { animation-delay: 0.6s; }
@keyframes blink { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }
.interest-cloud { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 20px 30px; padding: 30px 20px; min-height: 200px; }
.cloud-tag { cursor: default; transition: all 0.3s ease; line-height: 1.2; }
.cloud-tag:hover { transform: scale(1.15) !important; filter: brightness(1.2); }
.avatar-modal { position: fixed; inset: 0; display: none; align-items: center; justify-content: center; background: rgba(5,2,16,0.55); backdrop-filter: blur(10px); z-index: 40; }
.avatar-modal.is-open { display: flex; }
.avatar-modal-inner { max-width: min(420px,90vw); max-height: 80vh; border: 3px solid var(--border); box-shadow: 0 0 0 3px #000, 0 10px 0 0 var(--shadow); background: #05020a; padding: 8px; }
.avatar-modal-image { display: block; max-width: 100%; max-height: 100%; }
@media (max-width: 768px) {
  .section-intro { grid-template-columns: 1fr; }
  .avatar-card { grid-template-columns: 1fr; text-align: center; }
  .avatar-pixel { margin-bottom: 8px; }
  .interest-cloud { gap: 16px 20px; padding: 20px 12px; min-height: 160px; }
}
@media (max-width: 480px) {
  .intro-actions { flex-direction: column; }
}
</style>
