<script setup lang="ts">
import { onMounted, onUnmounted, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const emit = defineEmits<{ done: [] }>()
const canvasRef = shallowRef<HTMLCanvasElement | null>(null)
const splashRef = shallowRef<HTMLElement | null>(null)
const fading = shallowRef(false)
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const COL_GAP = 22
let context: CanvasRenderingContext2D | null = null
let columns: { y: number; size: number; speed: number; alpha: number }[] = []
let animationFrame = 0
let automaticTimer: ReturnType<typeof setTimeout> | undefined
let dismissTimer: ReturnType<typeof setTimeout> | undefined
let previousFrameTime = 0

function randomBinary() {
  const length = Math.floor(Math.random() * 5) + 2
  return Array.from({ length }, () => Math.random() > .5 ? '0' : '1').join('')
}
function columnFromDepth() {
  const depth = Math.random() * .88 + .12
  return {
    y: Math.random() * (-window.innerHeight / COL_GAP),
    size: Math.round(6 + depth * 54),
    speed: .05 + depth * .45,
    alpha: .06 + depth * .5,
  }
}
function resize() {
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  columns = Array.from({ length: Math.floor(canvas.width / COL_GAP) }, columnFromDepth)
}
function draw(time: number) {
  const canvas = canvasRef.value
  if (!canvas || !context) return
  const elapsed = previousFrameTime ? Math.min((time - previousFrameTime) / (1000 / 60), 3) : 1
  previousFrameTime = time
  context.clearRect(0, 0, canvas.width, canvas.height)
  columns.forEach((column, index) => {
    const binary = randomBinary()
    const y = column.y * COL_GAP
    context!.font = `${column.size}px "JetBrains Mono", "Courier New", monospace`
    context!.fillStyle = `rgba(212, 64, 120, ${column.alpha})`
    for (let j = 0; j < binary.length; j++) context!.fillText(binary[j], index * COL_GAP, y + j * column.size)
    if (y > canvas.height && Math.random() > .975) {
      Object.assign(column, columnFromDepth(), { y: Math.random() * -6 })
    }
    column.y += column.speed * elapsed
  })
  if (!reducedMotion) animationFrame = requestAnimationFrame(draw)
}
function dismiss() {
  if (fading.value) return
  clearTimeout(automaticTimer)
  window.removeEventListener('keydown', dismiss)
  fading.value = true
  dismissTimer = setTimeout(() => emit('done'), reducedMotion ? 0 : 800)
}
onMounted(() => {
  context = canvasRef.value?.getContext('2d') || null
  resize()
  if (!reducedMotion) animationFrame = requestAnimationFrame(draw)
  automaticTimer = setTimeout(dismiss, 3500)
  window.addEventListener('resize', resize)
  window.addEventListener('keydown', dismiss, { once: true })
  splashRef.value?.focus({ preventScroll: true })
})
onUnmounted(() => {
  clearTimeout(automaticTimer)
  clearTimeout(dismissTimer)
  cancelAnimationFrame(animationFrame)
  window.removeEventListener('resize', resize)
  window.removeEventListener('keydown', dismiss)
})
</script>

<template>
  <div ref="splashRef" class="matrix-splash" :class="{ 'is-fading': fading }" role="dialog" aria-modal="true" :aria-label="t('site.splashTitle')" aria-describedby="matrix-hint" tabindex="-1" @click="dismiss">
    <canvas id="matrix-canvas" ref="canvasRef" aria-hidden="true"></canvas>
    <div class="matrix-glow" aria-hidden="true"></div>
    <div class="matrix-overlay">
      <div class="matrix-title">{{ t('site.splashTitle') }}</div>
      <button id="matrix-hint" type="button" class="matrix-hint" @click.stop="dismiss">{{ t('site.splashHint') }}</button>
    </div>
  </div>
</template>

<style scoped>
.matrix-splash { position: fixed; inset: 0; z-index: 9999; background: #f6f5fa; display: flex; align-items: center; justify-content: center; outline: none; cursor: pointer; }
.matrix-splash.is-fading { animation: matrixFadeOut .6s ease forwards; pointer-events: none; }
@keyframes matrixFadeOut { to { opacity: 0; } }
#matrix-canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
.matrix-glow { position: absolute; inset: 0; background: radial-gradient(ellipse at center, rgba(212, 64, 120, .06) 0%, transparent 70%); pointer-events: none; }
.matrix-overlay { position: relative; z-index: 1; text-align: center; padding: 24px; max-width: 100%; }
.matrix-title { font-family: 'Press Start 2P', monospace; font-size: clamp(14px, 3vw, 22px); color: #c02060; text-shadow: 0 0 10px rgba(192, 32, 96, .4), 0 0 30px rgba(192, 32, 96, .2); letter-spacing: .12em; animation: titleGlow 2s ease-in-out infinite; margin-bottom: 24px; overflow-wrap: anywhere; }
@keyframes titleGlow { 0%, 100% { text-shadow: 0 0 10px rgba(192, 32, 96, .3), 0 0 30px rgba(192, 32, 96, .15); } 50% { text-shadow: 0 0 16px rgba(192, 32, 96, .6), 0 0 50px rgba(212, 64, 120, .3), 0 0 80px rgba(212, 64, 120, .12); } }
.matrix-hint { font-family: 'Press Start 2P', monospace; font-size: 9px; line-height: 1.8; color: rgba(192, 32, 96, .7); letter-spacing: .08em; animation: hintBlink 2.5s ease-in-out infinite; background: transparent; border: 0; min-height: 44px; padding: 8px 12px; }
@keyframes hintBlink { 0%, 100% { opacity: .3; } 50% { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .matrix-title, .matrix-hint, .matrix-splash.is-fading { animation: none; } }
</style>
