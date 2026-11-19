<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import PageIntro from '../components/PageIntro.vue'
import SiteIcon from '../components/SiteIcon.vue'
import { useDialog } from '../composables/useDialog'
import projectsData from '../data/projects.js'

interface ProjectLink { type: string; url: string }
interface Project {
  label: string; labelEn?: string; title: string; titleEn?: string
  description: string; descriptionEn?: string; tech_tags: string; tech_tagsEn?: string
  status: string; status_label: string; status_labelEn?: string
  year: string; links: ProjectLink[]
}

const { t, locale } = useI18n()
const english = computed(() => locale.value === 'en')
const projects = projectsData as Project[]
const modalOpen = ref(false)
const selectedProject = shallowRef<Project | null>(null)
const { dialogRef } = useDialog(modalOpen)
const artKinds = ['writing', 'commerce', 'mobile', 'website', 'chat', 'video']

function projectText(project: Project, field: 'label' | 'title' | 'description' | 'status_label') {
  const englishField = `${field}En` as 'labelEn' | 'titleEn' | 'descriptionEn' | 'status_labelEn'
  return english.value ? project[englishField] || project[field] : project[field]
}

function linkLabel(type: string) {
  if (type === 'github') return t('projects.viewOnGithub')
  if (type === 'bilibili') return t('projects.viewOnBilibili')
  return type
}

function projectTags(project: Project) {
  return (english.value ? project.tech_tagsEn || project.tech_tags : project.tech_tags).split(',')
}

function openProject(project: Project) {
  selectedProject.value = project
  modalOpen.value = true
}
</script>

<template>
  <section class="projects-page">
    <PageIntro
      eyebrow="BUILDING & EXPLORING"
      :title="english ? 'Projects & practice' : '项目与实践'"
      :description="english ? 'From a page of words to a working application. A collection of things I learn by making.' : '从一页文字，到一个完整应用。在实践里，把想法慢慢做出来。'"
    >
      <div class="collection-note">
        <span class="collection-count">{{ String(projects.length).padStart(2, '0') }}</span>
        <span>{{ english ? 'projects, and counting' : '个项目，持续生长中' }}</span>
      </div>
    </PageIntro>

    <div class="collection-heading">
      <span>{{ english ? 'A small collection of things I build' : '写代码，也留下做过的痕迹' }}</span>
      <span class="collection-caption">{{ english ? 'Open a project to read more' : '点击项目，了解更多' }} <SiteIcon name="arrow-up-right" /></span>
    </div>

    <div class="project-grid">
      <button
        v-for="(project, index) in projects"
        :key="project.label"
        type="button"
        class="project-card"
        :class="[{ 'project-card-featured': index === 0 }, `project-${artKinds[index]}`]"
        aria-haspopup="dialog"
        @click="openProject(project)"
      >
        <span class="project-art" aria-hidden="true">
          <span class="art-label">{{ project.label.split(' · ')[0] }}</span>
          <span v-if="index === 0" class="writing-art">
            <span class="paper-back"></span>
            <span class="paper-front"><span class="paper-character">笺</span><span class="paper-rule"></span><span class="paper-rule short"></span></span>
            <span class="writing-word">Words become a place.</span>
          </span>
          <span v-else-if="index === 1" class="commerce-art">
            <span class="display-plinth"><span class="display-block"></span></span>
            <span class="display-plinth small"><span class="display-block small"></span></span>
            <span class="art-word">SHOWCASE</span>
          </span>
          <span v-else-if="index === 2" class="mobile-art">
            <span class="phone-outline"><SiteIcon name="music" /><span class="sound-bars"><i></i><i></i><i></i><i></i><i></i></span></span>
            <span class="art-word">JAVA / ANDROID</span>
          </span>
          <span v-else-if="index === 3" class="website-art">
            <span class="pixel-block"></span><span class="code-mark">&lt; / &gt;</span>
            <span class="art-word">A LITTLE PIXEL WORLD</span>
          </span>
          <span v-else-if="index === 4" class="chat-art">
            <span class="chat-bubble back"><i></i><i></i><i></i></span>
            <span class="chat-bubble front"><i></i><i></i><i></i></span>
            <span class="art-word">LET'S CONNECT</span>
          </span>
          <span v-else class="video-art">
            <span class="video-frame"><svg viewBox="0 0 48 48" fill="none"><path d="m19 13 17 11-17 11V13Z" fill="currentColor" /></svg></span>
            <span class="art-word">LEARN. MAKE. SHARE.</span>
          </span>
          <span class="art-caption">{{ english ? 'CONCEPT STUDY' : '概念图形' }}</span>
        </span>

        <span class="project-body">
          <span class="project-topline"><span class="project-domain">{{ projectText(project, 'label').split(' · ')[0] }}</span><span v-if="index === 0" class="featured-label">{{ english ? 'Featured' : '精选项目' }}</span><span v-if="project.year" class="project-year">{{ project.year }}</span></span>
          <span class="project-title">{{ projectText(project, 'title') }}</span>
          <span class="project-description">{{ projectText(project, 'description') }}</span>
          <span class="project-tech"><span v-for="tag in projectTags(project).slice(0, index === 0 ? 5 : 3)" :key="tag" class="tech-tag">{{ tag.trim() }}</span></span>
          <span class="project-bottom"><span class="project-status" :class="{ ongoing: project.status === 'ongoing' }"><span class="status-dot"></span>{{ projectText(project, 'status_label') }}</span><span class="project-open">{{ english ? 'Explore project' : '查看项目' }} <SiteIcon name="arrow-up-right" /></span></span>
        </span>
      </button>
    </div>

    <p class="project-footnote">{{ english ? 'Still learning. Still making.' : '还在学习，也还在创造。' }}</p>
  </section>

  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modalOpen && selectedProject" class="project-modal" @click.self="modalOpen = false">
        <div ref="dialogRef" class="project-modal-inner" role="dialog" aria-modal="true" aria-labelledby="project-dialog-title" tabindex="-1">
          <button type="button" class="project-close" :aria-label="english ? 'Close project' : '关闭项目'" @click="modalOpen = false"><SiteIcon name="close" /></button>
          <p class="project-domain">{{ projectText(selectedProject, 'label').split(' · ')[0] }}<span v-if="selectedProject.year"> / {{ selectedProject.year }}</span></p>
          <h2 id="project-dialog-title" class="project-modal-title">{{ projectText(selectedProject, 'title') }}</h2>
          <span class="project-status" :class="{ ongoing: selectedProject.status === 'ongoing' }"><span class="status-dot"></span>{{ projectText(selectedProject, 'status_label') }}</span>
          <p class="project-modal-description">{{ projectText(selectedProject, 'description') }}</p>
          <div class="project-tech"><span v-for="tag in projectTags(selectedProject)" :key="tag" class="tech-tag">{{ tag.trim() }}</span></div>
          <div class="project-links">
            <a v-for="link in selectedProject.links" :key="link.type" :href="link.url" target="_blank" rel="noopener noreferrer" class="btn btn-primary">{{ linkLabel(link.type) }}<SiteIcon name="arrow-up-right" /></a>
            <p v-if="selectedProject.links.some(link => link.type === 'github')" class="github-note">{{ t('projects.githubWarning') }}</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.collection-note { display: flex; align-items: center; gap: 14px; color: var(--text-muted); font-size: 12px; }
