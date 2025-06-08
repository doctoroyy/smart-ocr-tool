<template>
  <main>
    <div class="ocr-container">
      <h1>PaddleOCR 文字识别</h1>
      <OCRComponent />
    </div>
  </main>
</template>

<script setup lang="ts">
import OCRComponent from '@/components/OCRComponent.vue'
</script>

<style scoped>
.ocr-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--color-heading);
}
</style>