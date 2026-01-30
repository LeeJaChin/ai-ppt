# AI-PPT Architect 架构文档

## 项目概览

AI-PPT Architect 是一个前后端分离的 Web 应用，采用现代化的技术栈和清晰的架构设计。

## 技术架构图

```
┌─────────────────────────────────────────────────────────────┐
│                         用户浏览器                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/HTTPS
                            ├─────────────────┐
                            ▼                 ▼
                ┌─────────────────┐  ┌─────────────────┐
                │  Frontend (3000) │  │  Backend (8000)  │
                │   Next.js 14     │  │    FastAPI       │
                └─────────────────┘  └─────────────────┘
                            │                 │
                            │                 ├──────────┐
                            │                 ▼          ▼
                            │        ┌──────────────┐  ┌────────────┐
                            │        │  AI Adapters │  │ python-pptx│
                            │        └──────────────┘  └────────────┘
                            │                 │
                            │                 ├────┬────┬────┬────┐
                            │                 ▼    ▼    ▼    ▼    ▼
                            │             GPT-4o Claude DeepSeek Gemini
                            │
                            └─────────► API Requests
```

## 目录结构

```
ai-ppt/
├── backend/                          # Python FastAPI 后端
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   # FastAPI 应用入口
│   │   ├── config.py                 # 配置管理（环境变量）
│   │   ├── models.py                 # Pydantic 数据模型
│   │   └── services/                 # 业务逻辑层
│   │       ├── __init__.py
│   │       ├── ai_adapter.py         # AI 适配器抽象基类
│   │       ├── ai_factory.py         # AI 模型工厂
│   │       ├── openai_adapter.py     # OpenAI GPT-4o 适配器
│   │       ├── claude_adapter.py     # Anthropic Claude 适配器
│   │       ├── deepseek_adapter.py   # DeepSeek 适配器
│   │       ├── gemini_adapter.py     # Google Gemini 适配器
│   │       └── ppt_generator.py      # PPT 生成引擎
│   ├── output/                       # PPT 输出目录
│   ├── requirements.txt              # Python 依赖
│   ├── .env                          # 环境变量（需自行创建）
│   ├── .env.example                  # 环境变量模板
│   └── .gitignore
│
├── frontend/                         # Next.js 前端
│   ├── app/
│   │   ├── page.tsx                  # 主页面组件
│   │   ├── layout.tsx                # 根布局
│   │   └── globals.css               # 全局样式
│   ├── components/
│   │   └── ui/                       # UI 组件库
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── textarea.tsx
│   │       ├── select.tsx
│   │       └── progress.tsx
│   ├── lib/
│   │   ├── api.ts                    # API 客户端封装
│   │   └── utils.ts                  # 工具函数
│   ├── package.json                  # Node.js 依赖
│   ├── tailwind.config.ts            # Tailwind 配置
│   ├── tsconfig.json                 # TypeScript 配置
│   ├── next.config.js                # Next.js 配置
│   ├── postcss.config.js             # PostCSS 配置
│   └── .env.local                    # 前端环境变量
│
├── start.sh                          # Linux/macOS 启动脚本
├── start.bat                         # Windows 启动脚本
├── README.md                         # 项目说明
├── GUIDE.md                          # 使用指南
└── .gitignore                        # Git 忽略配置
```

## 后端架构

### 1. 分层架构

```
┌──────────────────────────────────────────────────────┐
│                   API Layer (FastAPI)                │
│  • 路由处理 • 请求验证 • 响应序列化 • 错误处理      │
└──────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────┐
│                  Business Layer                      │
│  • AI 模型调用 • 大纲生成 • PPT 生成 • 任务管理     │
└──────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────┐
│                  Adapter Layer                       │
│  • 统一接口 • 模型适配 • 错误转换                   │
└──────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────┐
│                  External APIs                       │
│  • OpenAI API • Anthropic API • DeepSeek • Gemini    │
└──────────────────────────────────────────────────────┘
```

### 2. 核心模块

#### 2.1 配置管理 (config.py)

```python
class Settings(BaseSettings):
    """使用 pydantic-settings 管理环境变量"""
    openai_api_key: str
    anthropic_api_key: str
    # ...
```

**职责：**
- 从 .env 文件读取配置
- 类型验证和转换
- 提供全局配置单例

#### 2.2 数据模型 (models.py)

```python
class OutlineResponse(BaseModel):
    """大纲响应模型"""
    title: str
    slides: List[SlideContent]
```

