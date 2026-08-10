<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  headings: { type: Array, required: true },
  visible: { type: Boolean, required: true },
  tocTitle: { type: String, default: '目录' },
})

const emit = defineEmits(['toggle'])

const mobileOpen = ref(false)

const activeId = ref('')

function scrollTo(id) {
  activeId.value = id
  mobileOpen.value = false
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<template>
  <!-- ===== Desktop / Tablet: sidebar ===== -->
  <aside class="toc-sidebar" :class="{ collapsed: !visible, 'has-headings': headings.length > 0 }">
    <div class="toc-header">
      <button
        type="button"
        class="toc-toggle"
        :title="visible ? '收起目录' : '展开目录'"
        @click="emit('toggle')"
      >
        <span class="toc-toggle-icon">{{ visible ? '«' : '»' }}</span>
        <span v-if="visible" class="toc-toggle-label">{{ tocTitle }}</span>
      </button>
    </div>

    <nav v-show="visible && headings.length > 0" class="toc-nav">
      <a
        v-for="h in headings"
        :key="h.id"
        :href="`#${h.id}`"
        class="toc-link"
        :class="{ 'toc-link--h3': h.level === 3, 'toc-link--active': activeId === h.id }"
        @click.prevent="scrollTo(h.id)"
      >{{ h.text }}</a>
    </nav>

    <p v-show="visible && headings.length === 0" class="toc-empty">无目录</p>
  </aside>

  <!-- ===== Mobile: FAB + overlay ===== -->
  <div v-if="headings.length > 0" class="toc-mobile">
    <button
      type="button"
      class="toc-fab"
      @click="mobileOpen = !mobileOpen"
      aria-label="目录"
    >
      <span class="toc-fab-icon">&#9776;</span>
    </button>

    <Teleport to="body">
      <Transition name="toc-slide">
        <div v-if="mobileOpen" class="toc-overlay" @click.self="mobileOpen = false">
          <div class="toc-panel">
            <div class="toc-panel-header">
              <span class="toc-panel-title">{{ tocTitle }}</span>
              <button type="button" class="toc-panel-close" @click="mobileOpen = false">&times;</button>
            </div>
            <nav class="toc-panel-nav">
              <a
                v-for="h in headings"
                :key="h.id"
                :href="`#${h.id}`"
                class="toc-link"
                :class="{ 'toc-link--h3': h.level === 3 }"
                @click.prevent="scrollTo(h.id)"
              >{{ h.text }}</a>
            </nav>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* ===== Desktop Sidebar ===== */
.toc-sidebar {
  position: sticky;
  top: 100px;
  width: 220px;
  flex-shrink: 0;
  align-self: flex-start;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
  border-right: 1px solid var(--border);
  padding: 16px 16px 16px 0;
  transition: width 0.3s var(--ease-out);
}

.toc-sidebar.collapsed {
  width: 40px;
  padding-right: 8px;
}

.toc-sidebar:not(.has-headings) {
  width: 0;
  padding: 0;
  border: none;
  overflow: hidden;
}

.toc-header {
  display: flex;
  align-items: center;
}

.toc-toggle {
  appearance: none;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 11px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  transition: all var(--duration-fast) var(--ease-out);
}

.toc-toggle:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.collapsed .toc-toggle {
  padding: 6px;
}

.toc-toggle-icon {
  font-size: 14px;
  line-height: 1;
}

.toc-toggle-label {
  letter-spacing: 0.06em;
}

.toc-nav {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.toc-link {
  display: block;
  padding: 6px 10px;
  font-size: 13px;
  color: var(--text-muted);
  text-decoration: none;
  border-radius: var(--radius-sm);
  border-left: 2px solid transparent;
  transition: all var(--duration-fast) var(--ease-out);
  line-height: 1.45;
}

.toc-link:hover {
  color: var(--text);
  background: rgba(128, 128, 128, 0.05);
}

.toc-link--active {
  color: var(--accent);
  border-left-color: var(--accent);
  background: var(--accent-light);
}

.toc-link--h3 {
  padding-left: 24px;
  font-size: 12px;
}

.toc-empty {
  margin-top: 16px;
  font-size: 12px;
  color: var(--text-muted);
  opacity: 0.5;
}

/* ===== Mobile FAB & Overlay ===== */
.toc-mobile {
  display: none;
}

.toc-fab {
  position: fixed;
  bottom: 28px;
  right: 20px;
  z-index: 90;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid var(--border-strong);
  background: var(--bg-card);
  color: var(--accent);
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  transition: all var(--duration-fast) var(--ease-out);
}

.toc-fab:hover {
  border-color: var(--accent);
  box-shadow: 0 4px 28px var(--accent-glow);
  transform: scale(1.05);
}

.toc-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(5, 2, 8, 0.4);
  backdrop-filter: blur(12px);
}

.toc-panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(300px, 80vw);
  background: var(--bg-elevated);
  border-left: 1px solid var(--border-strong);
  padding: 24px 20px;
  overflow-y: auto;
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.3);
}

.toc-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.toc-panel-title {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text);
  letter-spacing: 0.08em;
}

.toc-panel-close {
  appearance: none;
  border: none;
  background: none;
  font-size: 22px;
  color: var(--text-muted);
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all var(--duration-fast) var(--ease-out);
}

.toc-panel-close:hover {
  color: var(--text);
  background: rgba(128, 128, 128, 0.1);
}

.toc-panel-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* Slide transition */
.toc-slide-enter-active { transition: opacity 0.2s ease; }
.toc-slide-enter-active .toc-panel { transition: transform 0.25s var(--ease-out); }
.toc-slide-leave-active { transition: opacity 0.15s ease; }
.toc-slide-leave-active .toc-panel { transition: transform 0.2s var(--ease-out); }
.toc-slide-enter-from { opacity: 0; }
.toc-slide-enter-from .toc-panel { transform: translateX(100%); }
.toc-slide-leave-to { opacity: 0; }
.toc-slide-leave-to .toc-panel { transform: translateX(100%); }

/* ===== Responsive ===== */
@media (max-width: 1023px) {
  .toc-sidebar {
    display: none;
  }

  .toc-mobile {
    display: block;
  }
}
</style>
