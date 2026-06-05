<script setup>
import { ref, onMounted } from 'vue'
import PixelHeader from './components/PixelHeader.vue'
import PixelFooter from './components/PixelFooter.vue'

const loading = ref(true)

onMounted(() => {
  // 至少展示 1.5 秒启动动画，然后淡出
  setTimeout(() => {
    loading.value = false
  }, 2000)
})
</script>

<template>
  <!-- 像素风启动动画 -->
  <Transition name="loader-fade">
    <div v-if="loading" class="page-loader">
      <div class="loader-content">
        <div class="loader-pixels">
          <span class="lp" v-for="i in 12" :key="i" :style="{ '--i': i }"></span>
        </div>
        <p class="loader-text">加载中...</p>
        <p class="loader-sub">在比特流之间生存</p>
      </div>
    </div>
  </Transition>

  <div class="background-grid" aria-hidden="true"></div>
  <div class="background-stars" aria-hidden="true"></div>

  <div class="pixel-page">
    <PixelHeader />
    <main>
      <router-view />
    </main>
    <PixelFooter />
  </div>
</template>

<style scoped>
.page-loader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #05020a;
}

.loader-content {
  text-align: center;
}

.loader-pixels {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-bottom: 24px;
}

.lp {
  width: 12px;
  height: 12px;
  background: #ffb3c6;
  animation: loaderAnim 1.2s ease-in-out infinite;
  animation-delay: calc(var(--i) * 0.08s);
}

@keyframes loaderAnim {
  0%, 80%, 100% {
    opacity: 0.2;
    transform: scale(0.6);
  }
  40% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 12px rgba(255, 179, 198, 0.6);
  }
}

.loader-text {
  font-family: 'Press Start 2P', system-ui, monospace;
  font-size: 12px;
  color: #ffb3c6;
  margin: 0 0 8px;
}

.loader-sub {
  font-size: 11px;
  color: #b3b3d9;
  margin: 0;
}

.loader-fade-enter-active,
.loader-fade-leave-active {
  transition: opacity 0.6s ease;
}
.loader-fade-enter-from,
.loader-fade-leave-to {
  opacity: 0;
}
</style>
