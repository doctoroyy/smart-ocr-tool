<template>
  <div id="app">
    <header>
      <h1>智能 OCR 识别工具</h1>
      <p>支持桌面和移动端的高精度文字识别应用</p>
    </header>

    <main>
      <OCRComponent />
    </main>
  </div>
</template>

<script setup lang="ts">
import OCRComponent from './components/OCRComponent.vue'
</script>

<style scoped>
header {
  text-align: center;
  padding: 2rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-bottom: 2rem;
}

header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 600;
}

header p {
  margin: 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem 2rem;
}

@media (max-width: 768px) {
  header h1 {
    font-size: 2rem;
  }
  
  header p {
    font-size: 1rem;
  }
}
</style>