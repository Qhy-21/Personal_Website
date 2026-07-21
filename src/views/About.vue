<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <!-- 头像 + 简介 -->
  <section class="section">
    <h2 class="section-title">{{ t('about.title') }}</h2>
    <div class="pixel-card about-hero">
      <div class="about-avatar">
        <img src="/avatar.png" :alt="t('about.name')">
      </div>
      <div class="about-hero-info">
        <h3 class="about-hero-name">{{ t('about.name') }}</h3>
        <p class="about-hero-role">{{ t('about.role') }}</p>
        <p class="about-hero-desc">{{ t('about.desc') }}</p>
      </div>
    </div>
  </section>

  <!-- 基本信息 + 时间轴 -->
  <section class="section">
    <div class="about-grid-two">
      <div class="pixel-card">
        <h3>{{ t('about.basicInfo') }}</h3>
        <ul class="info-list">
          <li>
            <span class="info-key">{{ t('about.website') }}</span>
            <a href="https://qhy-alfie.work" target="_blank" class="info-value">qhy-alfie.work</a>
          </li>
          <li>
            <span class="info-key">GitHub</span>
            <a href="https://github.com/Qhy-21" target="_blank" class="info-value">github.com/Qhy-21</a>
          </li>
          <li>
            <span class="info-key">{{ t('about.email') }}</span>
            <span class="info-value">zhf1830657854@163.com</span>
          </li>
          <li>
            <span class="info-key">{{ t('about.phone') }}</span>
            <span class="info-value">151********</span>
          </li>
          <li>
            <span class="info-key">{{ t('about.location') }}</span>
            <span class="info-value">{{ t('about.locationValue') }}</span>
          </li>
          <li>
            <span class="info-key">{{ t('about.age') }}</span>
            <span class="info-value">{{ t('about.ageValue') }}</span>
          </li>
          <li>
            <span class="info-key">{{ t('about.school') }}</span>
            <span class="info-value">{{ t('about.schoolValue') }}</span>
          </li>
        </ul>
      </div>

      <div class="pixel-card">
        <h3>{{ t('about.timeline') }}</h3>
        <ul class="timeline">
          <li>
            <span class="time-dot"></span>
            <div class="time-content">
              <div class="time-title">{{ t('about.tl2023Title') }}</div>
              <div class="time-text">{{ t('about.tl2023Text') }}</div>
            </div>
          </li>
          <li>
            <span class="time-dot"></span>
            <div class="time-content">
              <div class="time-title">{{ t('about.tl2024Title') }}</div>
              <div class="time-text">{{ t('about.tl2024Text') }}</div>
            </div>
          </li>
          <li>
            <span class="time-dot"></span>
            <div class="time-content">
              <div class="time-title">{{ t('about.tl2025Title') }}</div>
              <div class="time-text">{{ t('about.tl2025Text') }}</div>
            </div>
          </li>
          <li>
            <span class="time-dot"></span>
            <div class="time-content">
              <div class="time-title">{{ t('about.tl2026Title') }}</div>
              <div class="time-text">{{ t('about.tl2026Text') }}</div>
            </div>
          </li>
          <li>
            <span class="time-dot is-ongoing"></span>
            <div class="time-content">
              <div class="time-title">{{ t('about.tlNowTitle') }}</div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>

  <!-- 联络方式 + 给未来的自己 -->
  <section class="section">
    <div class="contact-grid">
      <div class="pixel-card">
        <h3>{{ t('contact.findMe') }}</h3>
        <ul class="contact-list">
          <li>
            <span class="ci-icon">&#9993;</span>
            <div class="ci-detail">
              <span class="ci-label">{{ t('contact.email') }}</span>
              <a href="mailto:zhf1830657854@163.com" class="ci-value">zhf1830657854@163.com</a>
            </div>
          </li>
          <li>
            <span class="ci-icon">&#9678;</span>
            <div class="ci-detail">
              <span class="ci-label">{{ t('contact.website') }}</span>
              <a href="https://qhy-alfie.work" target="_blank" class="ci-value">qhy-alfie.work</a>
            </div>
          </li>
          <li>
            <span class="ci-icon">&#9672;</span>
            <div class="ci-detail">
              <span class="ci-label">GitHub</span>
              <a href="https://github.com/Qhy-21" target="_blank" class="ci-value">github.com/Qhy-21</a>
            </div>
          </li>
          <li>
            <span class="ci-icon">&#9743;</span>
            <div class="ci-detail">
              <span class="ci-label">{{ t('contact.phone') }}</span>
              <span class="ci-value">151********</span>
            </div>
          </li>
          <li>
            <span class="ci-icon">&#9906;</span>
            <div class="ci-detail">
              <span class="ci-label">{{ t('contact.location') }}</span>
              <span class="ci-value">{{ t('contact.locationValue') }}</span>
            </div>
          </li>
          <li>
            <span class="ci-icon">&#9830;</span>
            <div class="ci-detail">
              <span class="ci-label">{{ t('contact.school') }}</span>
              <span class="ci-value">{{ t('contact.schoolValue') }}</span>
            </div>
          </li>
        </ul>
      </div>

      <div class="pixel-card future-card">
        <h3>{{ t('contact.messageToFuture') }}</h3>
        <div class="future-content">
          <p>{{ t('contact.msg1') }}</p>
          <p>{{ t('contact.msg2') }}</p>
          <p>{{ t('contact.msg3') }}</p>
        </div>
        <div class="future-deco">
          <span class="pixel-diamond">&#9670;</span>
          <span class="pixel-diamond">&#9670;</span>
          <span class="pixel-diamond">&#9670;</span>
        </div>
      </div>
    </div>
  </section>

  <!-- 简历（内联） -->
  <section class="section">
    <h2 class="section-title">{{ t('resume.title') }}</h2>
    <div class="pixel-card resume-inline">
      <div class="resume-header">
        <h2 class="resume-name">Alfie</h2>
        <p class="resume-subtitle">Java全栈开发实习生 | AI应用开发实习生 | 前端开发实习生</p>
      </div>

      <div class="resume-section-block">
        <h3 class="resume-section-title">{{ t('resume.basicInfo') }}</h3>
        <div class="basic-info-grid">
          <div class="bi-item">
            <span class="bi-icon">&#9672;</span>
            <div>
              <span class="bi-key">年龄</span>
              <span class="bi-value">22岁</span>
            </div>
          </div>
          <div class="bi-item">
            <span class="bi-icon">&#9672;</span>
            <div>
              <span class="bi-key">学校</span>
              <span class="bi-value">合肥**** · 软件工程 · 本科（大三，2027届）</span>
            </div>
          </div>
          <div class="bi-item">
            <span class="bi-icon">&#9672;</span>
            <div>
              <span class="bi-key">电话</span>
              <span class="bi-value">151********</span>
            </div>
          </div>
          <div class="bi-item">
            <span class="bi-icon">&#9672;</span>
            <div>
              <span class="bi-key">邮箱</span>
              <span class="bi-value">zhf1830657854@163.com</span>
            </div>
          </div>
          <div class="bi-item">
            <span class="bi-icon">&#9672;</span>
            <div>
              <span class="bi-key">GitHub</span>
              <a href="https://github.com/Qhy-21" target="_blank" class="bi-link">github.com/Qhy-21</a>
            </div>
          </div>
          <div class="bi-item">
            <span class="bi-icon">&#9672;</span>
            <div>
              <span class="bi-key">个人网站</span>
              <a href="https://qhy-alfie.work" target="_blank" class="bi-link">qhy-alfie.work</a>
            </div>
          </div>
        </div>
      </div>

      <div class="resume-section-block">
        <h3 class="resume-section-title">{{ t('resume.techSkills') }}</h3>
        <div class="tech-grid">
          <div class="tech-col">
            <div class="tech-cat">后端</div>
            <div class="tech-chips">
              <span class="r-tag">Java</span><span class="r-tag">SpringBoot 3</span><span class="r-tag">MyBatis-Plus</span>
              <span class="r-tag">JWT</span><span class="r-tag">Maven</span><span class="r-tag">MySQL</span>
              <span class="r-tag">RESTful API</span><span class="r-tag">Netty</span><span class="r-tag">Koa 2</span>
            </div>
          </div>
          <div class="tech-col">
            <div class="tech-cat">前端</div>
            <div class="tech-chips">
              <span class="r-tag">Vue 3</span><span class="r-tag">Vite 5</span><span class="r-tag">Vue Router</span>
              <span class="r-tag">HTML5</span><span class="r-tag">CSS3</span><span class="r-tag">JavaScript ES6+</span>
            </div>
          </div>
          <div class="tech-col">
            <div class="tech-cat">工具</div>
            <div class="tech-chips">
              <span class="r-tag">Git</span><span class="r-tag">npm</span><span class="r-tag">Postman</span>
              <span class="r-tag">Linux</span><span class="r-tag">Jupyter</span><span class="r-tag">Vercel</span>
            </div>
          </div>
          <div class="tech-col">
            <div class="tech-cat">CS基础</div>
            <div class="tech-chips">
              <span class="r-tag">数据结构与算法</span><span class="r-tag">计算机网络</span><span class="r-tag">面向对象设计</span>
            </div>
          </div>
          <div class="tech-col">
            <div class="tech-cat">AI/数据</div>
            <div class="tech-chips">
              <span class="r-tag">numpy</span><span class="r-tag">pandas</span><span class="r-tag">scikit-learn</span><span class="r-tag">机器学习基础</span>
            </div>
          </div>
        </div>
      </div>

      <div class="resume-section-block">
        <h3 class="resume-section-title">{{ t('resume.projects') }}</h3>

        <div class="r-project">
          <div class="rp-head">
            <span class="rp-name">个人网站 v2.0 — Vue 3 + Vite 组件化重构</span>
            <span class="rp-tag">重构</span>
          </div>
          <div class="rp-date">2026.06</div>
          <div class="rp-tech"><strong>技术栈：</strong>Vue 3 (Composition API) · Vite 5 · Vue Router · Vercel</div>
          <ul class="rp-desc">
            <li>Vue Router 管理 6 个页面路由，Header/Footer/背景等提取为可复用组件</li>
            <li>数据驱动：技能、项目、日记、兴趣、ML知识树全部模块化分离</li>
            <li>样式组织：Scoped CSS + 全局样式双层级管理</li>
            <li>启动动画：像素风方块加载动画，提升首屏体验</li>
          </ul>
        </div>

        <div class="r-project">
          <div class="rp-head">
            <span class="rp-name">网上橱窗商城 — SpringBoot 全栈电商平台</span>
            <span class="rp-tag">独立开发</span>
          </div>
          <div class="rp-date">2025.09 – 2025.12</div>
          <div class="rp-tech"><strong>技术栈：</strong>Java · SpringBoot 3.2 · MyBatis-Plus · MySQL · JWT · Vue 3 · Vite · Maven · Git</div>
          <ul class="rp-desc">
            <li>SpringBoot 3.2 + MyBatis-Plus + MySQL，三层架构，RESTful API，统一响应格式与全局异常处理</li>
            <li>JWT 无状态认证 + 拦截器校验，实现登录态管理与接口权限控制</li>
            <li>MyBatis-Plus 分页插件 + HikariCP 连接池；完成用户、商品、订单、购物车等核心表设计</li>
            <li>Vue 3 + Vite 构建 SPA，axios 封装请求拦截器统一注入 Token</li>
          </ul>
        </div>

        <div class="r-project">
          <div class="rp-head">
            <span class="rp-name">墨笺 — 全栈个人书写平台</span>
            <span class="rp-tag">独立开发</span>
          </div>
          <div class="rp-date">2026.02 – 2026.04</div>
          <div class="rp-tech"><strong>技术栈：</strong>Node.js · Koa 2 · MySQL · JWT · Vue 3 · Vite · marked · Puppeteer</div>
          <ul class="rp-desc">
            <li>Koa 2 框架 + RESTful API + JWT 认证中间件</li>
            <li>Markdown 实时编辑预览（marked.js + DOMPurify XSS 防护），文章分类与标签管理，三套主题切换</li>
            <li>Puppeteer 实现 PDF / Word 多格式导出</li>
          </ul>
        </div>

        <div class="r-project">
          <div class="rp-head">
            <span class="rp-name">EasyChat — 仿微信即时通讯</span>
            <span class="rp-tag ongoing">开发中</span>
          </div>
          <div class="rp-date">2026.04 – 至今</div>
          <div class="rp-tech"><strong>技术栈：</strong>Java · SpringBoot · Netty · MyBatis-Plus · MySQL · WebSocket</div>
          <ul class="rp-desc">
            <li>完成用户模块的数据库设计与基础 CRUD 接口开发</li>
            <li>基于 Netty 实现 WebSocket 长连接通信框架搭建</li>
          </ul>
        </div>
      </div>

      <div class="resume-section-block">
        <h3 class="resume-section-title">{{ t('resume.selfEval') }}</h3>
        <ul class="self-eval-list">
          <li>具备独立完成前后端分离项目的全流程能力：需求分析 → 数据库设计 → 接口开发 → 前端实现 → 部署上线</li>
          <li>以项目驱动技术学习，累计完成 5 个以上完整项目，每次迭代均有 GitHub 提交记录</li>
          <li>持续进行技术输出：Vue 3 + Vite 架构重构个人网站，B站发布教学视频，对 AI 应用开发方向有实践探索</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- Slogan -->
  <section class="section">
    <div class="slogan-card">
      <p class="slogan-text">{{ t('about.slogan') }}</p>
    </div>
  </section>
