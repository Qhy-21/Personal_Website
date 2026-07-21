<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import projectsData from '../data/projects.js'

const { t, locale } = useI18n()

const modalOpen = ref(false)
const selectedProject = ref(null)

function tProj(p, field) {
  const enField = field + 'En'
  if (locale.value === 'en' && p[enField]) return p[enField]
  return p[field]
}

function linkLabel(type) {
  if (type === 'github') return t('projects.viewOnGithub')
  if (type === 'bilibili') return t('projects.viewOnBilibili')
  return type
}

function openModal(p) {
  selectedProject.value = p
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  selectedProject.value = null
}

function onKeydown(e) {
  if (e.key === 'Escape' && modalOpen.value) closeModal()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <section class="section">
    <h2 class="section-title">{{ t('projects.title') }}</h2>
    <div class="project-grid">
      <button
        v-for="(p, i) in projectsData"
        :key="i"
        type="button"
        class="pixel-card project-card"
        :style="{ animationDelay: `${0.08 * (i + 1)}s` }"
        @click="openModal(p)"
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
      </button>
    </div>
  </section>

  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modalOpen" class="project-modal" @click.self="closeModal">
        <div class="project-modal-inner">
          <button type="button" class="interest-close" @click="closeModal" aria-label="Close">&times;</button>

          <div class="card-label">{{ selectedProject ? tProj(selectedProject, 'label') : '' }}</div>
          <h2 class="project-modal-title">{{ selectedProject ? tProj(selectedProject, 'title') : '' }}</h2>
          <p class="project-modal-desc">{{ selectedProject ? tProj(selectedProject, 'description') : '' }}</p>

          <div class="project-tech" v-if="selectedProject">
            <span v-for="tag in selectedProject.tech_tags.split(',')" :key="tag" class="tech-tag">{{ tag.trim() }}</span>
          </div>

          <div class="project-meta" v-if="selectedProject">
            <span class="meta-status" :class="selectedProject.status">{{ tProj(selectedProject, 'status_label') }}</span>
            <span v-if="selectedProject.year" class="meta-year">{{ selectedProject.year }}</span>
          </div>

          <div class="project-links" v-if="selectedProject && selectedProject.links">
            <a
              v-for="link in selectedProject.links"
              :key="link.type"
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="btn"
            >
              {{ linkLabel(link.type) }}
              <span v-if="link.type === 'github'" class="gh-warning">{{ t('projects.githubWarning') }}</span>
            </a>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
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
  width: 100%;
  text-align: left;
  appearance: none;
  border: 1px solid var(--border);
  background: var(--bg-card);
  cursor: pointer;
  font-family: inherit;
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

/* ===== Modal ===== */
.project-modal {
  position: fixed; inset: 0; z-index: 200;
  display: flex; align-items: center; justify-content: center;
  background: rgba(5, 2, 8, 0.5);
  backdrop-filter: blur(20px) saturate(140%);
}

.project-modal-inner {
  position: relative;
  max-width: min(560px, 92vw); width: 100%;
  max-height: 85vh; overflow-y: auto;
  background: var(--bg-elevated);
  backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  padding: 32px 28px 28px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.15);
}

.project-modal-inner .card-label {
  position: static;
  display: inline-block;
  margin-bottom: 12px;
}

.project-modal-title {
  font-family: var(--font-pixel);
  font-size: 14px;
  color: var(--accent);
  margin: 0 0 16px;
}

.project-modal-desc {
  font-size: 14px;
  line-height: 1.8;
  color: var(--text-muted);
  margin: 0 0 16px;
}

.project-modal-inner .project-tech { margin-bottom: 12px; }
.project-modal-inner .project-meta { margin-bottom: 20px; }

.project-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.project-links .btn {
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding: 14px 18px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
}

.gh-warning {
  font-size: 11px;
  font-weight: 400;
  color: var(--text-muted);
  line-height: 1.5;
}

.interest-close {
  position: absolute; top: 12px; right: 16px; z-index: 10;
  appearance: none; border: none; background: none;
  font-size: 24px; color: var(--text-muted); cursor: pointer;
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  transition: all var(--duration-fast) var(--ease-out);
}
.interest-close:hover { color: var(--text); background: rgba(128,128,128,0.1); }

/* ===== transitions ===== */
.modal-enter-active { transition: opacity 0.2s ease; }
.modal-leave-active { transition: opacity 0.15s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 480px) {
  .project-grid { grid-template-columns: 1fr; }
  .project-modal-inner { padding: 24px 18px 20px; }
}
</style>
