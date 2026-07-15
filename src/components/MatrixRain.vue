<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['done'])
const visible = ref(true)
const fading = ref(false)

// 日文片假名 + 数字 + 字母，模拟 cmatrix 字符集
const CHARS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

let canvas, ctx
let drops = []
let animId = null
const FONT_SIZE = 16
const SPEED = 1.8 // 下落速度系数

function initDrops() {
  const cols = Math.floor(window.innerWidth / FONT_SIZE)
  drops = new Array(cols).fill(0)
  // 随机初始位置，让启动时更有层次感
  for (let i = 0; i < cols; i++) {
    drops[i] = Math.random() * (-window.innerHeight / FONT_SIZE)
  }
}

function draw() {
  if (!ctx) return
  ctx.fillStyle = 'rgba(0, 0, 0, 0.045)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.font = `bold ${FONT_SIZE}px "Courier New", "Source Code Pro", monospace`

  for (let i = 0; i < drops.length; i++) {
    const char = CHARS[Math.floor(Math.random() * CHARS.length)]
    const x = i * FONT_SIZE
    const y = drops[i] * FONT_SIZE

    // 头部最亮（白绿），尾部渐暗
    ctx.fillStyle = '#ffffff'
    ctx.fillText(char, x, y)

    ctx.fillStyle = '#86efac'
    ctx.fillText(char, x, y - FONT_SIZE)

    ctx.fillStyle = '#22c55e'
    ctx.fillText(char, x, y - FONT_SIZE * 2)

    ctx.fillStyle = '#15803d'
    ctx.fillText(char, x, y - FONT_SIZE * 3)

    // 超出屏幕后重置到顶部随机位置
    if (y > canvas.height && Math.random() > 0.975) {
      drops[i] = Math.random() * (-10)
    }
    drops[i] += SPEED + Math.random() * 0.6
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

  // 3.5 秒后自动消失
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
  background: #000;
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

.matrix-overlay {
  position: relative;
  z-index: 1;
  text-align: center;
  pointer-events: none;
}

.matrix-title {
  font-family: 'Press Start 2P', monospace;
  font-size: clamp(14px, 3vw, 22px);
  color: #22c55e;
  text-shadow:
    0 0 10px rgba(34, 197, 94, 0.8),
    0 0 30px rgba(34, 197, 94, 0.5),
    0 0 60px rgba(34, 197, 94, 0.3);
  letter-spacing: 0.12em;
  animation: titleGlow 2s ease-in-out infinite;
  margin-bottom: 24px;
}

@keyframes titleGlow {
  0%, 100% { text-shadow: 0 0 10px rgba(34, 197, 94, 0.6), 0 0 30px rgba(34, 197, 94, 0.3); }
  50% { text-shadow: 0 0 16px rgba(34, 197, 94, 1), 0 0 50px rgba(34, 197, 94, 0.6), 0 0 80px rgba(34, 197, 94, 0.3); }
}

.matrix-hint {
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  color: rgba(34, 197, 94, 0.7);
  letter-spacing: 0.08em;
  animation: hintBlink 2.5s ease-in-out infinite;
}

@keyframes hintBlink {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 1; }
}

.matrix-enter-active { transition: opacity 0.15s ease; }
.matrix-leave-active { transition: opacity 0.5s ease; }
.matrix-enter-from, .matrix-leave-to { opacity: 0; }
</style>
