<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['done'])
const visible = ref(true)
const fading = ref(false)

let canvas, ctx
let drops = []
let depths = []
let speeds = []
let alphas = []
let fontSizes = []
let animId = null
const COL_GAP = 30

function randomBinary() {
  const len = Math.floor(Math.random() * 5) + 2
  let s = ''
  for (let i = 0; i < len; i++) s += Math.random() > 0.5 ? '0' : '1'
  return s
}

function columnFromDepth() {
  const depth = Math.random() * 0.88 + 0.12
  return {
    depth,
    y: Math.random() * (-window.innerHeight / COL_GAP),
    fs: Math.round(6 + depth * 54),
    speed: 0.05 + depth * 0.45,
    alpha: 0.06 + depth * 0.5,
  }
}

function initDrops() {
  const cols = Math.floor(window.innerWidth / COL_GAP)
  drops = new Array(cols)
  depths = new Array(cols)
  speeds = new Array(cols)
  alphas = new Array(cols)
  fontSizes = new Array(cols)
  for (let i = 0; i < cols; i++) {
    const c = columnFromDepth()
    drops[i] = c.y
    depths[i] = c.depth
    speeds[i] = c.speed
    alphas[i] = c.alpha
    fontSizes[i] = c.fs
  }
}

function draw() {
  if (!ctx) return
  ctx.fillStyle = 'rgba(246, 245, 250, 0.08)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let i = 0; i < drops.length; i++) {
    const str = randomBinary()
    const x = i * COL_GAP
    const y = drops[i] * COL_GAP
    const fs = fontSizes[i]
    const a = alphas[i]

    ctx.font = `${fs}px "JetBrains Mono", "Courier New", monospace`

    ctx.fillStyle = `rgba(212, 64, 120, ${a})`
    ctx.fillText(str, x, y)

    ctx.fillStyle = `rgba(212, 64, 120, ${a * 0.55})`
    ctx.fillText(str, x, y - COL_GAP)

    ctx.fillStyle = `rgba(212, 64, 120, ${a * 0.25})`
    ctx.fillText(str, x, y - COL_GAP * 2)

    ctx.fillStyle = `rgba(212, 64, 120, ${a * 0.1})`
    ctx.fillText(str, x, y - COL_GAP * 3)

    if (y > canvas.height && Math.random() > 0.975) {
      const c = columnFromDepth()
      drops[i] = Math.random() * (-6)
      depths[i] = c.depth
      speeds[i] = c.speed
      alphas[i] = c.alpha
      fontSizes[i] = c.fs
    }
    drops[i] += speeds[i]
  }
  animId = requestAnimationFrame(draw)
}

function dismiss() {
  if (fading.value) return
  fading.value = true
  setTimeout(() => {
    visible.value = false
    emit('done')
  }, 800)
}

function onResize() {
  if (!canvas) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  initDrops()
}

onMounted(() => {
  canvas = document.getElementById('matrix-canvas')
  if (!canvas) return
  ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  initDrops()
  draw()

  const timer = setTimeout(dismiss, 3500)

  window.addEventListener('resize', onResize)
  window.addEventListener('keydown', dismiss, { once: true })
  canvas.addEventListener('click', () => {
    clearTimeout(timer)
    dismiss()
  })

  onUnmounted(() => {
    clearTimeout(timer)
    cancelAnimationFrame(animId)
    window.removeEventListener('resize', onResize)
    window.removeEventListener('keydown', dismiss)
  })
})
</script>

<template>
  <Transition name="matrix">
    <div v-if="visible" class="matrix-splash" :class="{ 'is-fading': fading }">
      <canvas id="matrix-canvas"></canvas>
      <div class="matrix-glow"></div>
      <div class="matrix-overlay">
        <div class="matrix-title">QHY's Pixel World</div>
        <p class="matrix-hint">按下任意键或点击屏幕进入</p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.matrix-splash {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #f6f5fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.matrix-splash.is-fading {
  animation: matrixFadeOut 0.6s ease forwards;
  pointer-events: none;
}

@keyframes matrixFadeOut {
  to { opacity: 0; }
}

#matrix-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.matrix-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, rgba(212, 64, 120, 0.06) 0%, transparent 70%);
  pointer-events: none;
}

.matrix-overlay {
  position: relative;
  z-index: 1;
  text-align: center;
  pointer-events: none;
}

.matrix-title {
  font-family: 'Press Start 2P', monospace;
  font-size: clamp(14px, 3vw, 22px);
  color: #c02060;
  text-shadow:
    0 0 10px rgba(192, 32, 96, 0.4),
    0 0 30px rgba(192, 32, 96, 0.2);
  letter-spacing: 0.12em;
  animation: titleGlow 2s ease-in-out infinite;
  margin-bottom: 24px;
}

@keyframes titleGlow {
  0%, 100% { text-shadow: 0 0 10px rgba(192, 32, 96, 0.3), 0 0 30px rgba(192, 32, 96, 0.15); }
  50% { text-shadow: 0 0 16px rgba(192, 32, 96, 0.6), 0 0 50px rgba(212, 64, 120, 0.3), 0 0 80px rgba(212, 64, 120, 0.12); }
}

.matrix-hint {
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  color: rgba(192, 32, 96, 0.5);
  letter-spacing: 0.08em;
  animation: hintBlink 2.5s ease-in-out infinite;
}

@keyframes hintBlink {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

.matrix-enter-active { transition: opacity 0.15s ease; }
.matrix-leave-active { transition: opacity 0.5s ease; }
.matrix-enter-from, .matrix-leave-to { opacity: 0; }
</style>
