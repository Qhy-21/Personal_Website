<script setup>
import { computed } from 'vue'

const props = defineProps({
  total: { type: Number, default: null },
  countries: { type: Array, default: () => [] },
  recent: { type: Array, default: () => [] },
  locale: { type: String, required: true },
})
const emit = defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="total !== null" class="visitor-modal" @click.self="emit('close')">
        <div class="visitor-modal-inner">
          <button type="button" class="visitor-close" @click="emit('close')" aria-label="Close">&times;</button>
          <h3 class="visitor-modal-title">
            <span class="vc-dot">&#9672;</span>
            {{ locale === 'en' ? 'Visitor Statistics' : '访客统计' }}
          </h3>
          <p class="visitor-total-line">
            {{ locale === 'en' ? 'Total visits' : '累计访客' }}
            <strong>{{ total?.toLocaleString() }}</strong>
          </p>

          <div v-if="countries.length" class="visitor-bars">
            <div v-for="(c, i) in countries.slice(0, 8)" :key="c.name" class="visitor-bar-row">
              <span class="vb-label">{{ c.name }}</span>
              <span class="vb-track">
                <span class="vb-fill" :style="{ width: Math.max(4, (c.count / countries[0].count) * 100) + '%' }"></span>
              </span>
              <span class="vb-num">{{ c.count }}</span>
            </div>
          </div>

          <div v-if="recent.length" class="visitor-recent">
            <h4 class="vr-title">{{ locale === 'en' ? 'Recent Visitors' : '最近访客' }}</h4>
            <div v-for="(r, i) in recent" :key="i" class="vr-row">
              <span class="vr-loc">{{ r.country }}{{ r.city !== '未知' ? ' · ' + r.city : '' }}</span>
              <span class="vr-time">{{ new Date(r.time).toLocaleString(locale === 'zh-CN' ? 'zh-CN' : 'en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }) }}</span>
            </div>
          </div>

          <p class="visitor-note">
            {{ locale === 'en' ? 'Location based on IP approximation — may not be exact.' : '基于IP近似定位，可能与实际位置有偏差' }}
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.visitor-modal {
  position: fixed; inset: 0; z-index: 220;
  display: flex; align-items: center; justify-content: center;
  background: rgba(5, 2, 8, 0.45);
  backdrop-filter: blur(20px) saturate(140%);
}
.visitor-modal-inner {
  position: relative;
  max-width: min(420px, 92vw); width: 100%;
  max-height: 82vh; overflow-y: auto;
  background: var(--bg-elevated);
  backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  padding: 32px 28px 24px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.15);
}
.visitor-close {
  position: absolute; top: 12px; right: 16px; z-index: 10;
  appearance: none; border: none; background: none;
  font-size: 24px; color: var(--text-muted); cursor: pointer;
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  transition: all var(--duration-fast) var(--ease-out);
}
.visitor-close:hover { color: var(--text); background: rgba(128,128,128,0.1); }

.visitor-modal-title {
  font-family: var(--font-pixel);
  font-size: 11px;
  color: var(--accent);
  margin: 0 0 4px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.vc-dot { font-size: 6px; animation: logoPulse 3s ease-in-out infinite; }

.visitor-total-line {
  text-align: center;
  font-size: 13px;
  color: var(--text-muted);
  margin: 0 0 20px;
}
.visitor-total-line strong {
  font-size: 28px;
  font-family: var(--font-mono);
  color: var(--text);
  display: block;
  margin-top: 4px;
}

.visitor-bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}
.visitor-bar-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.vb-label {
  width: 64px;
  font-size: 12px;
  color: var(--text);
  text-align: right;
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.vb-track {
  flex: 1;
  height: 8px;
  border-radius: 4px;
  background: var(--bg-card);
  overflow: hidden;
}
.vb-fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--accent), var(--accent-strong));
  opacity: 0.7;
  transition: width 0.6s var(--ease-out);
}
.vb-num {
  width: 32px;
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--text-muted);
  text-align: left;
}

.visitor-recent {
  border-top: 1px solid var(--border);
  padding-top: 16px;
  margin-bottom: 12px;
}
.vr-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 10px;
}
.vr-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  padding: 4px 0;
}
.vr-loc { color: var(--text); }
.vr-time { color: var(--text-muted); font-family: var(--font-mono); font-size: 11px; }

.visitor-note {
  font-size: 10px;
  color: var(--text-muted);
  text-align: center;
  margin: 8px 0 0;
  opacity: 0.6;
}

</style>
