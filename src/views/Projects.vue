<script setup>
import { useI18n } from 'vue-i18n'
import projectsData from '../data/projects.js'

const { t, locale } = useI18n()

function tProj(p, field) {
  const enField = field + 'En'
  if (locale.value === 'en' && p[enField]) return p[enField]
  return p[field]
}
</script>

<template>
  <section class="section">
    <h2 class="section-title">{{ t('projects.title') }}</h2>
    <div class="project-grid">
      <a
        v-for="(p, i) in projectsData"
        :key="i"
        :href="p.link"
        target="_blank"
        class="pixel-card project-card"
        :style="{ animationDelay: `${0.08 * (i + 1)}s` }"
      >
        <div class="card-label">{{ tProj(p, 'label') }}</div>
        <h3>{{ tProj(p, 'title') }}</h3>
        <p>{{ tProj(p, 'description') }}</p>
        <div class="project-tech">
          <span v-for="tag in p.tech_tags.split(',')" :key="tag" class="tech-tag">{{ tag.trim() }}</span>
        </div>
        <div class="project-meta">
          <span class="meta-status" :class="p.status">{{ tProj(p, 'status_label') }}</span>
          <span v-if="p.year" class="meta-year">{{ p.year }}</span>
        </div>
      </a>
    </div>
  </section>
</template>

<style scoped>
.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.project-card {
  animation: fadeInUp 0.5s var(--ease-out) backwards;
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
}

.project-card:hover {
  transform: translateY(-6px);
  border-color: var(--border-strong);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

.project-card h3 { margin-top: 4px; font-size: 16px; }
.project-card p { flex: 1; font-size: 13px; }

.project-tech {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tech-tag {
  padding: 3px 10px;
  background: rgba(255, 128, 184, 0.08);
  border: 1px solid rgba(255, 128, 184, 0.15);
  border-radius: 20px;
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--accent);
}

.project-meta {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  font-size: 11px;
}

.meta-status {
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border);
  color: var(--text-muted);
}

.meta-status.completed {
  border-color: rgba(255, 128, 184, 0.3);
  color: var(--accent);
}

.meta-status.ongoing {
  border-color: rgba(251, 191, 36, 0.3);
  color: #fbbf24;
}

.meta-year { color: var(--text-muted); font-family: var(--font-mono); }

@media (max-width: 480px) {
  .project-grid { grid-template-columns: 1fr; }
}
</style>
