# Vue PaddleOCR App

基于 Vue 3 和 PaddleOCR 的前端文字识别应用。

## 🚀 一键部署

选择你喜欢的平台一键部署：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdoctoroyy%2Fvue-paddleocr-app&project-name=vue-paddleocr-app&repository-name=vue-paddleocr-app)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/doctoroyy/vue-paddleocr-app)

[![Deploy with Railway](https://railway.app/button.svg)](https://railway.app/template/XmBj1Y?referralCode=doctoroyy)

[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/doctoroyy/vue-paddleocr-app)

[![Deploy to Surge](https://camo.githubusercontent.com/83b0e95b38892b49184e07ad572c94c8038323fb/68747470733a2f2f73757267652e73682f696d616765732f6c6f676f2d64617267652e737667)](https://surge.sh)

### 部署说明

- **Vercel**: 推荐选择，零配置自动部署
- **Netlify**: 支持自动构建和部署
- **Railway**: 支持多种框架的托管平台
- **Cloudflare Pages**: 全球 CDN 加速
- **Surge**: 简单的静态网站部署

## ✨ 功能特性

- 📷 **图片上传**: 支持点击上传或拖拽图片
- 🔍 **文字识别**: 基于 PaddleOCR 的高精度文字识别
- 📋 **一键复制**: 快速复制识别结果到剪贴板
- 📱 **响应式设计**: 完美适配桌面和移动设备
- ⚡ **现代技术栈**: Vue 3 + TypeScript + Vite
- 🚀 **零服务器**: 纯前端应用，无需后端服务器
- 🌐 **多格式支持**: JPG、PNG、GIF 等主流图片格式

## 📸 项目演示

![OCR演示](https://via.placeholder.com/800x400/42b883/ffffff?text=OCR+Demo)

> 上传图片即可获得高精度的文字识别结果

## 🛠️ 技术栈

- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **OCR引擎**: PaddleOCR (@paddlejs-models/ocr)
- **路由管理**: Vue Router
- **状态管理**: Pinia
- **样式**: CSS3 + 响应式设计

## 🚀 本地开发

```bash
# 克隆项目
git clone https://github.com/doctoroyy/vue-paddleocr-app.git
cd vue-paddleocr-app

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

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 📄 License

MIT License - 详见 [LICENSE](LICENSE) 文件

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！⭐**

Made with ❤️ by [doctoroyy](https://github.com/doctoroyy)

</div>