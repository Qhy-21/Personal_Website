<script setup lang="ts">
defineProps<{ eyebrow?: string; title: string; description?: string }>()
</script>
<template>
  <header class="page-intro">
    <div class="page-intro-copy">
      <p v-if="eyebrow" class="eyebrow"><span class="pixel-spark" aria-hidden="true"></span>{{ eyebrow }}</p>
      <h1>{{ title }}</h1>
      <p v-if="description" class="page-lead">{{ description }}</p>
    </div>
    <div v-if="$slots.default" class="page-intro-aside"><slot /></div>
  </header>
</template>
<style scoped>
.page-intro { display: flex; align-items: flex-end; justify-content: space-between; gap: 32px; padding: 32px 0 42px; }
.page-intro-copy { min-width: 0; }
.page-intro h1 { font-family: var(--font-display); font-size: clamp(34px, 4.5vw, 54px); line-height: 1.3; font-weight: 500; letter-spacing: .025em; margin: 16px 0; text-wrap: balance; overflow-wrap: anywhere; }
.page-lead { max-width: 620px; color: var(--text-muted); font-size: 15px; line-height: 1.9; margin: 0; text-wrap: pretty; }
.page-intro-aside { flex-shrink: 0; padding-bottom: 4px; }
@media (max-width: 640px) { .page-intro { flex-direction: column; align-items: flex-start; gap: 20px; padding: 20px 0 32px; } }
</style>
