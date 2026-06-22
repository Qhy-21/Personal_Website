<template>
  <section class="section">
    <h2 class="section-title">联络方式 · CONTACT</h2>
    <div class="contact-layout">
      <div class="pixel-card contact-info">
        <h3>如何找到我</h3>
        <ul class="contact-list">
          <li><span class="contact-icon">✉️</span><div class="contact-detail"><span class="contact-label">邮箱</span><a href="mailto:zhf1830657854@163.com" class="contact-value">zhf1830657854@163.com</a></div></li>
          <li><span class="contact-icon">🌐</span><div class="contact-detail"><span class="contact-label">个人网址</span><a href="https://qhy-alfie.work" target="_blank" class="contact-value">qhy-alfie.work</a></div></li>
          <li><span class="contact-icon">🐙</span><div class="contact-detail"><span class="contact-label">GitHub</span><a href="https://github.com/Qhy-21" target="_blank" class="contact-value">github.com/Qhy-21</a></div></li>
          <li><span class="contact-icon">📱</span><div class="contact-detail"><span class="contact-label">电话</span><span class="contact-value">151********</span></div></li>
          <li><span class="contact-icon">📍</span><div class="contact-detail"><span class="contact-label">位置</span><span class="contact-value">安徽·合肥</span></div></li>
          <li><span class="contact-icon">🎓</span><div class="contact-detail"><span class="contact-label">学校</span><span class="contact-value">合肥师范学院 · 软件工程</span></div></li>
        </ul>
        <div class="resume-download">
          <a href="/Qhy_introduction.html" target="_blank" class="btn btn-primary btn-resume">📄 查看我的简历</a>
        </div>
      </div>

      <div class="pixel-card contact-message">
        <h3>给未来的自己</h3>
        <div class="message-content">
          <p>也许某一天，当你回来看这个页面，会发现很多地方都已经改得面目全非。</p>
          <p>但没关系，迭代本来就是生活的常态。</p>
          <p>只要记得，当初你给自己留过这样一间小小的像素屋子，就足够了。</p>
        </div>
        <div class="message-decoration">
          <span class="pixel-art">◆</span>
          <span class="pixel-art">◆</span>
          <span class="pixel-art">◆</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact-layout { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px,1fr)); gap: 18px; }
.contact-list { list-style: none; margin: 4px 0 0; padding: 0; }
.contact-list li { font-size: 13px; margin-bottom: 12px; display: flex; align-items: flex-start; gap: 10px; }
.contact-icon { font-size: 18px; flex-shrink: 0; }
.contact-detail { display: flex; flex-direction: column; gap: 2px; }
.contact-label { color: var(--text-muted); font-size: 11px; }
.contact-value { color: var(--accent); word-break: break-all; }
.resume-download { margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border); }
.btn-resume { width: 100%; justify-content: center; }
.contact-message .message-content p { margin-bottom: 10px; }
.message-decoration { margin-top: 16px; display: flex; justify-content: center; gap: 12px; }
.pixel-art { color: var(--accent); animation: float 3s ease-in-out infinite; }
.pixel-art:nth-child(2) { animation-delay: 0.5s; }
.pixel-art:nth-child(3) { animation-delay: 1s; }
@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
</style>