**职责：**
- 定义 API 请求/响应结构
- 数据验证
- 序列化/反序列化

#### 2.3 AI 适配器层 (services/)

**适配器模式实现：**

```python
# 抽象基类
class BaseAIAdapter(ABC):
    @abstractmethod
    async def generate_outline(self, prompt: str) -> Dict:
        pass

# 具体实现
class OpenAIAdapter(BaseAIAdapter):
    async def generate_outline(self, prompt: str) -> Dict:
        # OpenAI 特定实现
        ...

# 工厂类
class AIAdapterFactory:
    @classmethod
    def create_adapter(cls, model: AIModel) -> BaseAIAdapter:
        # 根据模型类型创建适配器
        ...
```

**优点：**
- 统一接口，易于扩展新模型
- 隔离第三方 API 变化
- 便于测试和维护

#### 2.4 PPT 生成引擎 (ppt_generator.py)

```python
class PPTGenerator:
    """基于 python-pptx 生成 PPT"""
    
    def add_title_slide(self, title: str):
        """添加封面页"""
        
    def add_content_slide(self, slide_data: SlideContent):
        """添加内容页"""
        
    def generate(self, title, slides, output_path):
        """生成完整 PPT"""
```

**功能：**
- 三种主题风格配置
- 自动排版和样式设置
- 支持标题页、内容页、致谢页

#### 2.5 主应用 (main.py)

**核心端点：**

| 端点 | 方法 | 功能 |
|------|------|------|
| `/` | GET | 健康检查 |
| `/api/models` | GET | 获取可用模型 |
| `/api/generate-outline` | POST | 生成大纲 |
| `/api/generate-ppt` | POST | 生成 PPT（异步） |
| `/api/task/{task_id}` | GET | 查询任务状态 |
| `/api/download/{task_id}` | GET | 下载 PPT |

**异步处理机制：**

```python
# 创建后台任务
asyncio.create_task(process_ppt_generation(task_id, request))

# 任务状态存储
tasks_storage: Dict[str, Dict] = {}
```

## 前端架构

### 1. 组件结构

```
App (page.tsx)
├── Header
├── ErrorAlert
├── LeftPanel
│   ├── InputCard
│   │   ├── Textarea (需求输入)
│   │   ├── ModelSelect (模型选择)
│   │   ├── ThemeSelect (主题选择)
│   │   └── GenerateButton
│   └── ThemePreview
└── RightPanel
    ├── OutlineCard (大纲预览与编辑)
    │   ├── TitleInput
    │   └── SlideList
    │       └── SlideItem (可编辑)
    └── ProgressCard (生成进度)
        └── ProgressBar
```

### 2. 状态管理

使用 React Hooks 管理状态：

```typescript
// 用户输入
const [content, setContent] = useState('')
const [selectedModel, setSelectedModel] = useState('')
const [selectedTheme, setSelectedTheme] = useState('')

// AI 生成的大纲
const [outline, setOutline] = useState<OutlineResponse | null>(null)

// 任务状态
const [taskId, setTaskId] = useState<string | null>(null)
const [progress, setProgress] = useState(0)

// UI 状态
const [isGeneratingOutline, setIsGeneratingOutline] = useState(false)
const [isGeneratingPPT, setIsGeneratingPPT] = useState(false)
const [error, setError] = useState<string | null>(null)
```

### 3. API 客户端 (lib/api.ts)

封装所有后端交互：

```typescript
export async function generateOutline(
  content: string,
  model: string
): Promise<OutlineResponse> {
  const response = await apiClient.post('/api/generate-outline', {
    content,
    model,
  });
  return response.data;
}
```

**优点：**
- 统一错误处理
- 类型安全
- 易于测试

### 4. UI 组件库

基于 Shadcn UI 构建：

- **Button**: 统一的按钮样式和变体
- **Card**: 卡片容器
- **Textarea**: 文本输入
- **Select**: 下拉选择
- **Progress**: 进度条

## 核心流程

### 1. 大纲生成流程

```
用户输入需求
    ↓
选择 AI 模型
    ↓
点击"生成大纲"
    ↓
前端发送 POST /api/generate-outline
    ↓
后端创建适配器 (AIAdapterFactory)
    ↓
调用 AI API (OpenAI/Claude/etc.)
    ↓
AI 返回结构化 JSON
    ↓
后端验证并返回 OutlineResponse
    ↓
前端展示大纲，允许编辑
```

