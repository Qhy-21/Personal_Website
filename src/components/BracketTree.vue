<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  allRounds: { type: Array, required: true },
})

const MAX_VISIBLE = 5
const showAll = ref(false)
const collapsedExtra = ref(new Set())

const reversedRounds = computed(() => {
  return [...props.allRounds].reverse()
})

const displayRounds = computed(() => {
  if (reversedRounds.value.length <= MAX_VISIBLE) return reversedRounds.value
  return showAll.value ? reversedRounds.value : reversedRounds.value.slice(0, MAX_VISIBLE)
})

const hasMore = computed(() => reversedRounds.value.length > MAX_VISIBLE)

function isExtraRound(rIdx) {
  return showAll.value && rIdx >= MAX_VISIBLE
}

function isCollapsed(rIdx) {
  return collapsedExtra.value.has(rIdx)
}

function toggleRound(rIdx) {
  const next = new Set(collapsedExtra.value)
  if (next.has(rIdx)) next.delete(rIdx)
  else next.add(rIdx)
  collapsedExtra.value = next
}

function toggleAll() {
  if (showAll.value) {
    showAll.value = false
    collapsedExtra.value = new Set()
  } else {
    showAll.value = true
  }
}

function roundLabel(roundData) {
  return t('xusongBot.round', { n: roundData.round })
}

function isAllSolo(roundData) {
  return roundData.matches.every(m => !m.songB)
}
</script>

<template>
  <div class="bracket-wrap">
    <div
      v-for="(roundData, rIdx) in displayRounds"
      :key="rIdx"
      class="round-section"
    >
      <div v-if="rIdx > 0" class="round-arrow">&#8593;</div>

      <!-- Extra round: clickable header -->
      <button v-if="isExtraRound(rIdx)" class="round-header round-toggle" @click="toggleRound(rIdx)">
        <span class="toggle-arrow">{{ isCollapsed(rIdx) ? '&#9654;' : '&#9660;' }}</span>
        {{ roundLabel(roundData) }}
      </button>

      <!-- Core round: plain header -->
      <div v-else class="round-header">
        <template v-if="isAllSolo(roundData) && rIdx === 0">
          {{ t('xusongBot.champion') }}
        </template>
        <template v-else>
          {{ roundLabel(roundData) }}
        </template>
      </div>

      <div v-if="!isExtraRound(rIdx) || !isCollapsed(rIdx)" class="cloud-grid">
        <template v-for="m in roundData.matches" :key="'a-' + m.songA.id">
          <span
            class="cloud-tag"
            :class="{
              'cloud-win': m.winner === 'A' || !m.songB,
              'cloud-loss': m.winner === 'B',
            }"
          >
            {{ m.songA.title }}
          </span>
          <span
            v-if="m.songB"
            class="cloud-tag"
            :class="{
              'cloud-win': m.winner === 'B',
              'cloud-loss': m.winner === 'A',
            }"
          >
            {{ m.songB.title }}
          </span>
        </template>
      </div>
    </div>

    <div v-if="hasMore" class="expand-row">
      <div v-if="!showAll" class="round-arrow">&#8593;</div>
      <button class="expand-btn" @click="toggleAll">
        {{ showAll ? t('xusongBot.collapseAll') : t('xusongBot.showAllRounds', { n: reversedRounds.length }) }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.bracket-wrap {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--bg-card);
  padding: 20px 12px;
}

.round-section {
  padding: 0 16px;
}

.round-header {
  text-align: center;
  font-family: var(--font-pixel);
  font-size: 12px;
  font-weight: 700;
  color: var(--accent);
  margin-bottom: 14px;
  letter-spacing: 0.06em;
}

/* ===== Clickable round header ===== */
.round-toggle {
  appearance: none;
  border: none;
  background: transparent;
  cursor: pointer;
  display: block;
  width: 100%;
  padding: 0;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.round-toggle:hover {
  opacity: 0.7;
}

.toggle-arrow {
  margin-right: 6px;
  font-size: 10px;
}

/* ===== Cloud grid ===== */
.cloud-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 4px;
}

.cloud-tag {
  padding: 5px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid var(--border);
  color: var(--text-muted);
  transition: all var(--duration-fast) var(--ease-out);
  white-space: nowrap;
}

.cloud-tag.cloud-win {
  background: rgba(255, 128, 184, 0.18);
  border-color: var(--accent);
  color: var(--accent);
  font-weight: 600;
}

.cloud-tag.cloud-loss {
  opacity: 0.3;
}

/* ===== Round arrow ===== */
.round-arrow {
  text-align: center;
  font-size: 20px;
  color: var(--accent);
  opacity: 0.6;
  padding: 4px 0 8px;
}

/* ===== Expand ===== */
.expand-row {
  text-align: center;
}

.expand-btn {
  appearance: none;
  border: 1px dashed var(--border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-muted);
  font-family: var(--font-body);
  font-size: 12px;
  padding: 8px 24px;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.expand-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

@media (max-width: 768px) {
  .bracket-wrap {
    padding: 12px 6px;
  }

  .round-section {
    padding: 0 8px;
  }

  .cloud-tag {
    font-size: 11px;
    padding: 4px 10px;
  }

  .cloud-grid {
    gap: 6px;
  }

  .round-header {
    font-size: 10px;
    margin-bottom: 10px;
  }

  .expand-btn {
    font-size: 11px;
    padding: 6px 18px;
  }
}
</style>
