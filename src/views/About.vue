<script setup>
</script>

<template>
  <section class="section">
    <h2 class="section-title">关于我 · ABOUT</h2>
    <div class="about-grid">
      <div class="pixel-card about-intro">
        <div class="about-avatar">
          <img src="/avatar.png" alt="羌花吟">
        </div>
        <div class="about-info">
          <h3>Alfie</h3>
          <p class="about-subtitle">Java / 软件开发实习生</p>
          <p class="about-desc">
            一名正在合肥师范学院读大三的计算机专业学生。
            全栈开发，既能写后端接口，也能在前端挥洒创意。
          </p>
        </div>
      </div>

      <div class="pixel-card">
        <h3>基本信息</h3>
        <ul class="info-list">
          <li><span class="info-icon">🌐</span><span class="info-label">个人网址</span><a href="https://qhy-alfie.work" target="_blank" class="info-value">qhy-alfie.work</a></li>
          <li><span class="info-icon">🐙</span><span class="info-label">GitHub</span><a href="https://github.com/Qhy-21" target="_blank" class="info-value">github.com/Qhy-21</a></li>
          <li><span class="info-icon">📧</span><span class="info-label">邮箱</span><span class="info-value">zhf1830657854@163.com</span></li>
          <li><span class="info-icon">📱</span><span class="info-label">电话</span><span class="info-value">151********</span></li>
          <li><span class="info-icon">📍</span><span class="info-label">位置</span><span class="info-value">安徽·合肥</span></li>
          <li><span class="info-icon">🎂</span><span class="info-label">年龄</span><span class="info-value">22岁</span></li>
          <li><span class="info-icon">🎓</span><span class="info-label">学校</span><span class="info-value">合肥师范学院 · 软件工程</span></li>
        </ul>
      </div>

      <div class="pixel-card">
        <h3>时间轴 · TIMELINE</h3>
        <ul class="timeline">
          <li><span class="time-dot"></span><div class="time-content"><div class="time-title">2023 · 初识代码</div><div class="time-text">在一块旧键盘上敲下第一行「Hello, World!」的那一刻，世界开始变得不一样。</div></div></li>
          <li><span class="time-dot"></span><div class="time-content"><div class="time-title">2024 · Java 入门</div><div class="time-text">开始系统学习 Java，接触 JavaWeb、数据库与前后端交互。</div></div></li>
          <li><span class="time-dot"></span><div class="time-content"><div class="time-title">2025 · 项目实践</div><div class="time-text">完成 Android 应用与网上橱窗商城项目，开始积累实战经验。</div></div></li>
          <li><span class="time-dot"></span><div class="time-content"><div class="time-title">2026 上半年 · 全栈探索</div><div class="time-text">个人网站、学习计时器、墨笺书写平台、EasyChat 仿微信聊天等项目逐步完成。</div></div></li>
          <li><span class="time-dot is-ongoing"></span><div class="time-content"><div class="time-title">现在 · 持续加载中</div></div></li>
        </ul>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="pixel-card self-intro">
      <div class="slogan-text">全栈 × AI · 在学习的路上永不停歇</div>
    </div>
  </section>
</template>

<style scoped>
.about-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px,1fr)); gap: 18px; }
.about-intro { display: flex; gap: 16px; align-items: flex-start; }
.about-avatar { flex-shrink: 0; }
.about-avatar img { width: 100px; height: 100px; border: 3px solid var(--border); object-fit: cover; background: var(--card-bg); }
.about-info { flex: 1; }
.about-subtitle { color: var(--accent); font-size: 12px; margin: 4px 0; }
.about-desc { font-size: 13px; color: var(--text-muted); line-height: 1.6; }
.info-list { list-style: none; padding: 0; margin: 4px 0 0; }
.info-list li { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 8px; font-size: 12px; padding: 6px 0; border-bottom: 1px solid rgba(59,51,88,0.5); }
.info-list li:last-child { border-bottom: none; }
.info-icon { font-size: 16px; margin-right: 8px; }
.info-label { min-width: 100px; }
.info-value { margin-left: auto; color: var(--accent); }
.timeline { list-style: none; margin: 4px 0 0; padding: 0; border-left: 2px solid var(--border); }
.timeline li { position: relative; padding-left: 14px; margin-bottom: 10px; animation: slideInLeft 0.5s ease-out backwards; }
.timeline li:nth-child(1) { animation-delay: 0.05s; }
.timeline li:nth-child(2) { animation-delay: 0.15s; }
.timeline li:nth-child(3) { animation-delay: 0.25s; }
.timeline li:nth-child(4) { animation-delay: 0.35s; }
.timeline li:nth-child(5) { animation-delay: 0.45s; }
@keyframes slideInLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
.time-dot { position: absolute; left: -4px; top: 3px; width: 8px; height: 8px; background: var(--accent-strong); box-shadow: 0 0 0 2px #000; }
.time-dot.is-ongoing { animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%,100% { box-shadow: 0 0 0 2px #000, 0 0 5px var(--accent-glow); } 50% { box-shadow: 0 0 0 2px #000, 0 0 15px var(--accent-glow); } }
.time-title { font-size: 13px; }
.time-text { font-size: 12px; color: var(--text-muted); }
.self-intro { margin-top: 16px; }
.slogan-text { font-size: 16px; color: var(--accent); text-align: center; padding: 8px 0; letter-spacing: 2px; animation: pulse-glow 3s ease-in-out infinite; }
@media (max-width: 768px) {
  .about-intro { flex-direction: column; align-items: center; text-align: center; }
  .about-avatar img { width: 80px; height: 80px; }
}
</style>
