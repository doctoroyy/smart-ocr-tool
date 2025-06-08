# 智能 OCR 识别工具

一款现代化的前端 OCR 文字识别应用，支持桌面和移动端的高精度文字识别。

[English](./README.md) | 中文文档

## 🚀 一键部署

选择你喜欢的平台一键部署：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdoctoroyy%2Fsmart-ocr-tool&project-name=smart-ocr-tool&repository-name=smart-ocr-tool)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/doctoroyy/smart-ocr-tool)

[![Deploy with Railway](https://railway.app/button.svg)](https://railway.app/template/XmBj1Y?referralCode=doctoroyy)

[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/doctoroyy/smart-ocr-tool)

[![Deploy to Surge](https://camo.githubusercontent.com/83b0e95b38892b49184e07ad572c94c8038323fb/68747470733a2f2f73757267652e73682f696d616765732f6c6f676f2d64617267652e737667)](https://surge.sh)

### 部署说明

- **Vercel**: 推荐选择，零配置自动部署
- **Netlify**: 支持自动构建和部署
- **Railway**: 支持多种框架的托管平台
- **Cloudflare Pages**: 全球 CDN 加速
- **Surge**: 简单的静态网站部署

## ✨ 功能特性

- 📷 **图片上传**: 支持点击上传或拖拽图片
- 🔍 **双引擎智能选择**: 根据设备自动选择最佳 OCR 引擎
  - ⚡ **PaddleOCR**: 桌面高性能模式（需要 WebGL 支持）
  - 🔧 **Tesseract.js**: 移动端兼容模式（增强精度设置）
- 📋 **一键复制**: 快速复制识别结果到剪贴板
- 📱 **全平台兼容**: 支持桌面和移动设备
- ⚡ **现代技术栈**: Vue 3 + TypeScript + Vite
- 🚀 **零服务器**: 纯前端应用，无需后端服务器
- 🌐 **多格式支持**: JPG、PNG、GIF 等主流图片格式
- 🌏 **多语言识别**: 支持中英文混合识别

## 📸 项目演示

![OCR演示](https://via.placeholder.com/800x400/42b883/ffffff?text=OCR+Demo)

> 上传图片即可获得高精度的文字识别结果

## 🛠️ 技术栈

- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **OCR 引擎**: 
  - PaddleOCR (@paddle-js-models/ocr) - 高性能 WebGL 模式
  - Tesseract.js - 移动端兼容模式
- **样式**: CSS3 + 响应式设计

## 🚀 本地开发

```bash
# 克隆项目
git clone https://github.com/doctoroyy/smart-ocr-tool.git
cd smart-ocr-tool

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

## 📝 使用指南

### 快速开始
1. 🏠 访问应用主页
2. 🔍 点击"开始使用 OCR"进入识别页面
3. 📷 上传图片或拖拽图片到上传区域
4. ⚡ 点击"开始识别"按钮
5. 📋 查看识别结果，可一键复制全部文字

### 支持的图片格式
- 📸 JPG/JPEG
- 🖼️ PNG  
- 🎞️ GIF

## ⚠️ 注意事项

- 🕐 首次使用时需要加载 OCR 模型，请耐心等待
- 🔍 建议使用清晰、高分辨率的图片以获得更好的识别效果
- 📝 识别准确性取决于图片质量和文字清晰度
- 🌐 需要稳定的网络连接来下载 OCR 模型
- 📱 移动设备会自动使用 Tesseract.js 以获得更好的兼容性
- ⚡ 支持 WebGL 的桌面设备将使用 PaddleOCR 获得更高性能

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 📄 开源协议

MIT License - 详见 [LICENSE](LICENSE) 文件

---

<div align="center">

Made with ❤️ by [doctoroyy](https://github.com/doctoroyy)

</div>