.collection-count { font-family: var(--font-display); font-size: 48px; line-height: 1; color: var(--accent); }
.collection-heading { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 20px; color: var(--text-muted); font-size: 13px; }
.collection-caption { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; }
.collection-caption svg { width: 15px; height: 15px; }
.project-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 28px; }
.project-card { display: flex; flex-direction: column; min-width: 0; padding: 0; overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-card); color: var(--text); font: inherit; text-align: left; cursor: pointer; transition: border-color var(--duration-normal) var(--ease-out), box-shadow var(--duration-normal) var(--ease-out); }
.project-card:hover { border-color: var(--border-strong); box-shadow: var(--shadow-md); }
.project-card-featured { grid-column: 1 / -1; flex-direction: row; }
.project-video { grid-column: 1 / -1; flex-direction: row; }
.project-video .project-art { flex: 0 0 43%; min-height: 260px; }
.project-art { position: relative; display: grid; place-items: center; min-height: 210px; overflow: hidden; isolation: isolate; background: var(--bg-elevated); color: var(--accent); }
.project-art::before { content: ''; position: absolute; inset: 0; z-index: -1; background-image: radial-gradient(var(--border-strong) .75px, transparent .75px); background-size: 16px 16px; opacity: .5; }
.project-card-featured .project-art { flex: 0 0 43%; min-height: 350px; background: color-mix(in srgb, var(--accent-light) 65%, var(--bg-elevated)); }
.art-label { position: absolute; top: 20px; left: 24px; color: var(--text-muted); font-family: var(--font-mono); font-size: 10px; letter-spacing: .12em; }
.art-caption { position: absolute; bottom: 16px; right: 20px; font-family: var(--font-mono); font-size: 9px; letter-spacing: .1em; color: var(--text-muted); }
.art-word { position: absolute; left: 0; right: 0; bottom: -21px; text-align: center; font: 9px var(--font-mono); letter-spacing: .14em; color: var(--text-muted); }
.project-body { display: flex; flex: 1; flex-direction: column; min-width: 0; padding: 28px 30px; }
.project-card-featured .project-body { padding: 40px; justify-content: center; }
.project-topline { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-bottom: 14px; }
.project-domain { margin: 0; font: 10px var(--font-mono); letter-spacing: .12em; color: var(--text-muted); }
.featured-label { color: var(--accent); font-size: 11px; }
.project-year { margin-left: auto; color: var(--text-muted); font: 11px var(--font-mono); }
.project-title { display: block; font-size: 20px; line-height: 1.55; font-weight: 600; letter-spacing: -.02em; }
.project-card-featured .project-title { font-size: 28px; font-family: var(--font-display); font-weight: 500; }
.project-description { display: -webkit-box; overflow: hidden; -webkit-line-clamp: 3; -webkit-box-orient: vertical; margin-top: 12px; color: var(--text-muted); font-size: 14px; line-height: 1.85; }
.project-card-featured .project-description { -webkit-line-clamp: 4; }
.project-tech { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 20px; }
.tech-tag { padding: 3px 9px; border: 1px solid var(--border); border-radius: 5px; color: var(--text-muted); font: 10px/1.6 var(--font-mono); background: var(--bg-elevated); }
.project-bottom { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; margin-top: auto; padding-top: 28px; }
.project-status { display: inline-flex; align-items: center; gap: 7px; color: var(--text-muted); font-size: 12px; }
.status-dot { width: 5px; height: 5px; background: currentColor; border-radius: 50%; }
.project-status.ongoing { color: var(--accent); }
.project-status.ongoing .status-dot { border-radius: 1px; }
.project-open { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; color: var(--accent); }
.project-open svg { width: 16px; height: 16px; transition: transform var(--duration-fast) var(--ease-out); }
.project-card:hover .project-open svg { transform: translate(2px, -2px); }
.project-footnote { margin: 42px 0 10px; color: var(--text-muted); font: italic 16px var(--font-display); text-align: center; }