</template>

<style scoped>
/* ===== Hero ===== */
.about-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 20px;
  padding: 36px 28px;
}

.about-avatar img {
  width: 112px;
  height: 112px;
  border: 2px solid var(--accent);
  border-radius: var(--radius-md);
  object-fit: cover;
  background: var(--bg-elevated);
  box-shadow: 0 0 24px var(--accent-glow);
}

.about-hero-name {
  font-family: var(--font-pixel);
  font-size: 16px;
  color: var(--text);
  margin: 0 0 6px;
  letter-spacing: 0.06em;
}

.about-hero-role {
  color: var(--accent);
  font-size: 13px;
  margin: 0 0 8px;
  font-weight: 500;
}

.about-hero-desc {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.7;
  white-space: pre-line;
  max-width: 520px;
  margin: 0 auto;
}

/* ===== Two-column grid ===== */
.about-grid-two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

/* ===== Info list ===== */
.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  font-size: 13px;
  border-bottom: 1px solid var(--border);
}

.info-list li:last-child {
  border-bottom: none;
}

.info-key {
  color: var(--text-muted);
  font-weight: 500;
  min-width: 90px;
}

.info-value {
  color: var(--text);
  text-align: right;
}

/* ===== Timeline ===== */
.timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  border-left: 1px solid var(--border);
}

