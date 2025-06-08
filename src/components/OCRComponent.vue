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
      <div v-if="modelLoading" class="model-loading">
        <p>⏳ 正在加载 OCR 模型，请稍候...</p>
      </div>
      <div v-else-if="ocrModel" class="engine-controls">
        <div class="engine-selector">
          <button 
            @click="switchEngine('paddle')" 
            :class="{ active: selectedEngine === 'paddle', disabled: !paddleOCRModel }"
            :disabled="!paddleOCRModel"
            class="engine-btn"
          >
            ⚡ PaddleOCR
          </button>
          <button 
            @click="switchEngine('tesseract')" 
            :class="{ active: selectedEngine === 'tesseract', disabled: !tesseractModel }"
            :disabled="!tesseractModel"
            class="engine-btn"
          >
            🔧 Tesseract.js
          </button>
        </div>
        <p class="engine-description">{{ getEngineDescription() }}</p>
      </div>
      <button
        @click="performOCR"
        :disabled="!selectedImage || loading || modelLoading"
        class="ocr-btn"
        :class="{ loading, disabled: modelLoading }"
      >
        <span v-if="loading">识别中...</span>
        <span v-else-if="modelLoading">模型加载中...</span>
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
const modelLoading = ref(true)
const ocrResults = ref<OCRResult[]>([])
const error = ref<string>('')
const ocrModel = ref<any>(null)
const useNativeOCR = ref(false)
const paddleOCRModel = ref<any>(null)
const tesseractModel = ref<any>(null)
const manualEngineSelection = ref(false)
const selectedEngine = ref<string>('paddle')

// 检查 WebGL 支持
const checkWebGLSupport = () => {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) {
      return false
    }
    
    // 检查基本的 WebGL 功能
    const renderer = gl.getParameter(gl.RENDERER)
    const vendor = gl.getParameter(gl.VENDOR)
    console.log('WebGL 支持检测:', { renderer, vendor })
    
    return true
  } catch (e) {
    console.error('WebGL 检测失败:', e)
    return false
  }
}

// 检查是否支持原生 OCR API（实验性）
const checkNativeOCRSupport = () => {
  return 'createImageBitmap' in window && 'OffscreenCanvas' in window
}

// 使用 Tesseract.js 作为后备方案
const initTesseractOCR = async () => {
  try {
    const Tesseract = await import('tesseract.js')
    return Tesseract
  } catch (e) {
    console.error('Tesseract.js 加载失败:', e)
    return null
  }
}

// 切换 OCR 引擎
const switchEngine = (engine: string) => {
  if (engine === 'paddle' && paddleOCRModel.value) {
    selectedEngine.value = 'paddle'
    ocrModel.value = paddleOCRModel.value
    useNativeOCR.value = false
    manualEngineSelection.value = true
    console.log('切换到 PaddleOCR 引擎')
  } else if (engine === 'tesseract' && tesseractModel.value) {
    selectedEngine.value = 'tesseract'
    ocrModel.value = tesseractModel.value
    useNativeOCR.value = true
    manualEngineSelection.value = true
    console.log('切换到 Tesseract.js 引擎')
  }
}

// 获取引擎描述
const getEngineDescription = () => {
  if (selectedEngine.value === 'paddle') {
    return '高性能模式 - 适用于桌面设备，识别速度快，准确率高'
  } else if (selectedEngine.value === 'tesseract') {
    return '兼容模式 - 适用于移动设备，纯JavaScript实现，兼容性更好'
  }
  return ''
}

