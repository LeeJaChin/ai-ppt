# AI-PPT Architect

> AI 驱动的 PPT 自动生成工具 - 让创作更高效

## 📖 项目简介

AI-PPT Architect 是一个强大的 Web 应用，允许用户输入核心需求或长文本，由 AI 自动提取大纲、生成内容，并最终导出为格式精美的可编辑 `.pptx` 文件。

## ✨ 核心特性

- 🤖 **多模型支持**：集成 OpenAI GPT-4o、Claude 3.5 Sonnet、DeepSeek、Gemini 等主流大模型
- 📝 **智能大纲提取**：AI 自动分析需求，生成结构化 PPT 大纲
- 🎨 **多主题风格**：支持商务、科技、创意三种内置主题
- ✏️ **实时编辑预览**：生成前可对大纲进行二次编辑
- 📥 **一键导出下载**：自动生成高质量 PPTX 文件
- ⚡ **异步处理**：后台任务队列，支持长文本处理

## 🛠️ 技术栈

### 前端
- **框架**: Next.js 14 (React 18)
- **样式**: Tailwind CSS
- **组件库**: Shadcn UI
- **状态管理**: React Hooks
- **HTTP 客户端**: Axios

### 后端
- **框架**: FastAPI
- **PPT 生成**: python-pptx
- **AI 集成**: OpenAI SDK、Anthropic SDK、Google Generative AI
- **配置管理**: pydantic-settings
- **异步处理**: asyncio

## 🚀 快速开始

### 环境要求

- **Python** 3.8+ (推荐 3.10+)
- **Node.js** 18+ (推荐 20+)
- pip 或 conda
- npm 或 yarn

**注意**：如果您使用 pyenv 或 nvm，启动脚本会自动切换到合适的版本。

### 1. 克隆项目

```bash
git clone <repository-url>
cd ai-ppt
```

### 2. 环境检查（可选）

运行环境检查脚本，确认您的环境配置：

```bash
# Linux/macOS
./check-env.sh
```

这会检查：
- Python 和 Node.js 版本
- pyenv 和 nvm 配置
- API Keys 配置状态
- 依赖安装情况

### 2. 配置 API Keys

编辑 `backend/.env` 文件，至少配置一个 AI 模型的 API Key：

```env
# 至少配置一个
OPENAI_API_KEY=sk-...
# 或
ANTHROPIC_API_KEY=sk-ant-...
# 或
DEEPSEEK_API_KEY=sk-...
# 或
GEMINI_API_KEY=...
```

**重要**：至少配置一个 AI 模型的 API Key，否则无法生成大纲。

### 3. 一键启动（推荐）

使用启动脚本，自动处理所有配置：

#### Linux/macOS

```bash
./start.sh
```

启动脚本会自动：
- ✅ 检测并切换到合适的 Python 版本（pyenv）
- ✅ 检测并切换到合适的 Node.js 版本（nvm）
- ✅ 创建 Python 虚拟环境
- ✅ 使用清华镜像安装后端依赖
- ✅ 使用淘宝镜像安装前端依赖
- ✅ 启动后端服务（端口 8000）
- ✅ 启动前端服务（端口 3000）

#### Windows

双击运行 `start.bat`

### 4. 手动启动（可选）

如果您需要手动控制每个步骤：

#### 后端

```bash
cd backend

# 如果使用 pyenv，先切换版本
pyenv local 3.10.15  # 可选

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 使用清华镜像安装依赖
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入您的 API Keys

# 启动服务
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 前端

打开新终端：

```bash
cd frontend

# 如果使用 nvm，先切换版本
nvm use 20  # 可选

# 使用淘宝镜像安装依赖
npm install --registry=https://registry.npmmirror.com

