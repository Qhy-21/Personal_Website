<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import { useI18n } from 'vue-i18n'
import SiteIcon from './SiteIcon.vue'

type Song = { id: string | number; title: string }
type Match = { songA: Song; songB?: Song | null; winner?: 'A' | 'B' | 'tie' | null }
type RoundData = { round: number; matches: Match[] }
type RoundSong = { key: string; song: Song; outcome: 'win' | 'loss' | 'tie' | 'pending' }

const props = defineProps<{ allRounds: RoundData[] }>()
const { t, locale } = useI18n()
const MAX_VISIBLE = 5
const historyGroupName = 'bracket-history-' + getCurrentInstance()!.uid
const reversedRounds = computed(() => [...props.allRounds].reverse())
const mainRounds = computed(() => reversedRounds.value.slice(0, MAX_VISIBLE))
const extraRounds = computed(() => reversedRounds.value.slice(MAX_VISIBLE))

function roundLabel(round: RoundData) {
  return t('xusongBot.round', { n: round.round })
}
function isAllSolo(round: RoundData) {
  return round.matches.every(match => !match.songB)
}
function roundSongs(round: RoundData): RoundSong[] {
  return round.matches.flatMap((match, index) => {
    const outcome = (side: 'A' | 'B'): RoundSong['outcome'] => {
      if (!match.songB) return 'win'
      if (match.winner === 'tie') return 'tie'
      if (!match.winner) return 'pending'
      return match.winner === side ? 'win' : 'loss'
    }
    const songs: RoundSong[] = [{ key: index + '-A-' + match.songA.id, song: match.songA, outcome: outcome('A') }]
    if (match.songB) songs.push({ key: index + '-B-' + match.songB.id, song: match.songB, outcome: outcome('B') })
    return songs
  })
}
function outcomeLabel(outcome: RoundSong['outcome']) {
  const labels = locale.value === 'en'
    ? { win: 'Advanced', loss: 'Eliminated', tie: 'Advanced together', pending: 'Awaiting a vote' }
    : { win: '已晋级', loss: '未晋级', tie: '共同晋级', pending: '等待投票' }
  return labels[outcome]
}
</script>

<template>
  <div class="bracket-wrap">
    <section v-for="(roundData, index) in mainRounds" :key="roundData.round" class="round-section" :data-bracket-round="roundData.round">
      <div v-if="index > 0" class="round-arrow" aria-hidden="true">↑</div>
      <h3 class="round-header">{{ isAllSolo(roundData) && index === 0 ? t('xusongBot.champion') : roundLabel(roundData) }}</h3>
      <div class="cloud-grid">
        <span
          v-for="entry in roundSongs(roundData)"
          :key="entry.key"
          class="cloud-tag"
          :class="{ 'cloud-win': entry.outcome === 'win' || entry.outcome === 'tie', 'cloud-loss': entry.outcome === 'loss', 'cloud-tie': entry.outcome === 'tie' }"
          :data-song-id="entry.song.id"
          :data-outcome="entry.outcome"
          :aria-label="entry.song.title + ' · ' + outcomeLabel(entry.outcome)"
        >{{ entry.song.title }}</span>
      </div>
    </section>

    <details v-if="extraRounds.length" class="animated-details history-details" data-bracket-history>
      <summary class="history-summary">
        <span class="history-summary-closed">{{ t('xusongBot.showAllRounds', { n: reversedRounds.length }) }}</span>
        <span class="history-summary-open">{{ t('xusongBot.collapseAll') }}</span>
        <SiteIcon name="arrow-right" :size="16" class="details-chevron" />
      </summary>
      <div class="history-rounds">
        <details
          v-for="(roundData, index) in extraRounds"
          :key="roundData.round"
          class="animated-details round-details"
          :name="historyGroupName"
          :open="index === 0"
          :data-bracket-round="roundData.round"
        >
          <summary class="round-summary">
            <span>{{ roundLabel(roundData) }}</span>
            <SiteIcon name="arrow-right" :size="16" class="details-chevron" />
          </summary>
          <div class="round-content">
            <div class="cloud-grid">
              <span
                v-for="entry in roundSongs(roundData)"
                :key="entry.key"
                class="cloud-tag"
                :class="{ 'cloud-win': entry.outcome === 'win' || entry.outcome === 'tie', 'cloud-loss': entry.outcome === 'loss', 'cloud-tie': entry.outcome === 'tie' }"
                :data-song-id="entry.song.id"
                :data-outcome="entry.outcome"
                :aria-label="entry.song.title + ' · ' + outcomeLabel(entry.outcome)"
              >{{ entry.song.title }}</span>
            </div>
          </div>
        </details>
      </div>
    </details>
  </div>
</template>

<style scoped>
.bracket-wrap { width: 100%; min-width: 0; padding: 20px 12px; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-card); }
.round-section { min-width: 0; padding: 0 16px; }
.round-header { margin: 0 0 14px; color: var(--accent); font-family: var(--font-body); font-size: 14px; font-weight: 600; line-height: 1.6; letter-spacing: .04em; text-align: center; }
.cloud-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; min-width: 0; margin-bottom: 4px; }
.cloud-tag { max-width: 100%; min-width: 0; padding: 5px 12px; border: 1px solid var(--border); border-radius: 16px; color: var(--text-muted); font-size: 12px; font-weight: 500; line-height: 1.7; text-align: center; white-space: normal; overflow-wrap: anywhere; }
.cloud-tag.cloud-win { background: var(--accent-light); border-color: var(--accent); color: var(--accent); font-weight: 600; }
.cloud-tag.cloud-tie { border-style: dashed; }
.cloud-tag.cloud-loss { color: var(--text-muted); background: transparent; }
.round-arrow { padding: 4px 0 8px; color: var(--accent); font-size: 20px; line-height: 1.5; text-align: center; }
.history-details { margin: 20px 16px 0; min-width: 0; border-top: 1px solid var(--border); }
.history-summary, .round-summary { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 44px; padding: 12px 4px; list-style: none; color: var(--text-muted); font-family: var(--font-body); font-size: 13px; line-height: 1.7; cursor: pointer; overflow-wrap: anywhere; }
.history-summary::-webkit-details-marker, .round-summary::-webkit-details-marker { display: none; }
.history-summary:hover, .round-summary:hover { color: var(--accent); }
.history-summary:focus-visible, .round-summary:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: var(--radius-sm); }
.history-summary-open { display: none; }
.history-details[open] > .history-summary .history-summary-closed { display: none; }
.history-details[open] > .history-summary .history-summary-open { display: inline; }
.details-chevron { flex-shrink: 0; color: var(--accent); transition: transform var(--duration-normal) var(--ease-out); }
details[open] > summary > .details-chevron { transform: rotate(90deg); }
.history-rounds { padding: 4px 0 0; }
.round-details { min-width: 0; border-top: 1px solid var(--border); }
.round-summary { padding-inline: 10px; color: var(--text); }
.round-content { padding: 6px 10px 16px; }
@media (max-width: 768px) {
  .bracket-wrap { padding: 12px 6px; }
  .round-section { padding: 0 8px; }
  .cloud-tag { padding: 4px 10px; }
  .cloud-grid { gap: 6px; }
  .round-header { margin-bottom: 10px; font-size: 13px; }
  .history-details { margin: 16px 8px 0; }
  .history-summary, .round-summary { font-size: 12px; }
}
@media (prefers-reduced-motion: reduce) { .details-chevron { transition: none; } }
</style>
