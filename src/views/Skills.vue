<script setup lang="ts">
import { computed, nextTick, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import skillsData, { groupKeys, groupMetaMap, groupNameMap } from '../data/skills.js'
import mlCardsData from '../data/mlCards.js'
import PageIntro from '../components/PageIntro.vue'
import SiteIcon from '../components/SiteIcon.vue'

type Planet = {
  id: string
  family: 'engineering' | 'ai'
  mark: string
  color: string
  groupKey?: string
  mlIndex?: number
  shortName?: { zh: string; en: string }
}
type Skill = { name: string; level: number }

const { t, locale } = useI18n()
const isEnglish = computed(() => locale.value === 'en')
const colors = ['#d990b4', '#8da8d7', '#89b6ad', '#b39bd6', '#bea0d6', '#8caacb', '#80b6ae', '#b29bc9', '#86b0bf', '#c4a479']
const mlNames = [
  { zh: '机器学习基础', en: 'ML fundamentals' },
  { zh: '监督学习', en: 'Supervised learning' },
  { zh: '动手实践', en: 'Hands-on practice' },
  { zh: '评估与特征', en: 'Evaluation & features' },
  { zh: '数据科学生态', en: 'Data science' },
  { zh: '下一步学习', en: 'Learning next' },
]
const mlDescriptions = [
  { zh: '从学习方式到优化方法，整理理解模型的基础概念。', en: 'Learning paradigms, optimization, and the concepts behind a model.' },
  { zh: '分类与回归，沿着不同算法理解数据与预测之间的关系。', en: 'Classification and regression through different families of algorithms.' },
  { zh: '把算法放进真实的数据集里，从实现、实验中积累理解。', en: 'From implementation to experiments: putting algorithms to work on datasets.' },
  { zh: '从数据准备、特征处理到模型评估，观察每一步如何影响结果。', en: 'Data preparation, feature processing, and the evaluation of model results.' },
  { zh: '围绕 Python，整理数据处理、可视化与交互实验的工具。', en: 'The Python tools for data preparation, visualization, and interactive experiments.' },
  { zh: '正在学习与接下来想探索的方向。这些是学习计划，尚不代表已掌握。', en: 'Current study and future directions. These are learning plans, not completed skills.' },
]
const mlMarks = ['ML', 'f(x)', 'LAB', 'F₁', 'PY', '→']
const planets: Planet[] = [
  ...groupKeys.map((groupKey: string, index: number) => ({
    id: 'skill-' + index,
    family: index === 3 ? 'ai' as const : 'engineering' as const,
    mark: groupMetaMap[groupKey].mark,
    color: colors[index],
    groupKey,
  })),
  ...mlCardsData.map((_card: unknown, index: number) => ({
    id: 'ml-' + index,
    family: 'ai' as const,
    mark: mlMarks[index],
    color: colors[index + groupKeys.length],
    mlIndex: index,
    shortName: mlNames[index],
  })),
]
const activeId = shallowRef(planets[0].id)
const mapRef = shallowRef<HTMLElement | null>(null)
const panelRef = shallowRef<HTMLElement | null>(null)
const panelTitleRef = shallowRef<HTMLElement | null>(null)
const activePlanet = computed(() => planets.find(planet => planet.id === activeId.value) || planets[0])
const activeCard = computed(() => activePlanet.value.mlIndex == null ? null : mlCardsData[activePlanet.value.mlIndex])
const activeSkills = computed<Skill[]>(() => activePlanet.value.groupKey ? skillsData[activePlanet.value.groupKey] : [])
const activeTopics = computed<string[]>(() => activeCard.value ? (isEnglish.value ? activeCard.value.topicsEn : activeCard.value.topics) : [])
const isLearningNext = computed(() => Boolean(activeCard.value?.dashed))
const engineeringCount = planets.filter(planet => planet.family === 'engineering').length
const skillCount = Object.values(skillsData).reduce((sum, skills) => sum + skills.length, 0)
const topicCount = mlCardsData.reduce((sum, card) => sum + card.topics.length, 0)
const activeNodeCount = computed(() => activeSkills.value.length + activeTopics.value.length)
const knowledgeBands = computed(() => [
  { key: 'core', skills: activeSkills.value.filter(skill => skill.level >= 65) },
  { key: 'familiar', skills: activeSkills.value.filter(skill => skill.level >= 55 && skill.level < 65) },
  { key: 'exploring', skills: activeSkills.value.filter(skill => skill.level < 55) },
].filter(band => band.skills.length))
const activeDescription = computed(() => {
  const planet = activePlanet.value
  if (planet.groupKey) {
    const descriptions = groupMetaMap[planet.groupKey].description
    return isEnglish.value ? descriptions.en : descriptions['zh-CN']
  }
  const description = mlDescriptions[planet.mlIndex ?? 0]
  return isEnglish.value ? description.en : description.zh
})

function planetName(planet: Planet, full = false) {
  if (planet.groupKey) {
    const names = groupNameMap[planet.groupKey]
    return isEnglish.value ? names.en : names['zh-CN']
  }
  if (!full && planet.shortName) return isEnglish.value ? planet.shortName.en : planet.shortName.zh
  const card = mlCardsData[planet.mlIndex ?? 0]
  return (isEnglish.value ? card.titleEn : card.title).replace(/^[^\p{L}\p{N}]+/u, '')
}
function planetNodeCount(planet: Planet) {
  return planet.groupKey ? skillsData[planet.groupKey].length : mlCardsData[planet.mlIndex ?? 0].topics.length
}
function planetLabel(planet: Planet) {
  const next = planet.mlIndex != null && mlCardsData[planet.mlIndex].dashed
  return planetName(planet, true) + (isEnglish.value ? ', ' + planetNodeCount(planet) + ' knowledge nodes' : '，' + planetNodeCount(planet) + ' 个知识节点') + (next ? (isEnglish.value ? ', learning plans' : '，学习计划') : '')
}
function motionBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
}
async function selectPlanet(planet: Planet) {
  activeId.value = planet.id
  await nextTick()
  if (window.matchMedia('(max-width: 980px)').matches) showDetails()
}
function showDetails() {
  panelTitleRef.value?.focus({ preventScroll: true })
  panelRef.value?.scrollIntoView({ block: 'start', behavior: motionBehavior() })
}
function returnToMap() {
  const button = mapRef.value?.querySelector<HTMLButtonElement>('[data-planet-id="' + activeId.value + '"]')
  button?.focus({ preventScroll: true })
  mapRef.value?.scrollIntoView({ block: 'start', behavior: motionBehavior() })
}
function skillName(skill: Skill) {
  const names: Record<string, string> = {
    '数据结构与算法': 'Data Structures & Algorithms',
    '计算机网络': 'Computer Networks',
    '机器学习理论': 'Machine Learning Theory',
  }
  return isEnglish.value ? names[skill.name] || skill.name : skill.name
}
</script>

