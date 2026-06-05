<script setup>
import projectsData from '../data/projects.js'
</script>

<template>
  <section class="section">
    <h2 class="section-title">小作品 · PROJECTS</h2>
    <div class="project-grid">
      <a v-for="(p, i) in projectsData" :key="i" :href="p.link" target="_blank" class="pixel-card project-card project-link" :style="{ animationDelay: `${0.1 * (i + 1)}s` }">
        <div class="card-label">{{ p.label }}</div>
        <h3>{{ p.title }}</h3>
        <p>{{ p.description }}</p>
        <div class="project-tech">
          <span v-for="tag in p.tech_tags.split(',')" :key="tag" class="tech-tag">{{ tag.trim() }}</span>
        </div>
        <div class="project-meta">
          <span class="meta-status" :class="p.status">{{ p.status_label }}</span>
          <span v-if="p.year" class="meta-year">{{ p.year }}</span>
        </div>
      </a>
    </div>
  </section>
</template>

<style scoped>
.project-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px,1fr)); gap: 18px; }
.project-card { animation: fadeInUp 0.6s ease-out backwards; }
.project-link { text-decoration: none; color: inherit; display: block; }
.project-link:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(255,79,139,0.3); }
.project-card h3 { margin-top: 4px; }
.project-meta { margin-top: 12px; display: flex; flex-wrap: wrap; align-items: center; gap: 10px; font-size: 11px; color: var(--text-muted); }
.project-tech { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 6px; }
.tech-tag { padding: 2px 8px; background: rgba(255,179,198,0.1); border: 1px solid var(--border); font-size: 10px; color: var(--accent); }
.meta-status { padding: 2px 8px; background: var(--card-bg-soft); border: 1px solid var(--border); }
.meta-status.completed { border-color: var(--accent); color: var(--accent); }
.meta-status.ongoing { border-color: #ffd700; color: #ffd700; animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%,100% { box-shadow: 0 0 0 2px #000, 0 0 5px var(--accent-glow); } 50% { box-shadow: 0 0 0 2px #000, 0 0 15px var(--accent-glow); } }
.meta-year { color: var(--text-muted); }
@media (max-width: 480px) { .project-grid { grid-template-columns: 1fr; } }
</style>
