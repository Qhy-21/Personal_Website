<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTournament } from '../composables/useTournament.js'
import SongCard from '../components/SongCard.vue'
import BracketTree from '../components/BracketTree.vue'

const { t } = useI18n()
const {
  round, phase, currentMatch, totalMatches, votedCount, progress,
  hasSkipped, canUndo, totalSongs, champions,
  allRounds, skippedQueue,
  initTournament, vote, skipCurrent, pass, pickRandomSkipped, undo, clearAll,
  loadState, hasSavedState, resumeFromSaved,
} = useTournament()

const showingResume = ref(false)
const bracketRef = ref(null)
const exporting = ref(false)
const confirmAction = ref(null)
const showLiveBracket = ref(false)

onMounted(() => {
  if (hasSavedState()) {
    showingResume.value = true
  }
})

function handleResume() {
  loadState()
  resumeFromSaved()
  showingResume.value = false
}

function handleNewGame() {
  clearAll()
  showingResume.value = false
  initTournament()
}

function handleRestart() {
  confirmAction.value = { type: 'restart' }
}

function handleClear() {
  confirmAction.value = { type: 'clear' }
}

function handleExport() {
  confirmAction.value = { type: 'export' }
}

function doConfirm() {
  const type = confirmAction.value?.type
  confirmAction.value = null
  if (type === 'restart') {
    initTournament()
  } else if (type === 'clear') {
    clearAll()
  } else if (type === 'export') {
    doExport()
  }
}

function doCancel() {
  confirmAction.value = null
}

async function doExport() {
  if (!bracketRef.value || exporting.value) return
  exporting.value = true
  try {
    const { default: html2canvas } = await import('html2canvas')
    const el = bracketRef.value
    const canvas = await html2canvas(el, {
      backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-base').trim() || '#0f0f18',
      scale: 2,
    })
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'xu-song-bracket.png'
      a.click()
      URL.revokeObjectURL(url)
      exporting.value = false
    }, 'image/png')
  } catch {
    exporting.value = false
  }
}

function confirmDesc(type) {
  if (type === 'restart') return t('xusongBot.confirmRestartDesc')
  if (type === 'export') return t('xusongBot.confirmExportDesc')
  if (type === 'clear') return t('xusongBot.confirmClearDesc')
  return ''
}
</script>

