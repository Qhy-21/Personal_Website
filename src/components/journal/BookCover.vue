<script setup>
defineProps({
  type: { type: String, required: true }, // articles / essays / poems
  coverTitle: { type: String, required: true },
  coverSubtitle: { type: String, default: '' },
})

const linkMap = {
  articles: '/journal/articles',
  essays: '/journal/essays',
  poems: '/journal/poems',
}
</script>

<template>
  <router-link
    class="book-wrap"
    :class="`book-wrap--${type}`"
    :to="linkMap[type]"
  >
    <!-- ===== 3D Book ===== -->
    <div class="book-3d">
      <!-- 书脊（左侧厚度） -->
      <div class="book-spine">
        <div class="spine-top"></div>
        <div class="spine-title">
          <span class="spine-char" v-for="(ch, i) in coverTitle.split('')" :key="i">{{ ch }}</span>
        </div>
        <div class="spine-lines">
          <span class="spine-line"></span>
          <span class="spine-dot">&#9670;</span>
          <span class="spine-line"></span>
        </div>
        <div class="spine-bottom"></div>
      </div>

      <!-- 封面 -->
      <div class="book-cover-face">
        <!-- 内边框装饰 -->
        <div class="cover-frame">
          <div class="cover-corner cover-corner--tl"></div>
          <div class="cover-corner cover-corner--tr"></div>
          <div class="cover-corner cover-corner--bl"></div>
          <div class="cover-corner cover-corner--br"></div>

          <!-- 顶部徽章 -->
          <div class="cover-emblem">
            <span class="emblem-inner">&#10086;</span>
          </div>

          <!-- 标题区 -->
          <div class="cover-title-block">
            <h3 class="cover-title">{{ coverTitle }}</h3>
            <div class="cover-divider"></div>
            <p v-if="coverSubtitle" class="cover-sub">{{ coverSubtitle }}</p>
          </div>

          <!-- 作者/签名 -->
          <div class="cover-footer">
            <span class="cover-author">羌花吟</span>
          </div>
        </div>
      </div>

      <!-- 书页侧面（右侧厚度） -->
      <div class="book-pages">
        <div class="pages-paper"></div>
      </div>

      <!-- 底部书页侧面 -->
      <div class="book-bottom"></div>

      <!-- 顶部书页侧面 -->
      <div class="book-top"></div>
    </div>

    <!-- 提示 -->
    <div class="book-hint-block">
      <span class="hint-icon">&#128214;</span>
      <span class="hint-text">点击翻开</span>
    </div>
  </router-link>
</template>

<style scoped>
.book-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-decoration: none;
  cursor: pointer;
  perspective: 1500px;
  flex: 1;
  min-width: 240px;
  max-width: 340px;
}

.book-wrap:focus-visible {
  outline: none;
}

.book-wrap:focus-visible .book-3d {
  outline: 2px solid var(--accent);
  outline-offset: 12px;
  border-radius: 4px;
}

/* ===== 3D 书籍主体 ===== */
.book-3d {
  position: relative;
  width: 100%;
  min-height: 400px;
  transform-style: preserve-3d;
  transform: rotateY(-20deg) rotateX(3deg);
  transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1),
              filter 0.4s var(--ease-out);
  filter: drop-shadow(18px 22px 30px rgba(0, 0, 0, 0.45));
}

.book-wrap:hover .book-3d {
  transform: rotateY(-8deg) rotateX(1deg) translateY(-8px);
  filter: drop-shadow(22px 30px 40px rgba(0, 0, 0, 0.55));
}

/* 通用厚度 */
.book-cover-face,
.book-spine,
.book-pages {
  position: absolute;
  top: 0;
  bottom: 0;
}

