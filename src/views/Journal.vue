<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import journalsData from '../data/journals.js'

const { t } = useI18n()

const current = ref(0)
const isFlipping = ref(false)
const isLastPage = computed(() => current.value === journalsData.length - 1)

let autoTimer = null

function resetTimer() {
  clearTimeout(autoTimer)
  autoTimer = setTimeout(() => goNext(), 20000)
}

function goNext() {
  if (isFlipping.value) return
  isFlipping.value = true
  resetTimer()

  setTimeout(() => {
    current.value = (current.value + 1) % journalsData.length
    isFlipping.value = false
  }, 350)
}

function goPrev() {
  if (isFlipping.value) return
  isFlipping.value = true
  resetTimer()

  setTimeout(() => {
    current.value = (current.value - 1 + journalsData.length) % journalsData.length
    isFlipping.value = false
  }, 350)
}

function handlePageClick() {
  if (isFlipping.value) return
  goNext()
}

resetTimer()

onUnmounted(() => clearTimeout(autoTimer))
</script>

<template>
  <section class="section journal-section">
    <h2 class="section-title">{{ t('journal.title') }}</h2>

    <div class="book-stage">
      <!-- Left arrow -->
      <button
        type="button"
        class="book-arrow book-arrow-left"
        @click.stop="goPrev"
        :disabled="isFlipping"
        aria-label="Previous page"
      >&lsaquo;</button>

      <!-- Book page -->
      <div class="book-wrapper" @click="handlePageClick">
        <div class="book-card" :class="{ 'is-flipping': isFlipping }">
          <div class="book-label">{{ journalsData[current].label }}</div>
          <p class="book-content">{{ journalsData[current].content }}</p>
          <div class="book-flourish">&#9672;</div>
        </div>
      </div>

      <!-- Right arrow -->
      <button
        type="button"
        class="book-arrow book-arrow-right"
        @click.stop="goNext"
        :disabled="isFlipping"
        aria-label="Next page"
      >&rsaquo;</button>
    </div>

    <!-- Page indicator -->
    <div class="book-footer">
      <div class="book-pager">
        <span class="pager-label">{{ journalsData[current].label }}</span>
        <span class="pager-divider">/</span>
        <span class="pager-total">{{ journalsData.length }}</span>
      </div>
      <p v-if="isLastPage" class="book-loop-hint">
        &#9670; 已读完所有诗歌 · 再次点击回到开头 &#9670;
      </p>
      <p v-else class="book-hint">点击书页翻页 · 或等待自动翻页</p>
    </div>
  </section>
</template>

<style scoped>
.journal-section {
  position: relative;
}

.journal-section::before {
  content: '\7B46';
  position: absolute;
  top: -30px; right: 8px;
  font-size: 140px;
  color: var(--accent);
  opacity: 0.025;
  pointer-events: none;
  font-family: serif;
  line-height: 1;
}

/* ===== Book Stage ===== */
.book-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 380px;
}

/* ===== Arrows ===== */
.book-arrow {
  appearance: none;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-muted);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-fast) var(--ease-out);
  flex-shrink: 0;
}

.book-arrow:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
  box-shadow: 0 0 16px var(--accent-glow);
}

.book-arrow:disabled {
  opacity: 0.3;
  cursor: default;
}

/* ===== Book Wrapper ===== */
.book-wrapper {
  perspective: 1200px;
  cursor: pointer;
  flex: 1;
  max-width: 560px;
}

.book-card {
  position: relative;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 40px 36px;
  min-height: 340px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), border-color var(--duration-normal) var(--ease-out), box-shadow var(--duration-normal) var(--ease-out);
  transform-origin: left center;
  transform-style: preserve-3d;
  box-shadow:
    4px 0 12px rgba(0, 0, 0, 0.08),
    0 4px 24px rgba(0, 0, 0, 0.06);
}

.book-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 6px;
  height: 100%;
  background: linear-gradient(180deg, var(--accent), var(--accent-strong), var(--accent));
  border-radius: var(--radius-lg) 0 0 var(--radius-lg);
  opacity: 0.5;
}

.book-card:hover {
  border-color: var(--border-strong);
  box-shadow:
    6px 0 20px rgba(0, 0, 0, 0.12),
    0 8px 32px rgba(255, 128, 184, 0.1);
}

.book-card.is-flipping {
  animation: pageFlip 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes pageFlip {
  0% {
    transform: rotateY(0deg);
    opacity: 1;
  }
  40% {
    transform: rotateY(-70deg);
    opacity: 0.6;
  }
  60% {
    transform: rotateY(-70deg);
    opacity: 0.6;
  }
  100% {
    transform: rotateY(0deg);
    opacity: 1;
  }
}

/* ===== Content ===== */
.book-label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--accent-strong);
  background: var(--bg-elevated);
  border: 1px solid rgba(255, 128, 184, 0.15);
  border-radius: var(--radius-sm);
  padding: 4px 14px;
  margin-bottom: 24px;
}

.book-content {
  white-space: pre-line;
  font-size: 16px;
  line-height: 2.1;
  color: var(--text);
  font-style: normal;
  letter-spacing: 0.03em;
  margin: 0;
  max-width: 400px;
}

.book-flourish {
  margin-top: 24px;
  font-size: 10px;
  color: var(--accent);
  opacity: 0.35;
  letter-spacing: 8px;
}

/* ===== Footer ===== */
.book-footer {
  text-align: center;
  margin-top: 28px;
}

.book-pager {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 0.08em;
}

.pager-label {
  color: var(--accent);
}

.pager-divider {
  color: var(--border-strong);
  margin: 0 4px;
}

.book-hint {
  font-size: 10px;
  color: var(--text-muted);
  margin-top: 10px;
  opacity: 0.5;
}

.book-loop-hint {
  font-size: 11px;
  color: var(--accent);
  margin-top: 10px;
  animation: hintPulse 2s ease-in-out infinite;
}

@keyframes hintPulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .book-stage {
    min-height: 320px;
    gap: 8px;
  }

  .book-arrow {
    width: 36px;
    height: 36px;
    font-size: 20px;
  }

  .book-card {
    padding: 28px 20px;
    min-height: 280px;
  }

  .book-content {
    font-size: 14px;
    line-height: 1.9;
  }

  .journal-section::before {
    font-size: 100px;
    top: -20px;
  }
}
</style>
