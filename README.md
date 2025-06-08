# Vue PaddleOCR App

基于 Vue 3 和 PaddleOCR 的前端文字识别应用。

## 功能特性

- 📷 支持图片上传和拖拽
- 🔍 使用 PaddleOCR 进行文字识别
- 📋 一键复制识别结果
- 📱 响应式设计，支持移动设备
- ⚡ 基于 Vue 3 + TypeScript + Vite

## 技术栈

- Vue 3
- TypeScript
- Vite
- PaddleOCR (@paddlejs-models/ocr)
- Vue Router
- Pinia

## 安装和运行

1. 安装依赖：
```bash
pnpm install
```

2. 启动开发服务器：
```bash
pnpm dev
```

3. 构建生产版本：
```bash
pnpm build
```

## 使用说明

1. 访问应用主页
2. 点击"开始使用 OCR"进入识别页面
3. 上传图片或拖拽图片到上传区域
4. 点击"开始识别"按钮
5. 查看识别结果，可一键复制全部文字

## 支持的图片格式

- JPG/JPEG
- PNG
- GIF

## 注意事项

- 首次使用时需要加载 OCR 模型，可能需要一些时间
- 建议使用清晰的图片以获得更好的识别效果
- 识别结果的准确性取决于图片质量和文字清晰度

## License

MIT