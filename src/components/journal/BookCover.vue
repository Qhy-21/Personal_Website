<script setup>
defineProps({
  type: { type: String, required: true },
  coverTitle: { type: String, required: true },
  coverSubtitle: { type: String, default: '' },
})

const linkMap = { essays: '/journal/essays', poems: '/journal/poems' }
</script>

<template>
  <router-link
    class="book-cover"
    :class="`book-cover--${type}`"
    :to="linkMap[type]"
  >
    <div class="book-spine"></div>
    <div class="book-face">
      <span class="book-emblem">&#9672;</span>
      <h3 class="book-title">{{ coverTitle }}</h3>
      <p v-if="coverSubtitle" class="book-sub">{{ coverSubtitle }}</p>
      <span class="book-hint">点击翻开</span>
    </div>
  </router-link>
</template>

<style scoped>
.book-cover {
  position: relative;
  display: flex;
  flex: 1;
  min-width: 220px;
  max-width: 360px;
  min-height: 380px;
  cursor: pointer;
  text-decoration: none;
  border-radius: 4px 12px 12px 4px;
  transition: transform 0.35s var(--ease-out), box-shadow 0.35s var(--ease-out);
}

.book-cover:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
}

.book-cover:hover {
  transform: translateY(-6px);
}

.book-cover:hover .book-spine {
  box-shadow: 4px 0 24px var(--accent-glow);
}

.book-cover:hover .book-hint {
  opacity: 0.7;
}

/* Spine */
.book-spine {
  width: 14px;
  flex-shrink: 0;
  background: linear-gradient(180deg, var(--accent-strong), var(--accent), var(--accent-strong));
  border-radius: 2px 0 0 2px;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
  transition: box-shadow 0.35s var(--ease-out);
  position: relative;
}

.book-spine::after {
  content: '';
  position: absolute;
  top: 12px;
  bottom: 12px;
  left: 3px;
  width: 1px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 1px;
}

/* Face */
.book-face {
  flex: 1;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-left: none;
  border-radius: 0 12px 12px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px 24px;
  text-align: center;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
}

.book-emblem {
  font-size: 28px;
  color: var(--accent);
  opacity: 0.5;
  margin-bottom: 20px;
}

.book-title {
  font-family: var(--font-pixel);
  font-size: 13px;
  color: var(--accent);
  margin: 0 0 12px;
  letter-spacing: 0.06em;
  text-shadow: 0 0 12px var(--accent-glow);
}

.book-sub {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-muted);
  margin: 0 0 28px;
  letter-spacing: 0.08em;
}

.book-hint {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-muted);
  opacity: 0.35;
  transition: opacity 0.35s var(--ease-out);
  letter-spacing: 0.04em;
}

/* Variant accents */
.book-cover--essays .book-spine {
  background: linear-gradient(180deg, #b04ad2, #8b5cf6, #b04ad2);
}

.book-cover--essays .book-title {
  color: #b04ad2;
  text-shadow: 0 0 12px rgba(176, 74, 210, 0.25);
}

.book-cover--essays:hover .book-spine {
  box-shadow: 4px 0 24px rgba(176, 74, 210, 0.3);
}

[data-theme="light"] .book-cover--essays .book-spine {
  background: linear-gradient(180deg, #9333c0, #7c3aed, #9333c0);
}

[data-theme="light"] .book-cover--essays .book-title {
  color: #7c3aed;
}

@media (max-width: 768px) {
  .book-cover {
    min-width: 160px;
    min-height: 300px;
    max-width: none;
  }

  .book-title {
    font-size: 11px;
  }

  .book-emblem {
    font-size: 24px;
  }
}
</style>
