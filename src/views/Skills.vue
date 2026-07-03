<script setup>
import { useI18n } from 'vue-i18n'
import skillsData, { groupKeys, groupNameMap } from '../data/skills.js'
import mlCardsData from '../data/mlCards.js'
import { ref } from 'vue'

const { t, locale } = useI18n()

const mlCards = ref(mlCardsData)

function toggleCard(card) {
  card.open = !card.open
}

function groupDisplay(key) {
  const m = groupNameMap[key]
  return m ? (m[locale.value] || key) : key
}

function cardTitle(card) {
  return locale.value === 'en' && card.titleEn ? card.titleEn : card.title
}

function cardTopics(card) {
  return locale.value === 'en' && card.topicsEn ? card.topicsEn : card.topics
}
</script>

<template>
  <section class="section">
    <h2 class="section-title">{{ t('skills.title') }}</h2>
    <div class="skills-grid">
      <div v-for="(groupKey, i) in groupKeys" :key="groupKey" class="pixel-card skill-group"
        :style="{ animationDelay: `${0.08 * (i + 1)}s` }">
        <h3>{{ groupDisplay(groupKey) }}</h3>
        <ul class="skill-list">
          <li v-for="skill in skillsData[groupKey]" :key="skill.name">
            <div class="skill-header">
              <span class="skill-name">{{ skill.name }}</span>
              <span class="skill-pct">{{ skill.level }}%</span>
            </div>
            <div class="skill-track">
              <span class="skill-fill" :style="{ width: skill.level + '%' }"></span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>

  <section class="section">
    <h2 class="section-title">{{ t('skills.mlTitle') }}</h2>
    <div class="ml-grid">
      <div
        v-for="(card, i) in mlCards"
        :key="i"
        class="pixel-card ml-card"
        :class="{ 'is-open': card.open }"
        :style="{ ...(card.dashed ? { borderStyle: 'dashed' } : {}), animationDelay: `${0.06 * (i + 1)}s` }"
      >
        <div class="ml-card-header" @click="toggleCard(card)">
          <span class="ml-card-title">{{ cardTitle(card) }}</span>
          <span class="ml-card-toggle">&#9660;</span>
        </div>
        <div class="ml-card-body">
          <ul class="ml-topic-list">
            <li v-for="(topic, j) in cardTopics(card)" :key="j" v-html="topic"></li>
          </ul>
        </div>
      </div>
    </div>
    <p class="ml-footer">{{ t('skills.mlFooter') }}</p>
  </section>
</template>

<style scoped>
.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.skill-group {
  animation: fadeInUp 0.5s var(--ease-out) backwards;
}

.skill-group h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 16px;
}

.skill-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.skill-list li {
  margin-bottom: 14px;
}

.skill-list li:last-child {
  margin-bottom: 0;
}

.skill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.skill-name {
  font-size: 13px;
  font-weight: 500;
}

.skill-pct {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
}

.skill-track {
  height: 4px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 2px;
  overflow: hidden;
}

.skill-fill {
  display: block;
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--accent-strong), var(--accent));
  transition: width 1s var(--ease-out);
  animation: fillBar 1s var(--ease-out) backwards;
}

@keyframes fillBar {
  from { width: 0 !important; }
}

.ml-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.ml-card {
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  overflow: hidden;
  animation: fadeInUp 0.5s var(--ease-out) backwards;
}

.ml-card::before { display: none; }
.ml-card::after { display: none; }

.ml-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  user-select: none;
}

.ml-card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.ml-card-toggle {
  font-size: 10px;
  color: var(--text-muted);
  transition: transform var(--duration-fast) var(--ease-out);
  flex-shrink: 0;
}

.ml-card.is-open .ml-card-toggle { transform: rotate(180deg); }

.ml-card-body {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s var(--ease-out), opacity 0.3s var(--ease-out);
  opacity: 0;
}

.ml-card.is-open .ml-card-body {
  max-height: 800px;
  opacity: 1;
}

.ml-topic-list {
  list-style: none;
  padding: 0;
  margin: 12px 0 0;
}

.ml-topic-list li {
  position: relative;
  padding: 4px 0 4px 14px;
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.6;
}

.ml-topic-list li::before {
  content: '\203A';
  position: absolute;
  left: 0; top: 3px;
  color: var(--accent-strong);
  font-size: 14px;
  font-weight: 700;
}

.ml-topic-list li :deep(strong) { color: var(--text); }

.ml-footer {
  margin-top: 16px;
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
}

@media (max-width: 480px) {
  .skills-grid { grid-template-columns: 1fr; }
}
</style>