<template>
  <section class="xusong-page" :class="{ 'is-complete': phase === 'complete' }">
    <div class="page-header">
      <h1 class="page-title">{{ t('xusongBot.title') }}</h1>
      <p class="page-subtitle">
        {{ t('xusongBot.subtitle', { n: totalSongs }) }}
      </p>
    </div>

    <!-- Resume modal -->
    <div v-if="showingResume" class="phase-wrap">
      <div class="pixel-card resume-card">
        <div class="resume-icon">&#9835;</div>
        <h3 class="resume-title">{{ t('xusongBot.resumeTitle') }}</h3>
        <p class="resume-desc">{{ t('xusongBot.resumeDesc') }}</p>
        <div class="resume-actions">
          <button class="bot-btn primary" @click="handleResume">{{ t('xusongBot.resumeContinue') }}</button>
          <button class="bot-btn" @click="handleNewGame">{{ t('xusongBot.resumeNew') }}</button>
        </div>
      </div>
    </div>

    <!-- Voting phase -->
    <div v-if="phase === 'voting' && !showingResume" class="phase-wrap">
      <div class="stats-row">
        <span class="stat-item">{{ t('xusongBot.round', { n: round }) }}</span>
        <span class="stat-item">{{ t('xusongBot.progress', { voted: votedCount, total: totalMatches }) }}</span>
        <span v-if="skippedQueue.length" class="stat-item accent">{{ t('xusongBot.skipped', { n: skippedQueue.length }) }}</span>
      </div>

      <div class="progress-track">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>

      <div v-if="currentMatch" class="vote-area">
        <div class="vote-cards">
          <SongCard
            :song="currentMatch.songA"
            @pick="vote('A')"
          />
          <div class="vs-badge">
            <span class="vs-text">VS</span>
          </div>
          <SongCard
            :song="currentMatch.songB"
            @pick="vote('B')"
          />
        </div>
      </div>

      <div class="action-bar">
        <button class="bot-btn" :disabled="!canUndo" @click="undo">{{ t('xusongBot.undo') }}</button>
        <button class="bot-btn" :title="t('xusongBot.skipTitle')" @click="skipCurrent">{{ t('xusongBot.skip') }}</button>
        <button class="bot-btn pass-btn" :title="t('xusongBot.passTitle')" @click="pass">{{ t('xusongBot.pass') }}</button>
        <button
          class="bot-btn accent-btn"
          :class="{ 'has-items': hasSkipped }"
          :disabled="!hasSkipped"
          :title="t('xusongBot.randomSkipTitle')"
          @click="pickRandomSkipped"
        >{{ t('xusongBot.randomSkip') }}</button>
      </div>

      <p v-if="hasSkipped" class="skip-desc">{{ t('xusongBot.randomSkipDesc') }}</p>
      <p class="hint-text">{{ t('xusongBot.hint') }}</p>

      <!-- Live bracket -->
      <div v-if="allRounds.length" class="live-bracket-section">
        <button class="live-bracket-toggle" @click="showLiveBracket = !showLiveBracket">
          {{ showLiveBracket ? '▲' : '▼' }} {{ t('xusongBot.liveBracket', { n: allRounds.length }) }}
        </button>
        <div v-if="showLiveBracket" class="live-bracket-body">
          <BracketTree :all-rounds="allRounds" />
        </div>
      </div>
    </div>

    <!-- Complete phase -->
    <div v-if="phase === 'complete' && !showingResume" class="phase-wrap complete-phase">
      <div v-if="champions.length" class="champion-card">
        <div class="champion-label">{{ champions.length === 1 ? t('xusongBot.champion') : t('xusongBot.champions') }}</div>
        <div class="champion-list">
          <SongCard
            v-for="(c, i) in champions"
            :key="c.id"
            :song="c"
            :outcome="'win'"
          />
        </div>
      </div>

      <h3 class="section-title">{{ t('xusongBot.bracketTitle') }}</h3>
      <div ref="bracketRef">
        <BracketTree :all-rounds="allRounds" />
      </div>

      <div class="action-bar complete-actions">
        <button class="bot-btn primary" @click="handleRestart">{{ t('xusongBot.restart') }}</button>
        <button class="bot-btn" @click="handleExport" :disabled="exporting">
          {{ exporting ? '...' : t('xusongBot.exportImage') }}
        </button>
        <button class="bot-btn danger" @click="handleClear">{{ t('xusongBot.clearAll') }}</button>
      </div>
    </div>

    <!-- Idle phase -->
    <div v-if="phase === 'idle' && !showingResume" class="phase-wrap">
      <div class="idle-card pixel-card">
        <p class="idle-text">{{ t('xusongBot.idleText', { n: totalSongs }) }}</p>
        <button class="bot-btn primary start-btn" @click="handleNewGame">{{ t('xusongBot.startVote') }}</button>
      </div>
    </div>

    <!-- Confirm dialog -->
    <Teleport to="body">
      <div v-if="confirmAction" class="xusong-confirm-overlay" @click.self="doCancel">
        <div class="xusong-confirm-card">
          <h3 class="xusong-confirm-title">{{ t('xusongBot.confirmTitle') }}</h3>
          <p class="xusong-confirm-desc">{{ confirmDesc(confirmAction.type) }}</p>
          <div class="xusong-confirm-actions">
            <button class="bot-btn" @click="doCancel">{{ t('xusongBot.confirmCancel') }}</button>
            <button class="bot-btn primary" @click="doConfirm">{{ t('xusongBot.confirmYes') }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.xusong-page {
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 60px;
}

.xusong-page.is-complete {
  max-width: none;
}

.complete-phase {
  padding: 0 24px;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-title {
  font-family: var(--font-pixel);
  font-size: 28px;
  margin: 0 0 8px;
  background: linear-gradient(135deg, var(--accent), #c4a0ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 13px;
  color: var(--text-muted);
  font-family: var(--font-mono);
  margin: 0;
}

/* ===== Stats ===== */
.stats-row {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 12px;
}

.stat-item {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-muted);
}

.stat-item.accent {
  color: var(--accent);
}

/* ===== Progress ===== */
.progress-track {
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: var(--bg-card);
  margin-bottom: 28px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--accent), var(--accent-strong));
  transition: width 0.3s var(--ease-out);
}

/* ===== Vote area ===== */
.vote-area {
  margin-bottom: 28px;
}

.vote-cards {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 16px;
  align-items: center;
}

.vs-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 1px solid var(--border);
  flex-shrink: 0;
}

.vs-text {
  font-family: var(--font-pixel);
  font-size: 11px;
  color: var(--accent);
}

/* ===== Action bar ===== */
.action-bar {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}

.action-bar.complete-actions {
  margin-top: 28px;
}