/* Visual studies refer to each project's subject, rather than inventing UI previews. */
.writing-art { position: relative; width: 180px; height: 230px; }
.paper-back, .paper-front { position: absolute; inset: 8px 20px 20px; border: 1px solid var(--border-strong); background: var(--bg-card); border-radius: 3px; }
.paper-back { transform: rotate(-10deg) translate(-10px, 2px); background: var(--bg-elevated); }
.paper-front { display: flex; flex-direction: column; align-items: center; justify-content: center; transform: rotate(5deg); box-shadow: var(--shadow-sm); }
.paper-character { margin-bottom: 24px; font: 56px/1 var(--font-display); }
.paper-rule { width: 60%; height: 1px; margin-top: 9px; background: var(--border-strong); }
.paper-rule.short { width: 38%; }
.writing-word { position: absolute; bottom: -11px; left: -30px; right: -30px; text-align: center; font: italic 14px var(--font-display); color: var(--text-muted); }
.commerce-art { position: relative; display: flex; gap: 14px; align-items: end; height: 100px; }
.display-plinth { display: flex; align-items: end; justify-content: center; width: 84px; height: 35px; background: var(--border); border: 1px solid var(--border-strong); }
.display-block { position: relative; bottom: 33px; display: block; width: 58px; height: 66px; border-radius: 4px 4px 0 0; border: 1px solid var(--border-strong); background: color-mix(in srgb, var(--accent) 12%, var(--bg-card)); }
.display-block::before { position: absolute; content: ''; top: 11px; left: 14px; right: 14px; height: 16px; border: 1px solid var(--accent); border-top: 0; border-radius: 0 0 12px 12px; opacity: .6; }
.display-plinth.small { width: 65px; height: 24px; }
.display-block.small { width: 42px; height: 45px; bottom: 22px; background: var(--bg-card); }
.display-block.small::before { left: 10px; right: 10px; height: 10px; top: 8px; }
.mobile-art { position: relative; }
.phone-outline { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; width: 73px; height: 125px; border: 1.5px solid var(--border-strong); border-radius: 15px; background: var(--bg-card); transform: rotate(8deg); box-shadow: 8px 8px 0 var(--accent-light); }
.phone-outline::before { content: ''; position: absolute; top: 8px; width: 16px; height: 3px; border-radius: 3px; background: var(--border-strong); }
.phone-outline > svg { width: 27px; height: 27px; }
.sound-bars { display: flex; align-items: center; gap: 4px; height: 18px; }
.sound-bars i { width: 3px; height: 8px; background: var(--accent); opacity: .5; border-radius: 2px; }
.sound-bars i:nth-child(2), .sound-bars i:nth-child(4) { height: 14px; }
.sound-bars i:nth-child(3) { height: 20px; }
.mobile-art .art-word { left: -70px; right: -70px; bottom: -25px; }
.website-art { position: relative; display: grid; place-items: center; width: 210px; height: 95px; }
.pixel-block { position: absolute; width: 72px; height: 72px; background: var(--accent-light); transform: rotate(45deg); }
.pixel-block::before, .pixel-block::after { content: ''; position: absolute; width: 15px; height: 15px; background: var(--accent); opacity: .2; }
.pixel-block::before { left: -22px; top: 30px; }.pixel-block::after { right: -20px; top: 10px; }
.code-mark { z-index: 1; font: 39px var(--font-mono); letter-spacing: -.1em; }
.chat-art { position: relative; width: 150px; height: 90px; }
.chat-bubble { position: absolute; display: flex; align-items: center; justify-content: center; gap: 7px; width: 92px; height: 57px; border: 1px solid var(--border-strong); border-radius: 15px; }
.chat-bubble::after { content: ''; position: absolute; bottom: -5px; width: 10px; height: 10px; transform: rotate(45deg); background: inherit; border-right: inherit; border-bottom: inherit; }
.chat-bubble.back { top: 0; left: 0; background: var(--bg-card); }.chat-bubble.back::after { left: 15px; }
.chat-bubble.front { right: 0; bottom: 0; background: color-mix(in srgb, var(--accent) 12%, var(--bg-card)); }.chat-bubble.front::after { right: 15px; }
.chat-bubble i { width: 4px; height: 4px; border-radius: 50%; background: currentColor; opacity: .6; }
.chat-art .art-word { bottom: -28px; }
.video-art { position: relative; }
.video-frame { display: grid; place-items: center; width: 126px; height: 83px; border: 1px solid var(--border-strong); border-radius: 8px; background: var(--bg-card); box-shadow: -8px 8px 0 var(--accent-light); }
.video-frame svg { width: 38px; height: 38px; }
.video-art .art-word { bottom: -26px; left: -30px; right: -30px; }