### 2. PPT 生成流程

```
用户确认大纲
    ↓
选择主题风格
    ↓
点击"确认生成 PPT"
    ↓
前端发送 POST /api/generate-ppt
    ↓
后端创建异步任务
    ↓
返回 task_id
    ↓
后台处理：
  - 初始化 PPTGenerator
  - 添加封面页
  - 循环添加内容页
  - 添加致谢页
  - 保存文件
    ↓
更新任务状态
    ↓
前端轮询 GET /api/task/{task_id}
    ↓
任务完成后自动下载
```

## 设计模式

### 1. 适配器模式 (Adapter Pattern)

**目的：** 统一不同 AI 模型的调用接口

**实现：**
```python
BaseAIAdapter (抽象基类)
    ├── OpenAIAdapter
    ├── ClaudeAdapter
    ├── DeepSeekAdapter
    └── GeminiAdapter
```

### 2. 工厂模式 (Factory Pattern)

**目的：** 根据模型类型创建对应的适配器

**实现：**
```python
class AIAdapterFactory:
    @classmethod
    def create_adapter(cls, model: AIModel) -> BaseAIAdapter:
        adapter_class = cls._adapters[model]
        return adapter_class(api_key)
```

### 3. 依赖注入 (Dependency Injection)

**目的：** 解耦配置和业务逻辑

**实现：**
```python
from app.config import settings

adapter = OpenAIAdapter(settings.openai_api_key)
```

## 安全性设计

### 1. API Keys 保护

- 存储在 `.env` 文件中
- 不提交到版本控制（.gitignore）
- 使用环境变量注入

### 2. CORS 配置

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. 输入验证

使用 Pydantic 自动验证：
```python
class GenerateOutlineRequest(BaseModel):
    content: str = Field(..., min_length=10)
    model: AIModel
```

### 4. 错误处理

统一的错误响应格式：
```python
class ErrorResponse(BaseModel):
    error: str
    message: str
    detail: Optional[str]
```

## 性能优化

### 1. 异步处理

```python
# 使用 async/await
async def generate_outline(self, prompt: str):
    response = await self.client.chat.completions.create(...)
```

### 2. 后台任务

```python
# PPT 生成使用后台任务，避免阻塞
asyncio.create_task(process_ppt_generation(task_id, request))
```

### 3. 前端优化

- 使用 Next.js 的自动代码分割
- Tailwind CSS 的 JIT 模式
- React 的懒加载

## 可扩展性

### 1. 添加新的 AI 模型

```python
# 1. 创建新适配器
class NewModelAdapter(BaseAIAdapter):
    async def generate_outline(self, prompt: str):
        # 实现逻辑
        pass

# 2. 注册到工厂
AIAdapterFactory._adapters[AIModel.NEW_MODEL] = NewModelAdapter
```

### 2. 添加新的主题

```python
# 在 PPTGenerator 中添加新主题配置
THEMES = {
    ThemeStyle.NEW_THEME: {
        "bg_color": RGBColor(...),
        "title_color": RGBColor(...),
        # ...
    }
}
```

### 3. 添加新的 PPT 布局

```python
def add_custom_slide(self, slide_data):
    """自定义幻灯片布局"""
    # 实现逻辑
    pass
```

## 部署建议

### 开发环境

使用提供的启动脚本：
```bash
./start.sh  # Linux/macOS
start.bat   # Windows
```

### 生产环境

#### 后端

```bash
# 使用 gunicorn + uvicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

#### 前端

```bash
# 构建生产版本
npm run build
npm start
```

#### Docker 部署

可以创建 Dockerfile：
```dockerfile
# Backend Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 监控和日志

### 后端日志

FastAPI 自动集成 uvicorn 日志：
```python
import logging
logger = logging.getLogger(__name__)
```

### 前端监控

使用浏览器开发者工具：
- Network 面板查看 API 请求
- Console 查看错误信息

## 未来规划

1. **功能增强**
   - 支持更多 AI 模型
   - 增加图片、图表自动生成
   - 支持模板自定义上传

2. **性能提升**
   - 引入 Redis 缓存
   - 使用消息队列处理任务

3. **用户体系**
   - 用户注册登录
   - 历史记录管理
   - 使用配额限制

4. **部署优化**
   - Docker Compose 一键部署
   - Kubernetes 集群部署
   - CI/CD 自动化流程

---

**文档版本：** 1.0.0  
**最后更新：** 2026-01-28
