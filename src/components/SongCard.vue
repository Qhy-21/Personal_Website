<script setup>
defineProps({
  song: { type: Object, required: true },
  outcome: { type: String, default: null },
  disabled: { type: Boolean, default: false },
  compact: { type: Boolean, default: false },
})

defineEmits(['pick'])
</script>

<template>
  <button
    class="song-card"
    :class="{
      'is-winner': outcome === 'win',
      'is-loser': outcome === 'loss',
      'is-bye': outcome === 'bye',
      'is-compact': compact,
      'is-clickable': !disabled,
    }"
    :disabled="disabled"
    @click="$emit('pick')"
  >
    <div class="song-card-inner">
      <span class="song-title">{{ song.title }}</span>
      <span v-if="!compact" class="song-meta">《{{ song.album }}》<template v-if="song.year"> - {{ song.year }}</template></span>
    </div>
    <div v-if="outcome === 'win'" class="outcome-badge">&#10004;</div>
  </button>
</template>

<style scoped>
.song-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 18px 20px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  color: var(--text);
  font-family: var(--font-body);
  transition: all var(--duration-normal) var(--ease-out);
  cursor: default;
  text-align: left;
}

.song-card.is-clickable {
  cursor: pointer;
}

.song-card.is-clickable:hover {
  border-color: var(--accent);
  background: rgba(255, 128, 184, 0.08);
  box-shadow: 0 0 20px var(--accent-glow);
  transform: translateY(-2px);
}

.song-card.is-clickable:active {
  transform: scale(0.98);
}

.song-card.is-winner {
  border-color: var(--accent);
  background: rgba(255, 128, 184, 0.12);
}

.song-card.is-loser {
  opacity: 0.45;
}

.song-card.is-bye {
  border-style: dashed;
  opacity: 0.5;
}

.song-card-inner {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.song-title {
  font-weight: 600;
  font-size: 17px;
  line-height: 1.3;
}

.song-meta {
  font-size: 12px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.outcome-badge {
  color: var(--accent);
  font-size: 18px;
  flex-shrink: 0;
  margin-left: 12px;
}

.song-card.is-compact {
  padding: 8px 12px;
  font-size: 12px;
}

.song-card.is-compact .song-title {
  font-size: 12px;
}

.song-card.is-compact .song-meta {
  font-size: 10px;
}

@media (max-width: 768px) {
  .song-card {
    padding: 14px 16px;
  }
  .song-title {
    font-size: 15px;
  }
}
</style>