.timeline li {
  position: relative;
  padding-left: 20px;
  margin-bottom: 16px;
  animation: slideInLeft 0.5s var(--ease-out) backwards;
}

.timeline li:nth-child(1) { animation-delay: 0.05s; }
.timeline li:nth-child(2) { animation-delay: 0.15s; }
.timeline li:nth-child(3) { animation-delay: 0.25s; }
.timeline li:nth-child(4) { animation-delay: 0.35s; }
.timeline li:nth-child(5) { animation-delay: 0.45s; }

.timeline li:last-child {
  margin-bottom: 0;
}

.time-dot {
  position: absolute;
  left: -4.5px;
  top: 4px;
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: var(--accent);
}

.time-dot.is-ongoing {
  animation: dotPulse 2s ease-in-out infinite;
}

@keyframes dotPulse {
  0%, 100% { box-shadow: 0 0 6px var(--accent-glow); }
  50% { box-shadow: 0 0 16px var(--accent-glow); }
}

.time-title {
  font-size: 14px;
  font-weight: 600;
}

.time-text {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 4px;
  line-height: 1.6;
}

/* ===== Contact grid ===== */
.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.contact-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.contact-list li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 13px;
}

.contact-list li:last-child {
  margin-bottom: 0;
}

.ci-icon {
  font-size: 14px;
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--accent);
}