# 启动开发服务器
npm run dev
```

### 5. 访问应用

在浏览器中打开 [http://localhost:3000](http://localhost:3000)

## 📚 使用指南

### 基本流程

1. **输入需求**：在左侧文本框输入您的 PPT 主题或需求描述
   
   示例：
   ```
   关于人工智能在医疗行业应用的公司汇报，包括：
   - AI 技术在医疗诊断中的应用
   - 典型案例分析
   - 市场前景和挑战
   - 公司的解决方案
   ```

2. **选择模型**：从下拉菜单选择 AI 模型（如 GPT-4o）

3. **选择主题**：选择 PPT 主题风格
   - 商务风格：专业、简洁
   - 科技风格：现代、创新
   - 创意风格：活力、多彩

4. **生成大纲**：点击"生成大纲"按钮，AI 将自动生成 PPT 结构

5. **编辑大纲**：在右侧预览区可以编辑标题和内容

6. **生成 PPT**：点击"确认生成 PPT"，等待生成完成

7. **下载文件**：生成完成后自动下载 PPTX 文件

## 🏗️ 项目结构

```
ai-ppt/
├── backend/                 # 后端 FastAPI 项目
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py         # FastAPI 主应用
│   │   ├── config.py       # 配置管理
│   │   ├── models.py       # 数据模型
│   │   └── services/       # 业务逻辑层
│   │       ├── ai_adapter.py       # AI 适配器基类
│   │       ├── openai_adapter.py   # OpenAI 适配器
│   │       ├── claude_adapter.py   # Claude 适配器
│   │       ├── deepseek_adapter.py # DeepSeek 适配器
│   │       ├── gemini_adapter.py   # Gemini 适配器
│   │       ├── ai_factory.py       # 模型工厂
│   │       └── ppt_generator.py    # PPT 生成引擎
│   ├── requirements.txt    # Python 依赖
│   ├── .env.example       # 环境变量模板
│   └── .gitignore
│
├── frontend/               # 前端 Next.js 项目
│   ├── app/
│   │   ├── page.tsx       # 主页面
│   │   ├── layout.tsx     # 布局组件
│   │   └── globals.css    # 全局样式
│   ├── components/
│   │   └── ui/            # UI 组件库
│   ├── lib/
│   │   ├── api.ts         # API 客户端
│   │   └── utils.ts       # 工具函数
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── next.config.js
│
└── README.md
```

## 🔧 核心技术实现

### 1. 适配器模式（Adapter Pattern）

使用适配器模式统一不同 AI 模型的调用接口：

```python
# 基类定义统一接口
class BaseAIAdapter(ABC):
    @abstractmethod
    async def generate_outline(self, prompt: str) -> Dict[str, Any]:
        pass

# 各模型实现具体适配器
class OpenAIAdapter(BaseAIAdapter):
    async def generate_outline(self, prompt: str):
        # OpenAI 特定实现
        ...

# 工厂类创建适配器实例
adapter = AIAdapterFactory.create_adapter(model_type)
```

### 2. Prompt Engineering

精心设计的提示词确保 AI 返回结构化数据：

```python
system_prompt = """你是一个专业的 PPT 大纲生成助手。
请严格按照以下 JSON 格式返回：
{
  "title": "PPT 总标题",
  "slides": [
    {
      "title": "幻灯片标题",
      "bullet_points": ["要点1", "要点2"],
      "notes": "备注"
    }
  ]
}
"""
```

### 3. 异步任务处理

使用 asyncio 实现后台任务处理：

```python
# 创建后台任务
asyncio.create_task(process_ppt_generation(task_id, request))

# 前端轮询任务状态
const interval = setInterval(async () => {
  const status = await getTaskStatus(taskId);
  if (status.status === 'completed') {
    // 下载文件
  }
}, 1000);
```

## 🎨 主题配置

系统内置三种主题，可在 `ppt_generator.py` 中自定义颜色：

```python
THEMES = {
    ThemeStyle.BUSINESS: {
        "bg_color": RGBColor(255, 255, 255),
        "title_color": RGBColor(31, 78, 121),
        "text_color": RGBColor(68, 68, 68),
        "accent_color": RGBColor(68, 114, 196),
    },
    # ...
}
```

## 🔐 安全说明

- 所有 API Keys 存储在 `.env` 文件中，不提交到版本控制
- 使用 CORS 限制前端访问来源
- 生成的 PPT 文件存储在服务器本地，定期清理

## 📝 API 文档

启动后端后，访问自动生成的 API 文档：

- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### 主要端点

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/` | 健康检查 |
| GET | `/api/models` | 获取可用模型列表 |
| POST | `/api/generate-outline` | 生成 PPT 大纲 |
| POST | `/api/generate-ppt` | 生成 PPT 文件 |
| GET | `/api/task/{task_id}` | 查询任务状态 |
| GET | `/api/download/{task_id}` | 下载 PPT 文件 |

## 🚧 未来规划

- [ ] 支持更多 AI 模型
- [ ] 增加更多主题模板
- [ ] 支持自定义模板上传
- [ ] 添加图片、图表自动生成
- [ ] 支持批量生成
- [ ] 用户系统和历史记录
- [ ] Docker 容器化部署

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📄 开源协议

MIT License

## 👨‍💻 作者

Built with ❤️ by AI-PPT Architect Team

---

**提示**：首次使用前，请确保至少配置一个 AI 模型的 API Key！