// 初始化 OCR 模型
onMounted(async () => {
  try {
    console.log('开始加载 OCR 引擎...')
    
    // 并行加载两个引擎
    const loadEngines = []
    
    // 尝试加载 PaddleOCR
    if (checkWebGLSupport()) {
      loadEngines.push(
        (async () => {
          try {
            console.log('检测到 WebGL 支持，尝试加载 PaddleOCR...')
            const ocr = await import('@paddle-js-models/ocr')
            console.log('PaddleOCR 模块导入成功, 开始初始化...')
            await ocr.init()
            paddleOCRModel.value = ocr
            console.log('PaddleOCR 模型加载成功')
          } catch (paddleError) {
            console.warn('PaddleOCR 加载失败:', paddleError)
          }
        })()
      )
    }
    
    // 尝试加载 Tesseract.js
    loadEngines.push(
      (async () => {
        try {
          console.log('尝试加载 Tesseract.js...')
          const tesseract = await initTesseractOCR()
          if (tesseract) {
            tesseractModel.value = tesseract
            console.log('Tesseract.js 加载成功')
          }
        } catch (tesseractError) {
          console.warn('Tesseract.js 加载失败:', tesseractError)
        }
      })()
    )
    
    // 等待所有引擎加载完成
    await Promise.all(loadEngines)
    
    // 设置默认引擎
    if (paddleOCRModel.value) {
      selectedEngine.value = 'paddle'
      ocrModel.value = paddleOCRModel.value
      useNativeOCR.value = false
      console.log('默认使用 PaddleOCR 引擎')
    } else if (tesseractModel.value) {
      selectedEngine.value = 'tesseract'
      ocrModel.value = tesseractModel.value
      useNativeOCR.value = true
      console.log('默认使用 Tesseract.js 引擎')
    } else {
      throw new Error('无法加载任何 OCR 引擎')
    }
    
  } catch (err) {
    console.error('OCR 初始化失败:', err)
    error.value = `OCR 初始化失败: 您的设备可能不支持当前的 OCR 功能。\n建议使用最新版本的 Chrome、Safari 或 Firefox 浏览器。`
  } finally {
    modelLoading.value = false
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
  if (!selectedImage.value) {
    error.value = '请先选择图片'
    return
  }
  
  if (!ocrModel.value) {
    error.value = 'OCR 模型未加载，请等待模型加载完成或刷新页面重试'
    console.log('OCR 模型状态:', ocrModel.value)
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

    let results
    
    if (useNativeOCR.value) {
      // 使用 Tesseract.js
      console.log('使用 Tesseract.js 进行识别...')
      
      // 图像预处理：增强对比度和清晰度
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = img.width
      canvas.height = img.height
      
      // 绘制原图
      ctx.drawImage(img, 0, 0)
      
      // 获取图像数据进行预处理
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      
      // 增强对比度和去噪
      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
        // 二值化处理，提高文字识别率
        const threshold = 128
        const newValue = gray > threshold ? 255 : 0
        data[i] = newValue     // R
        data[i + 1] = newValue // G
        data[i + 2] = newValue // B
      }
      
      ctx.putImageData(imageData, 0, 0)
      
      const worker = await ocrModel.value.createWorker('chi_sim+eng', 1, {
        logger: m => console.log('Tesseract:', m)
      })
      
      // 设置更高精度的 OCR 参数
      await worker.setParameters({
        tessedit_char_whitelist: '', // 移除字符限制
        tessedit_pageseg_mode: ocrModel.value.PSM.SINGLE_BLOCK, // 单块文本模式，适合票据
        tessedit_ocr_engine_mode: ocrModel.value.OEM.LSTM_ONLY, // 使用 LSTM 引擎
        preserve_interword_spaces: '1', // 保留词间空格
        user_defined_dpi: '300', // 设置更高 DPI
        tessedit_create_hocr: '1', // 创建 hOCR 输出
        tessedit_write_images: '0', // 不输出中间图像
        classify_enable_learning: '0', // 禁用学习模式提高稳定性
        classify_enable_adaptive_matcher: '1', // 启用自适应匹配
        textord_really_old_xheight: '1', // 改善字符高度检测
        textord_min_xheight: '10', // 最小字符高度
        tessedit_reject_mode: '0', // 减少拒绝率
        load_system_dawg: '0', // 禁用系统词典，提高中文识别
        load_freq_dawg: '0', // 禁用频率词典
        load_unambig_dawg: '0', // 禁用无歧义词典
        load_punc_dawg: '0', // 禁用标点词典
        load_number_dawg: '1', // 启用数字词典，票据有很多数字
        load_bigram_dawg: '0', // 禁用双字母词典
      })
      
      // 使用预处理后的图像进行识别
      const { data: ocrData } = await worker.recognize(canvas)
      await worker.terminate()
      
      // 后处理：清理识别结果
      let cleanedText = ocrData.text.trim()
      // 移除多余的空行和空格
      cleanedText = cleanedText.replace(/\n\s*\n/g, '\n').replace(/\s+/g, ' ')
      
      results = {
        text: cleanedText,
        confidence: ocrData.confidence / 100,
        words: ocrData.words
      }
    } else {
      // 使用 PaddleOCR
      console.log('使用 PaddleOCR 进行识别...')
      results = await ocrModel.value.recognize(img)
    }
    
    console.log('OCR 识别原始结果:', results)
    
    // 处理不同 OCR 引擎的结果格式
    if (results) {
      if (useNativeOCR.value) {
        // Tesseract.js 结果格式
        if (results.text && results.text.length > 0) {
          // 将文本按行分割，每行作为一个结果项
          const lines = results.text.split('\n').filter(line => line.trim().length > 0)
          
          if (lines.length > 0) {
            ocrResults.value = lines.map((line: string, index: number) => ({
              text: line.trim(),
              confidence: results.confidence || 0.8,
              bbox: null
            }))
          } else {
            ocrResults.value = [{
              text: results.text,
              confidence: results.confidence || 0.8,
              bbox: null
            }]
          }
        } else {
          error.value = '未识别到文字内容'
        }
      } else {
        // PaddleOCR 结果格式
        if (typeof results === 'object' && results.text) {
          ocrResults.value = [{
            text: results.text,
            confidence: 0.9,
            bbox: results.points
          }]
        } else if (Array.isArray(results) && results.length > 0) {
          ocrResults.value = results.map((result: any) => ({
            text: result.text || result.words || result.label || '',
            confidence: result.confidence || result.score || 0.9,
            bbox: result.bbox || result.location || result.points
          }))
        } else {
          console.log('结果格式未知:', results)
          error.value = '未识别到文字内容'
        }
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

.model-loading {
  text-align: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #e3f2fd;
  border-radius: 6px;
  color: #1976d2;
}

.engine-info {
  text-align: center;
  margin-bottom: 1rem;
  padding: 0.5rem;
  font-size: 0.9rem;
  color: #666;
  background: #f5f5f5;
  border-radius: 4px;
}

.engine-controls {
  text-align: center;
  margin-bottom: 1rem;
}

.engine-selector {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.engine-btn {
  padding: 8px 16px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  color: #666;
}

.engine-btn:hover:not(:disabled) {
  border-color: #42b883;
  color: #42b883;
}

.engine-btn.active {
  background: #42b883;
  border-color: #42b883;
  color: white;
}

.engine-btn:disabled {
  background: #f5f5f5;
  border-color: #ddd;
  color: #ccc;
  cursor: not-allowed;
}

.engine-description {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
  line-height: 1.4;
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
  white-space: pre-line;
  line-height: 1.6;
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