.ci-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ci-label {
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 500;
}

.ci-value {
  color: var(--text);
  word-break: break-all;
}

/* ===== Future card ===== */
.future-card {
  display: flex;
  flex-direction: column;
}

.future-content p {
  margin-bottom: 12px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-muted);
}

.future-content p:last-child {
  margin-bottom: 0;
}

.future-deco {
  margin-top: auto;
  padding-top: 20px;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.pixel-diamond {
  color: var(--accent);
  font-size: 14px;
  animation: diamondFloat 3s ease-in-out infinite;
}

.pixel-diamond:nth-child(2) { animation-delay: 0.5s; }
.pixel-diamond:nth-child(3) { animation-delay: 1s; }

@keyframes diamondFloat {
  0%, 100% { opacity: 0.4; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-6px); }
}

/* ===== Slogan ===== */
.slogan-card {
  background: linear-gradient(135deg, rgba(255, 126, 179, 0.06), rgba(255, 79, 139, 0.04));
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 28px 24px;
  text-align: center;
  backdrop-filter: blur(12px);
}

.slogan-text {
  font-family: var(--font-body);
  font-size: 17px;
  font-weight: 600;
  color: var(--accent);
  margin: 0;
  letter-spacing: 0.04em;
}

/* ===== Resume Inline ===== */
.resume-inline {
  font-size: 14px;
}

