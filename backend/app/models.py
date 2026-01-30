"""
数据模型定义
定义请求和响应的 Pydantic 模型
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class AIModel(str, Enum):
    """支持的 AI 模型枚举"""
    GPT4O = "gpt-4o"
    CLAUDE35 = "claude-3-5-sonnet-20240620"
    DEEPSEEK = "deepseek-chat"
    GEMINI = "gemini-pro"
    
    # 私有化模型
    DEEPSEEK_R1 = "DeepSeek-R1"
    QWEN3_235B = "Qwen3-235B"
    QWEN25_72B = "Qwen2.5-72B"
    QWEN25_VL_72B = "Qwen2.5-VL-72B"
    QWEN3_32B = "Qwen3-32B"
    QWEN3_EMBEDDING_8B = "Qwen3-embedding-8B"
    BGE_RERANKER_V2_M3 = "bge-reranker-v2-m3"
    BGE_M3 = "bge-m3"
    COSYVOICE_05B = "CosyVoice-0.5B"
    WHISPER_LARGE_V3 = "whisper-large-v3"


class ThemeStyle(str, Enum):
    """PPT 主题风格枚举"""
    BUSINESS = "business"  # 商务风格
    TECH = "tech"  # 科技风格
    CREATIVE = "creative"  # 创意风格


class SlideLayout(str, Enum):
    """幻灯片布局类型"""
    TITLE = "title"          # 标题页
    BULLETS = "bullets"      # 列表页
    TWO_COLUMN = "column"    # 双栏对比
    PROCESS = "process"      # 流程步骤
    DATA_COLUMN = "column_chart"  # 柱状图
    DATA_BAR = "bar_chart"        # 条形图
    DATA_LINE = "line_chart"      # 折线图
    DATA_PIE = "pie_chart"        # 饼图
    DATA_AREA = "area_chart"      # 面积图
    DATA_STACKED = "stacked_chart" # 堆积图
    TIMELINE = "timeline"         # 时间轴/里程碑
    BIG_NUMBER = "big_number"     # 数字大屏
    THANK_YOU = "thanks"     # 致谢页


class SlideContent(BaseModel):
    """单个幻灯片的内容 - 增强版"""
    title: str = Field(..., description="幻灯片标题")
    bullet_points: List[str] = Field(default_factory=list, description="要点列表")
    layout: SlideLayout = Field(default=SlideLayout.BULLETS, description="布局建议")
    icon: Optional[str] = Field(None, description="视觉图标/Emoji 建议")
    data_points: Optional[List[dict]] = Field(None, description="数据点(用于图表/对比)")
    notes: Optional[str] = Field(None, description="备注信息")


class OutlineResponse(BaseModel):
    """大纲响应模型"""
    title: str = Field(..., description="PPT 总标题")
    slides: List[SlideContent] = Field(..., description="幻灯片列表")


class GenerateOutlineRequest(BaseModel):
    """生成大纲请求模型"""
    content: str = Field(..., min_length=10, description="用户输入的核心需求或长文本")
    model: AIModel = Field(default=AIModel.GPT4O, description="选择的 AI 模型")
    slide_count: Optional[int] = Field(default=None, ge=5, le=30, description="期望的幻灯片数量")


class GeneratePPTRequest(BaseModel):
    """生成 PPT 请求模型"""
    outline: OutlineResponse = Field(..., description="确认后的大纲")
    theme: ThemeStyle = Field(default=ThemeStyle.BUSINESS, description="选择的主题风格")
    template_id: Optional[str] = Field(None, description="自定义模板 ID")


class TaskStatus(str, Enum):
    """任务状态枚举"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class TaskResponse(BaseModel):
    """任务响应模型"""
    task_id: str = Field(..., description="任务 ID")
    status: TaskStatus = Field(..., description="任务状态")
    progress: int = Field(default=0, description="任务进度 0-100")
    message: Optional[str] = Field(None, description="状态消息")
    download_url: Optional[str] = Field(None, description="下载链接")


class ErrorResponse(BaseModel):
    """错误响应模型"""
    error: str = Field(..., description="错误类型")
    message: str = Field(..., description="错误消息")
    detail: Optional[str] = Field(None, description="详细信息")