<template>
  <section class="knowledge-universe">
    <PageIntro
      :eyebrow="isEnglish ? 'A MAP OF WHAT I LEARN' : '持续生长的知识坐标'"
      :title="isEnglish ? 'Knowledge planets' : '知识星球'"
      :description="isEnglish ? 'From engineering foundations to machine learning, every subject belongs to the same growing universe. Choose a planet to look closer.' : '从工程基础到机器学习，把学过的、实践过的，以及正在探索的，都放进同一片星系。选一颗星球，走近看看。'"
    >
      <span class="universe-summary"><strong>{{ planets.length }}</strong>{{ isEnglish ? 'connected planets' : '颗相连的知识星球' }}</span>
    </PageIntro>

    <div class="galaxy-layout">
      <div ref="mapRef" class="orbit-card">
        <header class="orbit-card-meta">
          <span><i class="signal-dot" aria-hidden="true"></i>{{ isEnglish ? 'Choose a knowledge planet' : '选择一颗知识星球' }}</span>
          <span class="orbit-coordinate">QHY / KNOWLEDGE MAP</span>
        </header>

        <div class="orbital-stage" role="group" :aria-label="isEnglish ? 'Knowledge planets' : '知识星图'">
          <svg class="orbit-lines" viewBox="0 0 660 600" preserveAspectRatio="none" aria-hidden="true">
            <ellipse cx="330" cy="300" rx="124" ry="104" />
            <ellipse cx="330" cy="300" rx="240" ry="206" />
            <ellipse cx="330" cy="300" rx="290" ry="270" />
            <path d="M84 155C228 61 496 135 574 367M80 427C228 543 466 494 574 206" />
            <circle cx="138" cy="86" r="2" /><circle cx="520" cy="78" r="1.5" />
            <circle cx="598" cy="300" r="2" /><circle cx="94" cy="506" r="1.5" />
            <circle cx="482" cy="542" r="2" />
          </svg>

          <div class="knowledge-core" aria-hidden="true">
            <span class="core-label">{{ isEnglish ? 'KNOWLEDGE' : '知识核心' }}</span>
            <strong>QHY</strong>
            <span class="core-foot">{{ isEnglish ? 'Still growing' : '持续生长' }}</span>
          </div>

          <button
            v-for="(planet, index) in planets"
            :key="planet.id"
            type="button"
            class="domain-planet"
            :class="['planet-' + index, { 'is-active': activeId === planet.id, 'is-next': planet.mlIndex != null && mlCardsData[planet.mlIndex].dashed }]"
            :style="{ '--planet-color': planet.color, '--planet-diameter': Math.min(66, 42 + planetNodeCount(planet) * 2) + 'px' }"
            :data-planet-id="planet.id"
            :aria-label="planetLabel(planet)"
            :aria-pressed="activeId === planet.id"
            aria-controls="active-planet-panel"
            @click="selectPlanet(planet)"
          >
            <span class="planet-sphere" aria-hidden="true">
              <span class="planet-orbit"></span>
              <span class="planet-mark">{{ planet.mark }}</span>
              <span class="planet-selected"><SiteIcon name="arrow-up-right" :size="11" /></span>
            </span>
            <span class="planet-name">{{ planetName(planet) }}</span>
            <span class="planet-kind">{{ planet.mlIndex != null && mlCardsData[planet.mlIndex].dashed ? (isEnglish ? 'PLANNED' : '学习计划') : (planet.family === 'engineering' ? (isEnglish ? 'ENGINEERING' : '工程基础') : (isEnglish ? 'AI LEARNING' : 'AI 学习')) }}</span>
          </button>
        </div>

        <footer class="map-footer">
          <div class="map-legend">
            <span><i class="legend-dot legend-engineering" aria-hidden="true"></i>{{ isEnglish ? 'Engineering' : '工程基础' }} <b>{{ engineeringCount }}</b></span>
            <span><i class="legend-dot legend-ai" aria-hidden="true"></i>{{ isEnglish ? 'AI learning' : 'AI 学习' }} <b>{{ planets.length - engineeringCount }}</b></span>
          </div>
          <span class="map-node-count">{{ skillCount + topicCount }} {{ isEnglish ? 'knowledge nodes' : '个知识节点' }}</span>
        </footer>
      </div>

      <aside id="active-planet-panel" ref="panelRef" class="planet-panel" :class="{ 'is-planned': isLearningNext }" :style="{ '--planet-color': activePlanet.color }" aria-labelledby="active-planet-title">
        <button type="button" class="map-return" @click="returnToMap"><SiteIcon name="arrow-left" :size="16" />{{ isEnglish ? 'Back to the planets' : '返回知识星图' }}</button>
        <p class="selection-announcement" role="status">{{ isEnglish ? 'Selected: ' : '已选择：' }}{{ planetName(activePlanet, true) }}</p>
        <div :key="activeId" class="panel-content">
          <div class="panel-heading">
            <div class="panel-title-copy">
              <p class="panel-kicker">{{ isLearningNext ? (isEnglish ? 'THE NEXT ORBIT' : '下一段探索') : (isEnglish ? 'CURRENT PLANET' : '当前知识星球') }}</p>
              <h2 id="active-planet-title" ref="panelTitleRef" tabindex="-1">{{ planetName(activePlanet, true) }}</h2>
            </div>
            <span class="panel-planet-mark" aria-hidden="true">{{ activePlanet.mark }}</span>
          </div>
          <p class="panel-description">{{ activeDescription }}</p>

          <div class="panel-stats">
            <span>{{ t('skills.nodes', { n: activeNodeCount }) }}</span>
            <span class="panel-status"><i aria-hidden="true"></i>{{ isLearningNext ? (isEnglish ? 'Learning plans' : '正在学习 / 下一步') : activeCard ? (isEnglish ? 'Learning notes' : '学习与实践笔记') : t('skills.status') }}</span>
          </div>

          <div v-if="activePlanet.groupKey" class="knowledge-bands">
            <section v-for="band in knowledgeBands" :key="band.key" class="knowledge-band">
              <h3>{{ t('skills.levels.' + band.key) }}</h3>
              <ul>
                <li v-for="skill in band.skills" :key="skill.name" :title="skillName(skill) + ' · ' + skill.level + '%'">
                  <span class="skill-star" aria-hidden="true"></span><span>{{ skillName(skill) }}</span>
                </li>
              </ul>
            </section>
          </div>

          <ol v-else class="planet-topics">
            <li v-for="(topic, index) in activeTopics" :key="index">
              <span class="topic-number" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
              <div class="topic-copy" v-html="topic"></div>
            </li>
          </ol>
          <p v-if="isLearningNext" class="learning-note">{{ isEnglish ? 'A direction to grow into, one experiment at a time.' : '为下一次探索留一个位置，一点点靠近。' }}</p>
        </div>
      </aside>
    </div>
    <div class="universe-colophon"><span>QHY · KNOWLEDGE UNIVERSE</span><span>{{ t('skills.mlFooter') }}</span></div>
  </section>