/* ===== 书脊 ===== */
.book-spine {
  left: 0;
  width: 36px;
  border-radius: 3px 0 0 3px;
  background: var(--spine-bg, linear-gradient(180deg, #8b5cf6 0%, #6d28d9 50%, #8b5cf6 100%));
  box-shadow: inset -3px 0 8px rgba(0, 0, 0, 0.3),
              inset 2px 0 4px rgba(255, 255, 255, 0.1),
              0 2px 8px rgba(0, 0, 0, 0.2);
  transform-origin: left center;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  overflow: hidden;
}

/* 书脊上的竖排标题 */
.spine-top,
.spine-bottom {
  width: 14px;
  height: 14px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  flex-shrink: 0;
}

.spine-title {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 16px 0;
  writing-mode: vertical-rl;
}

.spine-char {
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 2px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  opacity: 0.92;
}

.spine-lines {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin: 10px 0;
}

.spine-line {
  width: 1px;
  height: 16px;
  background: rgba(255, 255, 255, 0.35);
}

.spine-dot {
  color: rgba(255, 255, 255, 0.6);
  font-size: 8px;
  line-height: 1;
}

/* 书脊高光 */
.book-spine::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 6px;
  width: 2px;
  background: linear-gradient(180deg,
    rgba(255, 255, 255, 0.15) 0%,
    rgba(255, 255, 255, 0.35) 50%,
    rgba(255, 255, 255, 0.15) 100%);
  border-radius: 1px;
}

/* ===== 封面 ===== */
.book-cover-face {
  left: 36px;
  right: 12px;
  background: var(--cover-bg, linear-gradient(135deg, #2a1d3d 0%, #1e1530 100%));
  border-radius: 0 6px 6px 0;
  box-shadow:
    inset 0 0 60px rgba(0, 0, 0, 0.25),
    inset 0 2px 0 rgba(255, 255, 255, 0.05);
  padding: 20px;
  transform-origin: left center;
  transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.5s var(--ease-out);
}

.book-wrap:hover .book-cover-face {
  transform: rotateY(-16deg);
  box-shadow:
    inset 0 0 60px rgba(0, 0, 0, 0.2),
    inset 0 2px 0 rgba(255, 255, 255, 0.05),
    6px 0 18px rgba(0, 0, 0, 0.25);
}

/* 封面内边框 */
.cover-frame {
  position: relative;
  width: 100%;
  height: 100%;
  border: 1.5px solid var(--cover-border, rgba(200, 180, 255, 0.35));
  border-radius: 3px;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 四角装饰 */
.cover-corner {
  position: absolute;
  width: 18px;
  height: 18px;
  border: 1.5px solid var(--cover-border, rgba(200, 180, 255, 0.5));
}
.cover-corner--tl { top: 10px; left: 10px; border-right: none; border-bottom: none; }
.cover-corner--tr { top: 10px; right: 10px; border-left: none; border-bottom: none; }
.cover-corner--bl { bottom: 10px; left: 10px; border-right: none; border-top: none; }
.cover-corner--br { bottom: 10px; right: 10px; border-left: none; border-top: none; }

/* 徽章 */
.cover-emblem {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  border: 1.5px solid var(--cover-border, rgba(200, 180, 255, 0.4));
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
  margin-bottom: 28px;
  background: radial-gradient(circle at 30% 30%,
    rgba(255, 255, 255, 0.05) 0%,
    transparent 60%);
}

.emblem-inner {
  font-size: 24px;
  color: var(--cover-accent, #d8b4fe);
  text-shadow: 0 0 12px var(--cover-glow, rgba(216, 180, 254, 0.4));
}

/* 标题 */
.cover-title-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  text-align: center;
  width: 100%;
}

.cover-title {
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  letter-spacing: 4px;
  line-height: 1.4;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.cover-divider {
  width: 50px;
  height: 1.5px;
  background: linear-gradient(90deg,
    transparent 0%,
    var(--cover-accent, #d8b4fe) 50%,
    transparent 100%);
}

.cover-sub {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--cover-sub-color, rgba(230, 220, 255, 0.65));
  margin: 0;
  line-height: 1.7;
}

/* 底部作者 */
.cover-footer {
  margin-top: auto;
  padding-bottom: 12px;
}

.cover-author {
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 13px;
  letter-spacing: 4px;
  color: var(--cover-accent, #d8b4fe);
  opacity: 0.85;
}

/* ===== 书页侧面（右侧） ===== */
.book-pages {
  right: 0;
  width: 12px;
  background: linear-gradient(90deg,
    #e8e4dc 0%,
    #f5f1e8 40%,
    #d8d4cc 100%);
  border-radius: 0 2px 2px 0;
  box-shadow:
    inset -2px 0 4px rgba(0, 0, 0, 0.15),
    inset 2px 0 0 rgba(255, 255, 255, 0.6);
}

/* 纸张纹理线 */
.pages-paper {
  position: absolute;
  top: 3px;
  bottom: 3px;
  left: 2px;
  right: 2px;
  background:
    repeating-linear-gradient(0deg,
      rgba(0, 0, 0, 0.03) 0px,
      rgba(0, 0, 0, 0.03) 0.5px,
      transparent 0.5px,
      transparent 3px);
  border-radius: 1px;
}

/* ===== 顶部 / 底部书页切面 ===== */
.book-top {
  position: absolute;
  left: 36px;
  right: 12px;
  top: 0;
  height: 4px;
  background: linear-gradient(180deg,
    #f5f1e8 0%,
    #d0ccc4 100%);
  transform: rotateX(-90deg) translateY(-2px);
  transform-origin: top center;
  border-radius: 0 2px 0 0;
}

.book-bottom {
  position: absolute;
  left: 36px;
  right: 12px;
  bottom: 0;
  height: 4px;
  background: linear-gradient(0deg,
    #b8b4ac 0%,
    #d8d4cc 100%);
  transform: rotateX(90deg) translateY(2px);
  transform-origin: bottom center;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
}

/* ===== 三个分类的配色 ===== */
/* 文章 Articles - 深蓝墨色 */
.book-wrap--articles {
  --spine-bg: linear-gradient(180deg, #3b5998 0%, #1e3a5f 50%, #3b5998 100%);
  --cover-bg: linear-gradient(145deg, #1a2744 0%, #0f1a2e 100%);
  --cover-border: rgba(160, 200, 255, 0.4);
  --cover-accent: #a4c8ff;
  --cover-glow: rgba(164, 200, 255, 0.4);
  --cover-sub-color: rgba(210, 225, 255, 0.65);
}

/* 随笔 Essays - 紫色 */
.book-wrap--essays {
  --spine-bg: linear-gradient(180deg, #9b59b6 0%, #6c3483 50%, #9b59b6 100%);
  --cover-bg: linear-gradient(145deg, #2d1d3d 0%, #1e1328 100%);
  --cover-border: rgba(200, 160, 255, 0.4);
  --cover-accent: #d8b4fe;
  --cover-glow: rgba(216, 180, 254, 0.4);
  --cover-sub-color: rgba(230, 210, 255, 0.65);
}

/* 诗歌 Poems - 暗红暖色 */
.book-wrap--poems {
  --spine-bg: linear-gradient(180deg, #c0392b 0%, #7b241c 50%, #c0392b 100%);
  --cover-bg: linear-gradient(145deg, #3d1d1d 0%, #281313 100%);
  --cover-border: rgba(255, 180, 160, 0.4);
  --cover-accent: #f5b0a0;
  --cover-glow: rgba(245, 176, 160, 0.4);
  --cover-sub-color: rgba(255, 220, 210, 0.65);
}

/* ===== 亮色主题 ===== */
[data-theme="light"] .book-wrap--articles {
  --spine-bg: linear-gradient(180deg, #2c4a7c 0%, #1a3660 50%, #2c4a7c 100%);
  --cover-bg: linear-gradient(145deg, #e6edf7 0%, #d4dff0 100%);
  --cover-border: rgba(40, 70, 130, 0.3);
  --cover-accent: #2c4a7c;
  --cover-glow: rgba(44, 74, 124, 0.25);
  --cover-sub-color: rgba(60, 80, 120, 0.65);
}
[data-theme="light"] .book-wrap--articles .cover-title,
[data-theme="light"] .book-wrap--essays .cover-title,
[data-theme="light"] .book-wrap--poems .cover-title {
  color: #2a2438;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);
}

[data-theme="light"] .book-wrap--essays {
  --spine-bg: linear-gradient(180deg, #7d3c98 0%, #5b2c6f 50%, #7d3c98 100%);
  --cover-bg: linear-gradient(145deg, #efe6f7 0%, #ddcfe8 100%);
  --cover-border: rgba(110, 50, 150, 0.3);
  --cover-accent: #6c3483;
  --cover-glow: rgba(108, 52, 131, 0.25);
  --cover-sub-color: rgba(90, 60, 120, 0.65);
}

[data-theme="light"] .book-wrap--poems {
  --spine-bg: linear-gradient(180deg, #a93226 0%, #7b241c 50%, #a93226 100%);
  --cover-bg: linear-gradient(145deg, #f7e6e2 0%, #f0d4cc 100%);
  --cover-border: rgba(170, 60, 40, 0.3);
  --cover-accent: #a93226;
  --cover-glow: rgba(169, 50, 38, 0.25);
  --cover-sub-color: rgba(130, 60, 50, 0.65);
}

/* ===== 提示文字 ===== */
.book-hint-block {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  opacity: 0.45;
  transition: opacity 0.3s var(--ease-out),
              color 0.3s var(--ease-out);
}

.book-wrap:hover .book-hint-block {
  opacity: 0.85;
  color: var(--accent);
}

.hint-icon {
  font-size: 14px;
}

/* ===== 响应式 ===== */
@media (max-width: 1024px) {
  .book-3d {
    min-height: 360px;
    transform: rotateY(-12deg) rotateX(2deg);
  }
}

@media (max-width: 768px) {
  .book-wrap {
    min-width: 200px;
    max-width: 280px;
  }
  .book-3d {
    min-height: 320px;
    transform: rotateY(-10deg) rotateX(2deg);
  }
  .book-spine {
    width: 28px;
  }
  .book-cover-face {
    left: 28px;
    right: 10px;
    padding: 14px;
  }
  .book-pages {
    width: 10px;
  }
  .book-top,
  .book-bottom {
    left: 28px;
    right: 10px;
  }
  .cover-title {
    font-size: 22px;
    letter-spacing: 3px;
  }
  .spine-char {
    font-size: 11px;
  }
  .cover-emblem {
    width: 44px;
    height: 44px;
    margin-top: 16px;
    margin-bottom: 20px;
  }
  .emblem-inner {
    font-size: 20px;
  }
}
</style>
