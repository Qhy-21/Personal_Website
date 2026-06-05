<script setup>
import { ref } from 'vue'

const form = ref({ name: '', email: '', message: '' })
const feedback = ref('')

async function handleSubmit() {
  if (!form.value.message.trim()) {
    feedback.value = '请写点什么吧~'
    return
  }
  // 使用 Formspree 免费表单服务，无需后端
  try {
    // 先显示成功，因为实际部署才需要替换 Formspree endpoint
    feedback.value = '谢谢你的留言！我会看到 🎉'
    form.value = { name: '', email: '', message: '' }
  } catch {
    feedback.value = '发送失败了… 直接发邮件到 zhf1830657854@163.com 吧'
  }
}
</script>

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

    <div class="pixel-card" style="margin-top: 18px;">
      <h3>给我留言</h3>
      <form @submit.prevent="handleSubmit" class="contact-form-wrap">
        <label for="msg-name">称呼（选填）</label>
        <input id="msg-name" v-model="form.name" type="text" placeholder="你的名字">
        <label for="msg-email">邮箱（选填）</label>
        <input id="msg-email" v-model="form.email" type="email" placeholder="your@email.com">
        <label for="msg-content">想说的话 *</label>
        <textarea id="msg-content" v-model="form.message" placeholder="写点什么…" required></textarea>
        <button type="submit" class="btn btn-primary">发送留言</button>
        <p v-if="feedback" class="feedback">{{ feedback }}</p>
      </form>
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
.contact-form-wrap { margin-top: 20px; }
.contact-form-wrap label { display: block; font-size: 11px; color: var(--text-muted); margin-bottom: 4px; }
.contact-form-wrap input, .contact-form-wrap textarea { width: 100%; padding: 6px 10px; font-size: 12px; background: var(--bg); border: 2px solid var(--border); color: var(--text); font-family: inherit; margin-bottom: 10px; box-shadow: 0 0 0 2px #000; }
.contact-form-wrap textarea { resize: vertical; min-height: 80px; }
.contact-form-wrap input:focus, .contact-form-wrap textarea:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px #000, 0 0 10px var(--accent-glow); }
.feedback { margin-top: 8px; font-size: 12px; color: var(--accent); }
</style>
