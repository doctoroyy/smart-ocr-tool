<template>
  <div class="ocr-component">
    <div class="upload-section">
      <div class="upload-area" @click="triggerFileInput" @drop="handleDrop" @dragover.prevent>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          @change="handleFileSelect"
          style="display: none"
        />
        <div v-if="!selectedImage" class="upload-placeholder">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M7 10L12 15L17 10"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M12 15V3"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <p>点击或拖拽图片到此处上传</p>
          <small>支持 JPG、PNG、GIF 格式</small>
        </div>
        <div v-else class="image-preview">
          <img :src="selectedImage" alt="预览图片" />
          <button @click.stop="clearImage" class="clear-btn">×</button>
        </div>
      </div>
    </div>

    <div class="action-section">
      <button
        @click="performOCR"
        :disabled="!selectedImage || loading"
        class="ocr-btn"
        :class="{ loading }"
      >
        <span v-if="loading">识别中...</span>
        <span v-else>开始识别</span>
      </button>
    </div>

    <div v-if="ocrResults.length > 0" class="results-section">
      <h3>识别结果：</h3>
      <div class="results-container">
        <div v-for="(result, index) in ocrResults" :key="index" class="result-item">
          <p class="result-text">{{ result.text }}</p>
          <small class="result-confidence">置信度: {{ (result.confidence * 100).toFixed(1) }}%</small>
        </div>
      </div>
      <button @click="copyAllText" class="copy-btn">复制全部文字</button>
    </div>

    <div v-if="error" class="error-section">
      <p class="error-message">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface OCRResult {
  text: string
  confidence: number
  bbox?: number[]
}

const fileInput = ref<HTMLInputElement>()
const selectedImage = ref<string>('')
const loading = ref(false)
const ocrResults = ref<OCRResult[]>([])
const error = ref<string>('')
const ocrModel = ref<any>(null)

// 初始化 OCR 模型
onMounted(async () => {
  try {
    // 动态导入 PaddleOCR 模块
    const ocr = await import('@paddlejs-models/ocr')
    await ocr.init()
    ocrModel.value = ocr
    console.log('PaddleOCR 模型加载成功')
  } catch (err) {
    console.error('PaddleOCR 模型加载失败:', err)
    error.value = 'OCR 模型加载失败，请刷新页面重试'
  }
})

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  const file = event.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) {
    processFile(file)
  }
}

const processFile = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    selectedImage.value = e.target?.result as string
    ocrResults.value = []
    error.value = ''
  }
  reader.readAsDataURL(file)
}

const clearImage = () => {
  selectedImage.value = ''
  ocrResults.value = []
  error.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const performOCR = async () => {
  if (!selectedImage.value || !ocrModel.value) {
    error.value = 'OCR 模型未加载或未选择图片'
    return
  }

  loading.value = true
  error.value = ''
  ocrResults.value = []

  try {
    // 创建 Image 对象用于 OCR 识别
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = selectedImage.value
    })

    // 使用 PaddleOCR 进行文字识别
    const results = await ocrModel.value.recognize(img)
    
    console.log('OCR 识别原始结果:', results)
    
    // 根据PaddleOCR文档，结果可能是 { text: string, points: array } 格式
    if (results) {
      if (typeof results === 'object' && results.text) {
        // 单个文本结果
        ocrResults.value = [{
          text: results.text,
          confidence: 0.9,
          bbox: results.points
        }]
      } else if (Array.isArray(results) && results.length > 0) {
        // 多个文本结果
        ocrResults.value = results.map((result: any) => ({
          text: result.text || result.words || result.label || '',
          confidence: result.confidence || result.score || 0.9,
          bbox: result.bbox || result.location || result.points
        }))
      } else {
        console.log('结果格式未知:', results)
        error.value = '未识别到文字内容'
      }
    } else {
      error.value = '未识别到文字内容'
    }
  } catch (err) {
    console.error('OCR 识别失败:', err)
    error.value = 'OCR 识别失败，请重试'
  } finally {
    loading.value = false
  }
}

const copyAllText = async () => {
  const allText = ocrResults.value.map(result => result.text).join('\n')
  try {
    await navigator.clipboard.writeText(allText)
    // 这里可以添加一个成功提示
    console.log('文字已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
  }
}
</script>

<style scoped>
.ocr-component {
  width: 100%;
}

.upload-section {
  margin-bottom: 2rem;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s, background-color 0.3s;
  position: relative;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover {
  border-color: #42b883;
  background-color: rgba(66, 184, 131, 0.05);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #666;
}

.upload-placeholder svg {
  color: #999;
}

.image-preview {
  position: relative;
  max-width: 100%;
}

.image-preview img {
  max-width: 100%;
  max-height: 400px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.clear-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #ff4757;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-btn:hover {
  background: #ff3742;
}

.action-section {
  text-align: center;
  margin-bottom: 2rem;
}

.ocr-btn {
  background: #42b883;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
  min-width: 120px;
}

.ocr-btn:hover:not(:disabled) {
  background: #369870;
}

.ocr-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.ocr-btn.loading {
  background: #ffa500;
}

.results-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.results-section h3 {
  margin-bottom: 1rem;
  color: var(--color-heading);
}

.results-container {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.result-item {
  background: white;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-left: 4px solid #42b883;
}

.result-text {
  margin: 0 0 0.5rem 0;
  font-size: 16px;
  line-height: 1.5;
}

.result-confidence {
  color: #666;
  font-size: 12px;
}

.copy-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.copy-btn:hover {
  background: #0056b3;
}

.error-section {
  background: #ffe6e6;
  border: 1px solid #ffcccc;
  border-radius: 4px;
  padding: 1rem;
  margin-top: 1rem;
}

.error-message {
  color: #d32f2f;
  margin: 0;
}

@media (max-width: 768px) {
  .upload-area {
    padding: 1rem;
    min-height: 150px;
  }
  
  .image-preview img {
    max-height: 250px;
  }
}
</style>