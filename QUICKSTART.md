# 🚀 快速开始指南

欢迎使用 AI-PPT Architect！这个 5 分钟快速开始指南将帮助您立即上手。

## ✅ 前置检查

请确保您的系统已安装：

- ✅ **Python 3.8+** - 运行 `python --version` 检查
- ✅ **Node.js 16+** - 运行 `node --version` 检查 （注意：推荐 18+ 以获得最佳体验）
- ✅ **npm 或 yarn** - 运行 `npm --version` 检查

## 📝 第一步：获取 API Key

您需要至少一个 AI 模型的 API Key。推荐选项：

### 选项 1：OpenAI GPT-4o（推荐）

1. 访问 https://platform.openai.com/
2. 注册/登录账号
3. 进入 [API Keys](https://platform.openai.com/api-keys) 页面
4. 点击 "Create new secret key"
5. 复制生成的密钥（格式：`sk-...`）

💰 **费用说明：** GPT-4o 按使用量计费，每次大纲生成约 $0.01-0.05

### 选项 2：DeepSeek（经济实惠）

1. 访问 https://platform.deepseek.com/
2. 注册账号
3. 获取 API Key

💰 **费用说明：** 价格比 GPT-4o 便宜约 10 倍

### 选项 3：其他模型

- **Claude 3.5**: https://console.anthropic.com/
- **Gemini**: https://makersuite.google.com/app/apikey

## ⚡ 第二步：一键启动

### macOS / Linux

```bash
# 1. 进入项目目录
cd ai-ppt

# 2. 运行启动脚本
./start.sh
```

首次运行时，脚本会：
- 自动创建 Python 虚拟环境
- 安装所有依赖包
- 创建 .env 配置文件

### Windows

双击运行 `start.bat` 文件，或在命令提示符中：

```bash
cd ai-ppt
start.bat
```

## 🔑 第三步：配置 API Key

启动后，脚本会提示您配置 API Key：

1. 编辑 `backend/.env` 文件
2. 将您的 API Key 粘贴进去：

```env
# 至少配置一个
OPENAI_API_KEY=sk-your-actual-key-here

# 其他模型（可选）
ANTHROPIC_API_KEY=
DEEPSEEK_API_KEY=
GEMINI_API_KEY=
```

3. 保存文件
4. 重新运行启动脚本

## 🎉 第四步：开始使用

### 1. 打开浏览器

访问：http://localhost:3000

### 2. 输入需求

在左侧文本框输入，例如：

```
为公司年度总结会议准备 PPT

内容包括：
- 2024 年业务回顾
- 主要成就和亮点
- 财务数据总结
- 团队发展情况
- 2025 年规划和目标
```

### 3. 选择模型和主题

- **模型**：选择您配置了 API Key 的模型
- **主题**：
  - 商务风格 - 适合正式场合
  - 科技风格 - 适合技术分享
  - 创意风格 - 适合营销方案

### 4. 生成大纲

点击 "生成大纲" 按钮，等待 10-30 秒

### 5. 编辑预览

在右侧预览区可以：
- 修改 PPT 总标题
- 编辑每页幻灯片标题
- 调整内容顺序

### 6. 生成并下载

点击 "确认生成 PPT"，等待生成完成后自动下载

## 📊 示例需求模板

复制以下模板快速体验：

### 模板 1：技术培训

```
Docker 容器技术培训

目标受众：开发团队
内容：
1. Docker 简介和优势
2. 基础概念：镜像、容器、仓库
3. 常用命令演示
4. Dockerfile 编写
5. 实战案例
```

### 模板 2：产品发布

```
智能手表新品发布

产品特点：
- 7 天超长续航
- 健康监测功能
- 独立通话
- 运动模式丰富

需要包含：产品介绍、技术参数、使用场景、价格策略
```

### 模板 3：商业计划

```
咖啡店创业计划书

包含：
- 市场分析
- 选址策略
- 产品定位
- 营销计划
- 财务预测
- 风险评估
```

## 🔧 常见问题速查

### Q: 提示 "未配置 API Key"？

**解决：** 编辑 `backend/.env` 文件，添加至少一个 API Key

### Q: 前端打不开？

**解决：** 
1. 检查终端输出，确认前端已启动
2. 等待几秒钟，让 Next.js 完成编译
3. 尝试刷新浏览器

### Q: 生成大纲失败？

**解决：**
1. 检查网络连接
2. 确认 API Key 正确且有余额
3. 尝试切换其他模型

### Q: 下载的 PPT 打不开？

**解决：**
1. 使用 Microsoft PowerPoint 或 WPS 打开
2. 检查文件是否完整下载（通常 50KB-500KB）
3. 查看后端终端是否有错误信息

## 📚 下一步

- 📖 阅读 [完整使用指南](GUIDE.md) 了解高级功能
- 🏗️ 查看 [架构文档](ARCHITECTURE.md) 了解技术细节
- 💡 尝试不同的需求和模型组合
- 🎨 探索三种主题风格的效果

## 🆘 需要帮助？

- **文档**: 查看 README.md 和 GUIDE.md
- **API 文档**: http://localhost:8000/docs
- **问题反馈**: 提交 Issue

---

**祝您使用愉快！如有问题，随时查阅文档。** 🎊
