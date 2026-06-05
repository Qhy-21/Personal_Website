<script setup>
import skillsData, { groupKeys } from '../data/skills.js'
import mlCardsData from '../data/mlCards.js'
import { ref } from 'vue'

const mlCards = ref(mlCardsData)

function toggleCard(card) {
  card.open = !card.open
}
</script>

<template>
  <section class="section section-dark">
    <h2 class="section-title">技能树 · SKILL TREE</h2>
    <div class="skills-layout">
      <div v-for="groupKey in groupKeys" :key="groupKey" class="skills-column">
        <div class="pixel-card">
          <h3>{{ groupKey }}</h3>
          <ul class="skill-list">
            <li v-for="skill in skillsData[groupKey]" :key="skill.name">
              <span class="skill-name">{{ skill.name }}</span>
              <div class="skill-bar-wrap">
                <span class="skill-bar" :data-level="skill.level"></span>
                <span class="skill-bar-label">{{ skill.level }}%</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section class="section section-dark ml-section">
    <h2 class="section-title">机器学习知识体系 · ML KNOWLEDGE TREE</h2>
    <div class="ml-domain-grid">
      <div v-for="(card, i) in mlCards" :key="i" class="pixel-card ml-card" :class="{ 'is-open': card.open }" :style="card.dashed ? { borderStyle: 'dashed' } : {}">
        <div class="ml-card-header" @click="toggleCard(card)">
          <span class="ml-card-title">{{ card.title }}</span>
          <span class="ml-card-toggle">▼</span>
        </div>
        <div class="ml-card-body">
          <ul class="ml-topic-list">
            <li v-for="(topic, j) in card.topics" :key="j" v-html="topic"></li>
          </ul>
        </div>
      </div>
    </div>
    <p class="ml-footer">🎯 持续更新中 · 为 AI 构建知识体系</p>
  </section>
</template>

<style scoped>
.skills-layout { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px,1fr)); gap: 16px; margin-top: 6px; }
.skills-column { display: flex; flex-direction: column; gap: 16px; }
.skill-list { list-style: none; padding: 0; margin: 4px 0 0; }
.skill-list li { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 8px; font-size: 12px; }
.skill-name { min-width: 100px; }
.skill-bar-wrap { display: flex; align-items: center; gap: 8px; flex: 1; }
.skill-bar { position: relative; flex: 1; height: 8px; background: #1a102f; border: 2px solid #000; box-shadow: inset 0 0 0 1px var(--border); overflow: hidden; }
.skill-bar::after { content: ""; position: absolute; top: 0; left: 0; bottom: 0; background: linear-gradient(90deg,#ffb3c6,#ffd1e3); width: 0; transition: width 1s ease-out; }
.skill-bar[data-level="70"]::after { width: 70%; }
.skill-bar[data-level="65"]::after { width: 65%; }
.skill-bar[data-level="60"]::after { width: 60%; }
.skill-bar[data-level="55"]::after { width: 55%; }
.skill-bar[data-level="50"]::after { width: 50%; }
.skill-bar[data-level="45"]::after { width: 45%; }
.skill-bar[data-level="40"]::after { width: 40%; }
.skill-bar-label { font-size: 10px; color: var(--text-muted); min-width: 24px; text-align: right; font-family: monospace; }
.ml-section { margin-top: 20px; }
.ml-domain-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px,1fr)); gap: 14px; margin-top: 10px; }
.ml-card { cursor: pointer; transition: all var(--transition-normal) ease; position: relative; overflow: hidden; }
.ml-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg,var(--accent-strong),var(--accent),transparent); opacity: 0; transition: opacity var(--transition-normal) ease; }
.ml-card:hover::before { opacity: 1; }
.ml-card-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
.ml-card-title { font-size: 13px; font-weight: 700; color: var(--accent); }
.ml-card-toggle { font-size: 10px; color: var(--text-muted); transition: transform var(--transition-fast) ease; flex-shrink: 0; }
.ml-card.is-open .ml-card-toggle { transform: rotate(180deg); }
.ml-card-body { max-height: 0; overflow: hidden; transition: max-height 0.4s ease, opacity 0.3s ease; opacity: 0; }
.ml-card.is-open .ml-card-body { max-height: 600px; opacity: 1; }
.ml-topic-list { list-style: none; padding: 0; margin: 6px 0 0; }
.ml-topic-list li { position: relative; padding: 3px 0 3px 14px; font-size: 11px; color: var(--text-muted); line-height: 1.5; }
.ml-topic-list li::before { content: '›'; position: absolute; left: 0; top: 3px; color: var(--accent-strong); font-size: 14px; font-weight: 700; }
.ml-topic-list li :deep(strong) { color: var(--text); }
.ml-footer { margin-top: 12px; font-size: 11px; color: var(--text-muted); text-align: center; }
@media (max-width: 768px) { .ml-domain-grid { grid-template-columns: 1fr; } }
@media (max-width: 480px) { .skills-layout { grid-template-columns: 1fr; } }
</style>
