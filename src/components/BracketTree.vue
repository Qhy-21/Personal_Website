<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  allRounds: { type: Array, required: true },
})

const reversedRounds = computed(() => {
  return [...props.allRounds].reverse()
})

function roundLabel(roundData, index, total) {
  return t('xusongBot.round', { n: roundData.round })
}

function isAllSolo(roundData) {
  return roundData.matches.every(m => !m.songB)
}
</script>

<template>
  <div class="bracket-wrap">
    <div
      v-for="(roundData, rIdx) in reversedRounds"
      :key="rIdx"
      class="round-section"
    >
      <div v-if="rIdx > 0" class="round-arrow">&#8593;</div>
      <div class="round-header">
        <template v-if="isAllSolo(roundData) && rIdx === 0">
          {{ t('xusongBot.champion') }}
        </template>
        <template v-else>
          {{ roundLabel(roundData, reversedRounds.length - 1 - rIdx, reversedRounds.length) }}
        </template>
      </div>
      <div class="cloud-grid">
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

@media (max-width: 768px) {
  .bracket-wrap {
    padding: 12px 4px;
  }

  .cloud-tag {
    font-size: 11px;
    padding: 4px 10px;
  }

  .round-header {
    font-size: 10px;
  }
}
</style>
