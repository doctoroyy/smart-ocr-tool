# 智能 OCR 识别工具

一款现代化的前端 OCR 文字识别应用，支持桌面和移动端的高精度文字识别。

[中文文档](./README_zh.md) | English

## 🚀 One-Click Deploy

Deploy this application to your favorite platform:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdoctoroyy%2Fsmart-ocr-tool&project-name=smart-ocr-tool&repository-name=smart-ocr-tool)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/doctoroyy/smart-ocr-tool)

[![Deploy with Railway](https://railway.app/button.svg)](https://railway.app/template/XmBj1Y?referralCode=doctoroyy)

[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/doctoroyy/smart-ocr-tool)

[![Deploy to Surge](https://camo.githubusercontent.com/83b0e95b38892b49184e07ad572c94c8038323fb/68747470733a2f2f73757267652e73682f696d616765732f6c6f676f2d64617267652e737667)](https://surge.sh)

### Deployment Options

- **Vercel**: Recommended, zero-configuration deployment
- **Netlify**: Automatic build and deployment
- **Railway**: Multi-framework hosting platform
- **Cloudflare Pages**: Global CDN acceleration
- **Surge**: Simple static website deployment

## ✨ Features

- 📷 **Image Upload**: Support click upload or drag & drop
- 🔍 **Dual OCR Engines**: Automatically choose the best engine for your device
  - ⚡ **PaddleOCR**: High-performance mode for desktop (WebGL required)
  - 🔧 **Tesseract.js**: Mobile-friendly mode with enhanced accuracy settings
- 📋 **One-Click Copy**: Quickly copy recognition results to clipboard
- 📱 **Universal Compatibility**: Works on desktop and mobile devices
- ⚡ **Modern Tech Stack**: Vue 3 + TypeScript + Vite
- 🚀 **Serverless**: Pure frontend application, no backend server required
- 🌐 **Multi-Format Support**: JPG, PNG, GIF and other mainstream image formats
- 🌏 **Multi-Language**: Supports Chinese and English text recognition

## 📸 Demo

![OCR Demo](https://via.placeholder.com/800x400/42b883/ffffff?text=OCR+Demo)

> Upload an image and get high-precision text recognition results

## 🛠️ Tech Stack

- **Frontend Framework**: Vue 3 + TypeScript
- **Build Tool**: Vite
- **OCR Engines**: 
  - PaddleOCR (@paddle-js-models/ocr) - High-performance WebGL mode
  - Tesseract.js - Mobile-compatible fallback mode
- **Styling**: CSS3 + Responsive Design

## 🚀 Local Development

```bash
# Clone the project
git clone https://github.com/doctoroyy/smart-ocr-tool.git
cd smart-ocr-tool

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview build
pnpm preview
```

## 📝 Usage Guide

### Quick Start
1. 🏠 Visit the application homepage
2. 🔍 Click "Start OCR" to enter the recognition page
3. 📷 Upload an image or drag & drop to the upload area
4. ⚡ Click "Start Recognition" button
5. 📋 View recognition results and copy all text with one click

### Supported Image Formats
- 📸 JPG/JPEG
- 🖼️ PNG  
- 🎞️ GIF

## ⚠️ Notes

- 🕐 First-time use requires loading the OCR model, please be patient
- 🔍 Recommend using clear, high-resolution images for better recognition results
- 📝 Recognition accuracy depends on image quality and text clarity
- 🌐 Stable internet connection required to download OCR models
- 📱 Mobile devices automatically use Tesseract.js for better compatibility
- ⚡ Desktop devices with WebGL support will use PaddleOCR for higher performance

## 🤝 Contributing

Issues and Pull Requests are welcome to improve this project!

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

<div align="center">

Made with ❤️ by [doctoroyy](https://github.com/doctoroyy)

</div>