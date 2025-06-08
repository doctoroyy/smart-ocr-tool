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
            @click="switchEngine('tesseract')" 
            :class="{ active: selectedEngine === 'tesseract', disabled: !tesseractModel }"
            :disabled="!tesseractModel"
            class="engine-btn"
          >
            🔧 Tesseract.js
          </button>
          <button 
            @click="switchEngine('paddle')" 
            :class="{ active: selectedEngine === 'paddle' }"
            class="engine-btn"
          >
            ⚡ PaddleOCR
          </button>
        </div>
        <p class="engine-description">{{ getEngineDescription() }}</p>
      </div>
      
      <!-- 进度条显示 -->
      <div v-if="loading" class="progress-section">
        <div class="progress-header">
          <h4>{{ progressStatus }}</h4>
          <span class="progress-percent">{{ progress.toFixed(2) }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
      </div>

      <button
        @click="performOCR"
        :disabled="!selectedImage || loading || modelLoading || (!paddleOCRModel && !tesseractModel)"
        class="ocr-btn"
        :class="{ loading, disabled: modelLoading }"
      >
        <span v-if="loading">{{ progressStatus || '识别中...' }}</span>
        <span v-else-if="modelLoading">模型加载中...</span>
        <span v-else>开始识别</span>
      </button>
    </div>

    <div v-if="ocrResults.length > 0" class="results-section">
      <!-- 识别结果 -->
      <div class="clean-text-preview">
        <h4>识别结果:</h4>
        <div class="clean-text-content">
          <pre>{{ getCleanText() }}</pre>
        </div>
      </div>

      <div class="results-actions">
        <button @click="copyCleanText" class="action-btn primary">
          📋 复制文本
        </button>
        <button @click="downloadText" class="action-btn secondary">
          💾 下载文本文件
        </button>
      </div>
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
const progress = ref(0)
const progressStatus = ref('')
const ocrModel = ref<any>(null)

// 简单的换行间距配置
const spaceAfterLines = ref(['合计', '说明', '收款人', '复核人'])
const useNativeOCR = ref(false)
const paddleOCRModel = ref<any>(null)
const tesseractModel = ref<any>(null)
const manualEngineSelection = ref(false)
const selectedEngine = ref<string>('tesseract')

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
const switchEngine = async (engine: string) => {
  if (engine === 'paddle') {
    if (!paddleOCRModel.value) {
      // 需要先加载 PaddleOCR
      if (!checkWebGLSupport()) {
        error.value = '您的设备不支持 WebGL，无法使用 PaddleOCR。请使用 Tesseract.js。'
        return
      }
      
      try {
        modelLoading.value = true
        error.value = ''
        await loadPaddleOCR()
      } catch (err) {
        error.value = 'PaddleOCR 加载失败，请继续使用 Tesseract.js'
        return
      } finally {
        modelLoading.value = false
      }
    }
    
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

// 按需加载 PaddleOCR
const loadPaddleOCR = async () => {
  if (paddleOCRModel.value) return // 已经加载过了
  
  try {
    console.log('按需加载 PaddleOCR...')
    const ocr = await import('@paddle-js-models/ocr')
    await ocr.init()
    paddleOCRModel.value = ocr
    console.log('PaddleOCR 加载成功')
  } catch (err) {
    console.warn('PaddleOCR 加载失败:', err)
    throw err
  }
}

// 初始化 OCR 模型 - 默认只加载 Tesseract.js
onMounted(async () => {
  try {
    console.log('开始加载默认 OCR 引擎...')
    
    // 只加载 Tesseract.js
    try {
      console.log('加载 Tesseract.js...')
      const tesseract = await initTesseractOCR()
      if (tesseract) {
        tesseractModel.value = tesseract
        selectedEngine.value = 'tesseract'
        ocrModel.value = tesseractModel.value
        useNativeOCR.value = true
        console.log('Tesseract.js 加载成功，设为默认引擎')
      }
    } catch (tesseractError) {
      console.warn('Tesseract.js 加载失败:', tesseractError)
      throw new Error('默认 OCR 引擎加载失败')
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

// 更新进度
const updateProgress = (percent: number, status: string) => {
  progress.value = Math.max(0, Math.min(100, Math.round(percent * 100) / 100))
  progressStatus.value = status
}

// Tesseract.js 引擎处理函数
const performTesseractOCR = async (img: HTMLImageElement) => {
  console.log('使用 Tesseract.js 进行识别...')
  updateProgress(5, '准备图像处理')
  
  // 智能图像预处理
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  // 放大图像提高识别精度
  const scale = 2
  canvas.width = img.width * scale
  canvas.height = img.height * scale
  
  updateProgress(15, '图像预处理中')
  
  // 使用高质量缩放
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  
  // 轻度图像增强
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const pixelData = imageData.data
  
  updateProgress(25, '图像增强处理')
  
  // 轻度对比度增强，保持细节
  for (let i = 0; i < pixelData.length; i += 4) {
    const r = pixelData[i]
    const g = pixelData[i + 1]
    const b = pixelData[i + 2]
    
    // 轻度对比度增强
    const factor = 1.2
    pixelData[i] = Math.min(255, r * factor)
    pixelData[i + 1] = Math.min(255, g * factor)
    pixelData[i + 2] = Math.min(255, b * factor)
  }
  
  ctx.putImageData(imageData, 0, 0)
  
  updateProgress(35, '初始化识别引擎')
  
  const worker = await ocrModel.value.createWorker('chi_sim+eng', 1, {
    logger: (m) => {
      console.log('Tesseract:', m)
      // 根据 Tesseract 的日志更新进度
      if (m.status === 'recognizing text' && typeof m.progress === 'number') {
        const currentProgress = 50 + m.progress * 40 // 50% 到 90% 的范围
        updateProgress(currentProgress, '文字识别中')
      }
    }
  })
  
  updateProgress(45, '配置识别参数')
  
  // 针对中文票据优化的 OCR 参数
  await worker.setParameters({
    tessedit_pageseg_mode: ocrModel.value.PSM.AUTO,
    tessedit_ocr_engine_mode: ocrModel.value.OEM.LSTM_ONLY,
    preserve_interword_spaces: '1',
    user_defined_dpi: '300',
    // 提高识别质量的关键参数
    tessedit_reject_mode: '0', // 减少拒绝，接受更多候选结果
    classify_enable_learning: '1',
    classify_enable_adaptive_matcher: '1',
    // 文本行检测优化
    textord_debug_tabfind: '0',
    textord_tabfind_force_vertical_text: '0',
    textord_tabfind_vertical_text_ratio: '0.5',
    // 字符识别优化
    tessedit_char_blacklist: '', // 不排除任何字符
    tessedit_char_whitelist: '', // 允许所有字符
    // 置信度阈值调整
    tessedit_reject_row_percent: '40', // 放宽行拒绝阈值
    tessedit_reject_block_percent: '45', // 放宽块拒绝阈值
  })
  
  updateProgress(50, '开始文字识别')
  
  const { data: ocrData } = await worker.recognize(canvas)
  
  updateProgress(95, '处理识别结果')
  
  const result = {
    text: ocrData.text.trim(),
    confidence: ocrData.confidence / 100,
    words: ocrData.words
  }
  
  console.log(`OCR 识别完成，置信度: ${(result.confidence * 100).toFixed(2)}%`)
  
  await worker.terminate()
  
  if (result.text && result.text.length > 0) {
    updateProgress(100, '识别完成')
    return result
  } else {
    throw new Error('OCR 识别失败，未检测到文字内容')
  }
}

// PaddleOCR 引擎处理函数
const performPaddleOCR = async (img: HTMLImageElement) => {
  console.log('使用 PaddleOCR 进行识别...')
  updateProgress(20, '初始化 PaddleOCR', '开始使用 PaddleOCR 引擎')
  updateProgress(40, '准备图像数据', '传递图像到 PaddleOCR 模型')
  updateProgress(60, '深度学习识别中', 'PaddleOCR 神经网络分析图像')
  
  const result = await ocrModel.value.recognize(img)
  
  updateProgress(90, '处理识别结果', '整理 PaddleOCR 输出结果')
  updateProgress(100, '识别完成', 'PaddleOCR 识别成功完成')
  
  return result
}

// 处理 Tesseract.js 识别结果
const processTesseractResults = (results: any) => {
  if (results.text && results.text.length > 0) {
    // 将文本按行分割，每行作为一个结果项
    const lines = results.text.split('\n').filter(line => line.trim().length > 0)
    
    if (lines.length > 0) {
      return lines.map((line: string) => ({
        text: line.trim(),
        confidence: results.confidence || 0.8,
        bbox: null
      }))
    } else {
      return [{
        text: results.text,
        confidence: results.confidence || 0.8,
        bbox: null
      }]
    }
  }
  return []
}

// 处理 PaddleOCR 识别结果
const processPaddleResults = (results: any) => {
  if (typeof results === 'object' && results.text) {
    return [{
      text: results.text,
      confidence: 0.9,
      bbox: results.points
    }]
  } else if (Array.isArray(results) && results.length > 0) {
    return results.map((result: any) => ({
      text: result.text || result.words || result.label || '',
      confidence: result.confidence || result.score || 0.9,
      bbox: result.bbox || result.location || result.points
    }))
  }
  return []
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
  progress.value = 0
  progressStatus.value = ''
  
  updateProgress(5, '准备开始识别')

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
    
    // 根据选择的引擎进行识别
    if (useNativeOCR.value) {
      results = await performTesseractOCR(img)
      ocrResults.value = processTesseractResults(results)
    } else {
      results = await performPaddleOCR(img)
      ocrResults.value = processPaddleResults(results)
    }
    
    console.log('OCR 识别原始结果:', results)
    
    // 检查是否有识别结果
    if (ocrResults.value.length === 0) {
      error.value = '未识别到文字内容'
    }
    
  } catch (err) {
    console.error('OCR 识别失败:', err)
    error.value = 'OCR 识别失败，请重试'
  } finally {
    loading.value = false
  }
}


// 智能文本清理
const basicTextClean = (text: string): string => {
  return text
    // 移除明显的乱码字符
    .replace(/[£€¥§¢©®™°±÷×µ¶]/g, '')
    .replace(/[\u2600-\u26FF\u2700-\u27BF]/g, '') // 移除符号
    .replace(/[^\u4e00-\u9fff\u3400-\u4dbf\w\s\d.,，。:：；;()（）\-+=/\\]/g, ' ') // 只保留中文、英文、数字和基本标点
    
    // 修正常见OCR错误
    .replace(/[oO](?=\d)/g, '0')
    .replace(/[lI](?=\d)/g, '1') 
    .replace(/(\d)[lI]/g, '$11')
    .replace(/(\d)[oO]/g, '$10')
    .replace(/[，,](?=\d)/g, '.')
    
    // 修正标点符号
    .replace(/\s*[:：]\s*/g, ': ')
    .replace(/\s*[,，]\s*/g, ', ')
    .replace(/\s*[;；]\s*/g, '; ')
    
    // 清理多余空格和换行
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim()
}

// 智能文本整理
const cleanAndFormatText = (textArray: string[]): string => {
  // 逐行清理并过滤无效行
  const cleanedLines = textArray
    .map(text => basicTextClean(text))
    .filter(line => {
      // 过滤掉太短或明显无意义的行
      if (line.length < 2) return false
      // 过滤掉只有符号的行
      if (/^[\s\W]*$/.test(line) && !/[\u4e00-\u9fff\d]/.test(line)) return false
      // 过滤掉明显的乱码行（连续的无意义字符）
      if (/[\w]{10,}/.test(line) && !/[\u4e00-\u9fff]/.test(line)) return false
      return true
    })
  
  // 智能分组和格式化
  const formattedLines: string[] = []
  
  for (let i = 0; i < cleanedLines.length; i++) {
    const line = cleanedLines[i]
    
    // 检查是否是重要分隔符
    const isImportantSection = /^(项目名|医疗机构|业务流水号|门诊号|就诊日期)/.test(line)
    const needSpaceBefore = spaceAfterLines.value.some(keyword => 
      i > 0 && cleanedLines[i - 1].includes(keyword)
    )
    
    if ((needSpaceBefore || isImportantSection) && formattedLines.length > 0) {
      formattedLines.push('')
    }
    
    formattedLines.push(line)
  }
  
  return formattedLines.join('\n')
}

// 获取整理后的文本（用于预览）
const getCleanText = () => {
  if (ocrResults.value.length === 0) return ''
  const textArray = ocrResults.value.map(result => result.text)
  return cleanAndFormatText(textArray)
}


// 复制整理后的文本
const copyCleanText = async () => {
  const cleanedText = getCleanText()
  
  try {
    await navigator.clipboard.writeText(cleanedText)
    console.log('整理后文字已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 下载文本文件
const downloadText = () => {
  const cleanedText = getCleanText()
  const blob = new Blob([cleanedText], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `OCR识别结果_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
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

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.results-header h3 {
  margin: 0;
  color: var(--color-heading);
}

.results-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.text-count, .avg-confidence {
  background: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.results-container {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 1.5rem;
}

.result-item {
  background: white;
  border-radius: 6px;
  padding: 0;
  margin-bottom: 0.75rem;
  border: 1px solid #e0e0e0;
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.result-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.result-index {
  font-weight: 600;
  color: #666;
  font-size: 0.9rem;
}

.result-confidence {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.confidence-high {
  background: #d4edda;
  color: #155724;
}

.confidence-medium {
  background: #fff3cd;
  color: #856404;
}

.confidence-low {
  background: #f8d7da;
  color: #721c24;
}

.copy-single-btn {
  background: transparent;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
}

.copy-single-btn:hover {
  background: #e9ecef;
}

.result-content {
  padding: 1rem;
}

.result-text {
  margin: 0;
  font-size: 16px;
  line-height: 1.5;
  cursor: pointer;
  transition: background 0.2s;
  padding: 0.25rem;
  border-radius: 4px;
}

.result-text:hover {
  background: #f8f9fa;
}

.results-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-btn.primary {
  background: #42b883;
  color: white;
}

.action-btn.primary:hover {
  background: #369870;
}

.action-btn.secondary {
  background: white;
  color: #666;
  border: 1px solid #ddd;
}

.action-btn.secondary:hover {
  background: #f8f9fa;
  border-color: #42b883;
  color: #42b883;
}

.clean-text-preview {
  background: white;
  border-radius: 6px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #e0e0e0;
}

.clean-text-preview h4 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1rem;
}

.clean-text-content {
  background: #f8f9fa;
  border-radius: 4px;
  padding: 1rem;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
}

.clean-text-content pre {
  margin: 0;
  font-family: 'Courier New', Monaco, monospace;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.progress-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.progress-header h4 {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
}

.progress-percent {
  font-weight: 600;
  color: #42b883;
  font-size: 1.1rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #42b883, #369870);
  border-radius: 4px;
  transition: width 0.3s ease;
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: progressShine 2s infinite;
}

@keyframes progressShine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-details {
  max-height: 120px;
  overflow-y: auto;
}

.progress-step {
  padding: 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.progress-step:last-child {
  border-bottom: none;
}

.step-icon {
  min-width: 20px;
  text-align: center;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.step-icon.completed {
  color: #28a745;
}

.step-icon.current {
  color: #42b883;
  animation: pulse 1.5s infinite;
}

.step-text {
  flex: 1;
  transition: color 0.3s ease;
}

.step-progress {
  font-size: 0.8rem;
  color: #42b883;
  font-weight: 600;
  min-width: 45px;
  text-align: right;
}

.progress-step .step-icon.completed + .step-text {
  color: #28a745;
}

.progress-step .step-icon.current + .step-text {
  color: #42b883;
  font-weight: 500;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
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