.project-modal { position: fixed; inset: 0; z-index: 250; display: grid; place-items: center; padding: 24px; background: rgb(21 16 30 / .58); backdrop-filter: blur(10px); }
.project-modal-inner { position: relative; width: min(620px, 100%); max-height: min(85dvh, 850px); padding: 44px; overflow-y: auto; border: 1px solid var(--border-strong); border-radius: var(--radius-lg); background: var(--bg-card); box-shadow: var(--shadow-md); }
.project-close { position: absolute; top: 12px; right: 12px; display: grid; place-items: center; width: 44px; height: 44px; border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--text-muted); cursor: pointer; }
.project-close:hover { background: var(--accent-light); color: var(--accent); }
.project-close svg { width: 20px; height: 20px; }
.project-modal-title { margin: 24px 0 14px; padding-right: 10px; font: 500 30px/1.5 var(--font-display); color: var(--text); }
.project-modal-description { margin: 26px 0 0; color: var(--text-muted); font-size: 15px; line-height: 1.9; }
.project-links { margin-top: 28px; padding-top: 28px; border-top: 1px solid var(--border); }
.project-links .btn { gap: 12px; }
.project-links .btn svg { width: 17px; height: 17px; }
.github-note { margin: 14px 0 0; color: var(--text-muted); font-size: 12px; line-height: 1.8; }
@media (max-width: 900px) { .project-card-featured .project-body { padding: 28px; }.project-card-featured .project-art { flex-basis: 40%; }.project-card-featured .project-title { font-size: 23px; } }
@media (max-width: 640px) { .project-video { flex-direction: column; } .project-video .project-art { flex-basis: auto; min-height: 190px; } }
@media (max-width: 640px) { .project-grid { grid-template-columns: 1fr; gap: 24px; }.project-card-featured { flex-direction: column; }.project-card-featured .project-art { min-height: 250px; flex-basis: auto; }.writing-art { height: 180px; width: 160px; }.paper-character { font-size: 42px; margin-bottom: 16px; }.writing-word { bottom: -10px; }.project-body, .project-card-featured .project-body { padding: 24px; }.project-card-featured .project-title { font: 600 20px/1.55 var(--font-body); }.project-art { min-height: 190px; }.collection-heading { margin-bottom: 16px; }.collection-caption { display: none; }.collection-note { margin-top: 4px; }.collection-count { font-size: 36px; }.project-modal { padding: 16px; }.project-modal-inner { padding: 40px 24px 28px; }.project-modal-title { font-size: 25px; }.project-links .btn { width: 100%; } }
</style>