.bot-btn {
  appearance: none;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 14px;
  padding: 10px 22px;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.bot-btn:hover:not(:disabled) {
  border-color: var(--border-strong);
  background: var(--bg-elevated);
}

.bot-btn:disabled {
  opacity: 0.35;
  cursor: default;
}

.bot-btn.primary {
  border-color: var(--accent);
  background: rgba(255, 128, 184, 0.12);
  color: var(--accent);
}

.bot-btn.primary:hover {
  background: rgba(255, 128, 184, 0.2);
  box-shadow: 0 0 16px var(--accent-glow);
}

.bot-btn.accent-btn.has-items {
  border-color: var(--accent);
  color: var(--accent);
  animation: pulse-border 2s ease-in-out infinite;
}

.bot-btn.danger {
  border-color: transparent;
  color: var(--text-muted);
  font-size: 13px;
}

.bot-btn.danger:hover {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}

.bot-btn.pass-btn {
  border-color: rgba(196, 160, 255, 0.4);
  color: #c4a0ff;
  font-size: 13px;
}

.bot-btn.pass-btn:hover {
  border-color: #c4a0ff;
  background: rgba(196, 160, 255, 0.1);
}

@keyframes pulse-border {
  0%, 100% { box-shadow: 0 0 0 0 var(--accent-glow); }
  50% { box-shadow: 0 0 12px 2px var(--accent-glow); }
}

.skip-desc {
  text-align: center;
  font-size: 11px;
  color: var(--text-muted);
  opacity: 0.6;
  margin: 0 0 8px;
}

.hint-text {
  text-align: center;
  font-size: 12px;
  color: var(--accent);
  opacity: 0.7;
  margin: 0;
}

/* ===== Live bracket ===== */
.live-bracket-section {
  margin-top: 20px;
}

.live-bracket-toggle {
  appearance: none;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  color: var(--text-muted);
  font-family: var(--font-body);
  font-size: 12px;
  padding: 8px 18px;
  cursor: pointer;
  display: block;
  margin: 0 auto;
  transition: all var(--duration-fast) var(--ease-out);
}

.live-bracket-toggle:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.live-bracket-body {
  max-height: 280px;
  overflow-y: auto;
  margin-top: 12px;
}

/* ===== Resume ===== */
.resume-card {
  text-align: center;
  padding: 40px 32px;
}

.resume-icon {
  font-size: 36px;
  color: var(--accent);
  margin-bottom: 12px;
}

.resume-title {
  font-family: var(--font-pixel);
  font-size: 11px;
  color: var(--text);
  margin: 0 0 12px;
}

.resume-desc {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0 0 24px;
  line-height: 1.6;
}

.resume-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

/* ===== Idle ===== */
.idle-card {
  text-align: center;
  padding: 48px 32px;
}

.idle-text {
  font-size: 16px;
  color: var(--text-muted);
  margin: 0 0 24px;
}

.start-btn {
  font-size: 16px;
  padding: 14px 36px;
}

/* ===== Champion ===== */
.champion-card {
  text-align: center;
  margin-bottom: 36px;
}

.champion-label {
  font-family: var(--font-pixel);
  font-size: 10px;
  color: var(--accent);
  margin-bottom: 12px;
  letter-spacing: 0.08em;
}

.champion-card :deep(.song-card) {
  max-width: 360px;
  margin: 0 auto;
}

.champion-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}

.champion-list :deep(.song-card) {
  max-width: 280px;
}

/* ===== Section title ===== */
.section-title {
  font-family: var(--font-pixel);
  font-size: 11px;
  color: var(--text-muted);
  text-align: center;
  margin: 0 0 20px;
}

/* ===== Phase wrap ===== */
.phase-wrap {
  animation: phaseIn 0.4s var(--ease-out);
}

@keyframes phaseIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.pixel-card {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--bg-card);
}

@media (max-width: 768px) {
  .page-title { font-size: 22px; }

  .vote-cards {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .vs-badge {
    width: 36px;
    height: 36px;
    margin: 0 auto;
  }

  .vs-text {
    font-size: 10px;
  }

  .action-bar {
    flex-wrap: wrap;
  }

  .bot-btn {
    font-size: 13px;
    padding: 8px 16px;
  }

  .stats-row {
    gap: 12px;
  }

  .complete-phase {
    padding: 0 8px;
  }

  .confirm-card {
    padding: 24px;
  }
}
</style>

<style>
/* Confirm dialog — unscoped because Teleport moves DOM to body */
.xusong-confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.xusong-confirm-card {
  text-align: center;
  padding: 32px;
  max-width: 380px;
  width: 90%;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--bg-card);
  animation: xusong-modalIn 0.2s ease-out;
}

@keyframes xusong-modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.xusong-confirm-title {
  font-family: var(--font-pixel);
  font-size: 11px;
  color: var(--text);
  margin: 0 0 16px;
}

.xusong-confirm-desc {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0 0 24px;
  line-height: 1.6;
}

.xusong-confirm-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

@media (max-width: 768px) {
  .xusong-confirm-card {
    padding: 24px;
  }
}
</style>
