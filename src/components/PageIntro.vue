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
@media (max-width: 640px), (max-width: 980px) and (max-height: 500px) {
  .page-intro { display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; padding: 8px 0 20px; }
  .page-intro h1 { font-size: clamp(25px, 6.6vw, 30px); line-height: 1.35; margin: 10px 0; letter-spacing: .015em; text-wrap: pretty; }
  .page-intro .eyebrow { font-size: 10px; letter-spacing: .06em; }
  .page-lead { font-size: 14px; line-height: 1.75; }
  .page-intro-aside { min-width: 0; padding: 0; }
}
</style>
