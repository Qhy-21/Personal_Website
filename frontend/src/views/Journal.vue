<script setup>
import journalsData from '../data/journals.js'
</script>

<template>
  <section class="section section-dark">
    <h2 class="section-title">碎碎念 · NOTES</h2>
    <div class="journal-grid">
      <article v-for="(j, i) in journalsData" :key="i" class="pixel-card journal-card">
        <div class="card-label">{{ j.label }}</div>
        <p style="white-space: pre-line;">{{ j.content }}</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.journal-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px,1fr)); gap: 16px; margin-top: 6px; }
</style>