</template>

<style scoped>
.knowledge-universe { --orbit-line: color-mix(in srgb, var(--text-muted) 19%, transparent); margin-bottom: 56px; }
.universe-summary { display: flex; align-items: baseline; gap: 10px; color: var(--text-muted); font-size: 12px; }
.universe-summary strong { font-family: var(--font-display); color: var(--accent); font-size: 34px; font-weight: 500; line-height: 1; }
.galaxy-layout { display: grid; grid-template-columns: minmax(0, 1.42fr) minmax(340px, 1fr); gap: 24px; align-items: start; }
.orbit-card, .planet-panel { min-width: 0; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-card); }
.orbit-card { position: sticky; top: var(--header-offset, 116px); scroll-margin-top: 0; isolation: isolate; background: radial-gradient(ellipse at 50% 46%, var(--accent-light), transparent 42%), radial-gradient(ellipse at 9% 12%, color-mix(in srgb, var(--violet) 7%, transparent), transparent 36%), var(--bg-card); }
.orbit-card::before { position: absolute; z-index: -1; inset: 0; content: ''; border-radius: inherit; background-image: radial-gradient(circle, var(--text-muted) .65px, transparent 1px); background-size: 37px 41px; opacity: .14; pointer-events: none; }
.orbit-card-meta { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px 16px; padding: 22px 24px 0; color: var(--text-muted); font-family: var(--font-mono); font-size: 10px; line-height: 1.6; letter-spacing: .04em; }
.orbit-card-meta > span:first-child { display: inline-flex; align-items: center; gap: 8px; }
.signal-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }
.orbit-coordinate { font-size: 9px; }
.orbital-stage { position: relative; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); grid-template-rows: repeat(5, minmax(106px, auto)); align-items: center; gap: 10px 0; padding: 24px 14px 20px; }
.orbit-lines { position: absolute; z-index: -1; inset: 0; width: 100%; height: 100%; fill: none; stroke: var(--orbit-line); stroke-dasharray: 3 7; stroke-width: .8; pointer-events: none; }
.orbit-lines path { stroke-dasharray: none; opacity: .45; }
.orbit-lines circle { fill: var(--text-muted); stroke: none; opacity: .5; }
.knowledge-core { position: relative; grid-column: 3; grid-row: 3; display: flex; min-width: 0; width: min(100%, 88px); aspect-ratio: 1; align-self: center; justify-self: center; align-items: center; justify-content: center; flex-direction: column; gap: 7px; border: 1px solid color-mix(in srgb, var(--accent) 35%, var(--border)); border-radius: 50%; padding: 10px 6px; background: radial-gradient(circle at 34% 24%, var(--bg-elevated), var(--bg-card) 76%); box-shadow: 0 0 32px var(--accent-light); }
.knowledge-core::before, .knowledge-core::after { position: absolute; border: 1px solid color-mix(in srgb, var(--accent) 18%, transparent); border-radius: 50%; content: ''; pointer-events: none; }
.knowledge-core::before { inset: -9px; }
.knowledge-core::after { inset: -18px; border-style: dashed; }
.core-label, .core-foot { color: var(--text-muted); font-family: var(--font-mono); text-align: center; font-size: 8px; line-height: 1.6; overflow-wrap: anywhere; }
.core-foot { font-size: 8px; letter-spacing: .025em; }
.knowledge-core strong { color: var(--accent); font-family: var(--font-pixel); font-size: 14px; line-height: 1.6; overflow-wrap: anywhere; }
.domain-planet { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; justify-self: center; width: 100%; min-width: 0; min-height: 106px; gap: 6px; padding: 4px 3px; appearance: none; border: 0; background: transparent; color: var(--text); cursor: pointer; }
.planet-sphere { position: relative; display: grid; place-items: center; flex-shrink: 0; width: var(--planet-diameter); height: var(--planet-diameter); border: 1px solid color-mix(in srgb, var(--planet-color) 56%, var(--border)); border-radius: 50%; background: radial-gradient(circle at 29% 23%, color-mix(in srgb, var(--planet-color) 50%, transparent), transparent 49%), radial-gradient(circle at 68% 76%, color-mix(in srgb, var(--planet-color) 20%, transparent), transparent 64%), var(--bg-elevated); box-shadow: inset -5px -6px 12px rgb(25 15 38 / .08), 0 5px 12px rgb(25 15 38 / .05); transition: transform 220ms var(--ease-out), border-color 220ms ease, box-shadow 220ms ease; }
.planet-1 .planet-sphere::before, .planet-7 .planet-sphere::before { position: absolute; content: ''; width: 145%; height: 34%; border: 1px solid color-mix(in srgb, var(--planet-color) 62%, transparent); border-radius: 50%; transform: rotate(-26deg); pointer-events: none; }
.planet-sphere::after { position: absolute; inset: 5px; content: ''; border: 1px solid color-mix(in srgb, var(--planet-color) 16%, transparent); border-radius: inherit; pointer-events: none; }
.planet-mark { position: relative; z-index: 1; color: color-mix(in srgb, var(--planet-color) 38%, var(--text)); font-family: var(--font-mono); font-size: 11px; font-weight: 600; line-height: 1.3; }
.planet-orbit { position: absolute; inset: -6px; border: 1px solid color-mix(in srgb, var(--planet-color) 48%, transparent); border-radius: 50%; opacity: 0; transition: opacity 220ms ease; }
.planet-selected { position: absolute; display: grid; place-items: center; width: 17px; height: 17px; right: -5px; top: -3px; background: var(--accent); color: var(--accent-ink); border: 2px solid var(--bg-card); border-radius: 50%; opacity: 0; }
.planet-name { max-width: 100%; color: var(--text-muted); font-size: 12px; font-weight: 500; line-height: 1.5; text-align: center; overflow-wrap: anywhere; }
.planet-kind { color: var(--text-muted); font-family: var(--font-mono); font-size: 8px; line-height: 1.6; letter-spacing: .025em; text-align: center; overflow-wrap: anywhere; }
.domain-planet:hover .planet-sphere { transform: translateY(-3px); box-shadow: 0 6px 20px color-mix(in srgb, var(--planet-color) 22%, transparent); }
.domain-planet:hover .planet-name, .domain-planet.is-active .planet-name { color: var(--accent); }
.domain-planet.is-active .planet-name { font-weight: 600; }
.domain-planet.is-active .planet-sphere { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-light); }
.domain-planet.is-active .planet-orbit, .domain-planet.is-active .planet-selected { opacity: 1; }
.domain-planet.is-next .planet-sphere, .domain-planet.is-next .planet-orbit { border-style: dashed; }
.domain-planet:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: var(--radius-sm); }
.planet-0 { grid-area: 1 / 2; } .planet-1 { grid-area: 1 / 4; }
.planet-2 { grid-area: 2 / 1; } .planet-3 { grid-area: 2 / 5; }
.planet-4 { grid-area: 3 / 2; } .planet-5 { grid-area: 3 / 4; }
.planet-6 { grid-area: 4 / 1; } .planet-7 { grid-area: 4 / 5; }
.planet-8 { grid-area: 5 / 2; } .planet-9 { grid-area: 5 / 4; }
.map-footer { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin: 0 24px; padding: 18px 0; border-top: 1px solid var(--border); color: var(--text-muted); font-size: 11px; line-height: 1.7; }
.map-legend { display: flex; flex-wrap: wrap; gap: 10px 16px; }
.map-legend > span { display: inline-flex; align-items: center; gap: 6px; }
.map-legend b { font-family: var(--font-mono); font-size: 10px; font-weight: 500; }
.legend-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
.legend-engineering { background: var(--accent); } .legend-ai { background: var(--violet); }
.map-node-count { font-size: 10px; font-family: var(--font-mono); }
.planet-panel { padding: 28px; scroll-margin-top: 120px; }
.panel-content { min-width: 0; animation: planetReveal 180ms ease-out; }
.panel-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.panel-title-copy { min-width: 0; }
.panel-kicker { color: var(--text-muted); font-family: var(--font-mono); font-size: 10px; line-height: 1.7; letter-spacing: .1em; margin: 0; }
.panel-heading h2 { margin: 10px 0 0; font-family: var(--font-display); font-size: clamp(23px, 2.4vw, 30px); font-weight: 500; line-height: 1.5; overflow-wrap: anywhere; }
.panel-heading h2:focus { outline: none; }
.panel-heading h2:focus-visible { outline: 2px solid var(--accent); outline-offset: 5px; }
.panel-planet-mark { display: grid; place-items: center; width: 48px; height: 48px; flex: 0 0 48px; border: 1px solid color-mix(in srgb, var(--planet-color) 48%, var(--border)); border-radius: 50%; background: color-mix(in srgb, var(--planet-color) 12%, var(--bg-elevated)); color: color-mix(in srgb, var(--planet-color) 38%, var(--text)); font-family: var(--font-mono); font-size: 12px; font-weight: 600; }
.panel-description { margin: 18px 0 22px; color: var(--text-muted); font-size: 14px; line-height: 1.9; overflow-wrap: anywhere; }
.panel-stats { display: flex; flex-wrap: wrap; gap: 8px 16px; padding: 14px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); color: var(--text-muted); font-size: 11px; line-height: 1.8; }
.panel-status { display: inline-flex; align-items: center; gap: 7px; }
.panel-status i { width: 5px; height: 5px; border-radius: 50%; background: var(--sage); flex-shrink: 0; }
.is-planned .panel-status { color: var(--accent); }
.is-planned .panel-status i { background: transparent; border: 1px solid var(--accent); width: 7px; height: 7px; }
.knowledge-bands { display: grid; gap: 24px; margin-top: 24px; }
.knowledge-band h3 { color: var(--text-muted); font-size: 12px; line-height: 1.6; font-weight: 500; margin: 0 0 12px; }
.knowledge-band ul { display: flex; flex-wrap: wrap; gap: 8px; margin: 0; padding: 0; list-style: none; }
.knowledge-band li { display: inline-flex; align-items: center; gap: 8px; min-width: 0; max-width: 100%; padding: 8px 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg-elevated); font-size: 12px; line-height: 1.7; overflow-wrap: anywhere; }
.skill-star { width: 4px; height: 4px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }
.planet-topics { list-style: none; margin: 10px 0 0; padding: 0; }
.planet-topics li { display: grid; grid-template-columns: 20px minmax(0, 1fr); align-items: baseline; gap: 12px; padding: 17px 0; border-bottom: 1px solid var(--border); }
.planet-topics li:last-child { border-bottom: 0; padding-bottom: 0; }
.topic-number { font-family: var(--font-mono); font-size: 10px; line-height: 1.8; color: var(--text-muted); font-variant-numeric: tabular-nums; }
.topic-copy { min-width: 0; color: var(--text-muted); font-size: 13px; line-height: 1.9; overflow-wrap: anywhere; }
.topic-copy :deep(strong) { color: var(--text); font-weight: 600; }
.learning-note { padding: 16px 18px; margin: 24px 0 0; background: var(--accent-light); border-left: 2px dashed var(--accent); font-size: 13px; line-height: 1.9; color: var(--text-muted); }
.map-return { display: none; }
.selection-announcement { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; border: 0; clip-path: inset(50%); overflow: hidden; white-space: nowrap; }
.universe-colophon { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px 20px; margin-top: 24px; color: var(--text-muted); font-size: 11px; line-height: 1.8; }
.universe-colophon > span:first-child { font-family: var(--font-mono); font-size: 10px; letter-spacing: .06em; }
@keyframes planetReveal { from { opacity: .4; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
@media (max-width: 1100px) and (min-width: 981px) { .galaxy-layout { grid-template-columns: minmax(0, 1.3fr) minmax(320px, 1fr); gap: 20px; } .planet-panel { padding: 24px; } .planet-name { font-size: 11px; } .orbit-card-meta { padding-inline: 18px; } .orbit-coordinate { display: none; } }
@media (max-width: 980px) { .galaxy-layout { grid-template-columns: 1fr; gap: 24px; } .orbit-card { position: relative; top: auto; } .orbital-stage { padding-inline: 24px; grid-template-rows: repeat(5, minmax(110px, auto)); } .planet-name { max-width: 130px; font-size: 13px; } .planet-kind { font-size: 9px; } .planet-panel { padding: 28px; } .map-return { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; margin: -8px 0 18px; padding: 0; border: 0; background: transparent; color: var(--text-muted); font-size: 13px; line-height: 1.8; } .map-return:hover { color: var(--accent); } .knowledge-core { width: min(100%, 96px); } }
@media (max-width: 600px) {
  .knowledge-universe { margin-bottom: 24px; }
  .universe-summary { gap: 7px; font-size: 11px; }
  .universe-summary strong { font-size: 22px; }
  .galaxy-layout { gap: 14px; }
  .orbit-card, .planet-panel { scroll-margin-top: 0; }
  .orbit-card-meta { padding: 12px 14px 0; font-size: 10px; }
  .orbit-coordinate { display: none; }
  .orbital-stage { grid-template-columns: repeat(3, minmax(0, 1fr)); grid-template-rows: repeat(4, minmax(66px, auto)); gap: 8px 10px; padding: 16px 12px 12px; }
  .planet-0 { grid-area: 1 / 1; } .planet-1 { grid-area: 1 / 2; } .planet-2 { grid-area: 1 / 3; }
  .planet-3 { grid-area: 2 / 1; } .planet-4 { grid-area: 2 / 3; }
  .planet-5 { grid-area: 3 / 1; } .planet-6 { grid-area: 3 / 3; }
  .planet-7 { grid-area: 4 / 1; } .planet-8 { grid-area: 4 / 2; } .planet-9 { grid-area: 4 / 3; }
  .knowledge-core { grid-area: 2 / 2 / 4 / 3; width: min(100%, 64px); gap: 3px; padding: 8px 4px; }
  .knowledge-core::before { inset: -5px; }
  .knowledge-core::after { inset: -10px; }
  .knowledge-core strong { font-size: 11px; }
  .core-label { font-size: 7px; }
  .core-foot { display: none; }
  .domain-planet { min-height: 66px; gap: 5px; padding: 3px 1px; }
  .planet-name { font-size: 11.5px; line-height: 1.4; }
  .planet-kind { display: none; }
  .planet-sphere { width: calc(var(--planet-diameter) - 22px); height: calc(var(--planet-diameter) - 22px); min-width: 32px; min-height: 32px; }
  .planet-mark { font-size: 9px; }
  .planet-sphere::after { inset: 3px; }
  .planet-orbit { inset: -4px; }
  .planet-selected { width: 14px; height: 14px; right: -4px; top: -3px; }
  .map-footer { margin-inline: 14px; gap: 4px 10px; padding: 10px 0; font-size: 10px; }
  .map-legend { gap: 10px; }
  .map-node-count { font-size: 9px; }
  .planet-panel { padding: 16px; }
  .map-return { margin: -4px 0 8px; min-height: 44px; font-size: 12px; }
  .panel-heading { gap: 10px; }
  .panel-heading h2 { font-size: 22px; margin-top: 6px; line-height: 1.4; }
  .panel-kicker { font-size: 9px; }
  .panel-planet-mark { width: 36px; height: 36px; flex-basis: 36px; font-size: 10px; }
  .panel-description { margin: 12px 0 14px; font-size: 13px; line-height: 1.8; }
  .panel-stats { padding: 10px 0; gap: 5px 12px; }
  .knowledge-bands { gap: 18px; margin-top: 18px; }
  .knowledge-band h3 { margin-bottom: 8px; }
  .knowledge-band ul { gap: 6px; }
  .knowledge-band li { padding: 6px 8px; gap: 6px; font-size: 13px; line-height: 1.6; }
  .planet-topics { margin-top: 4px; }
  .planet-topics li { grid-template-columns: 17px minmax(0, 1fr); gap: 8px; padding: 12px 0; }
  .topic-copy { font-size: 13px; line-height: 1.8; }
  .learning-note { padding: 12px 14px; margin-top: 18px; }
  .universe-colophon { margin-top: 16px; gap: 6px; font-size: 10px; }
}
@media (prefers-reduced-motion: reduce) { .panel-content { animation: none; } .planet-sphere, .planet-orbit { transition: none; } .domain-planet:hover .planet-sphere { transform: none; } }
</style>
