<template>
  <main>
    <div class="home">
      <h1>Vue PaddleOCR 应用</h1>
      <p>这是一个基于 Vue 3 和 PaddleOCR 的文字识别应用</p>
      <p>
        <router-link to="/ocr" class="btn">开始使用 OCR</router-link>
      </p>
    </div>
  </main>
</template>

<script setup lang="ts">
// 暂时为空，后续可以添加逻辑
</script>

<style scoped>
.home {
  text-align: center;
  padding: 2rem;
}

h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

p {
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.btn {
  display: inline-block;
  padding: 12px 24px;
  background: #42b883;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  transition: background 0.3s;
}

.btn:hover {
  background: #369870;
}

@media (max-width: 1024px) {
  h1 {
    font-size: 2rem;
  }
}
</style>