.resume-header {
  text-align: center;
  padding-bottom: 20px;
  margin-bottom: 20px;
  border-bottom: 2px solid var(--accent);
}

.resume-name {
  font-family: var(--font-pixel);
  font-size: 18px;
  color: var(--text);
  margin: 0 0 8px;
}

.resume-subtitle {
  font-size: 12px;
  color: var(--accent);
  margin: 0;
  font-weight: 500;
}

.resume-section-block {
  margin-bottom: 24px;
}

.resume-section-block:last-child {
  margin-bottom: 0;
}

.resume-section-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 6px;
  letter-spacing: 0.04em;
}

.resume-section-title::before {
  content: '';
  display: inline-block;
  width: 3px; height: 14px;
  background: var(--accent);
  border-radius: 2px;
  flex-shrink: 0;
}

.basic-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 10px;
}

.bi-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
}

.bi-icon {
  color: var(--accent);
  font-size: 8px;
  margin-top: 4px;
  flex-shrink: 0;
}

.bi-key {
  color: var(--text-muted);
  font-size: 11px;
  display: block;
}

.bi-value {
  color: var(--text);
  font-size: 12px;
}

.bi-link {
  font-size: 12px;
  color: var(--accent);
  display: block;
}

.tech-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tech-col {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.tech-cat {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent);
  min-width: 56px;
  text-align: right;
  flex-shrink: 0;
  font-family: var(--font-mono);
  letter-spacing: 0.04em;
}

.tech-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.r-tag {
  padding: 2px 9px;
  background: rgba(255, 128, 184, 0.07);
  border: 1px solid rgba(255, 128, 184, 0.15);
  border-radius: 12px;
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--text-muted);
}

.r-project {
  margin-bottom: 18px;
  padding-bottom: 16px;
  border-bottom: 1px dashed var(--border);
}

.r-project:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.rp-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 2px;
}

.rp-name {
  font-weight: 700;
  font-size: 13px;
  color: var(--text);
}

.rp-tag {
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
  color: #fff;
  background: var(--accent-strong);
  flex-shrink: 0;
  white-space: nowrap;
}

.rp-tag.ongoing {
  background: #e8960c;
}

.rp-date {
  font-size: 10px;
  color: var(--text-muted);
  font-family: var(--font-mono);
  margin-bottom: 4px;
}

.rp-tech {
  font-size: 11px;
  color: var(--text-muted);
  margin: 4px 0;
  line-height: 1.5;
}

.rp-tech strong {
  color: var(--text);
  font-weight: 600;
}

.rp-desc {
  list-style: none;
  margin: 6px 0 0;
  padding: 0;
}

.rp-desc li {
  position: relative;
  padding-left: 12px;
  margin-bottom: 3px;
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.6;
}

.rp-desc li::before {
  content: '–';
  position: absolute;
  left: 0; top: 0;
  color: var(--text-muted);
  font-size: 11px;
}

.self-eval-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.self-eval-list li {
  position: relative;
  padding-left: 14px;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.7;
}

.self-eval-list li::before {
  content: '\203A';
  position: absolute;
  left: 0; top: -1px;
  color: var(--accent-strong);
  font-size: 14px;
  font-weight: 700;
}

.self-eval-list li:last-child {
  margin-bottom: 0;
}

/* ===== Animations ===== */
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-16px); }
  to { opacity: 1; transform: translateX(0); }
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .about-grid-two {
    grid-template-columns: 1fr;
  }

  .about-hero {
    padding: 24px 18px;
  }

  .about-avatar img {
    width: 80px;
    height: 80px;
  }

  .basic-info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
