"""
FastAPI 主应用入口
"""
import os
import uuid
import asyncio
import logging
from datetime import datetime
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

# 配置日志
logging.basicConfig(
    level=logging.DEBUG, # 改为 DEBUG
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("ai-ppt")

from fastapi.responses import FileResponse
from typing import Dict
from .config import settings
from .models import (
    GenerateOutlineRequest,
    GeneratePPTRequest,
    OutlineResponse,
    TaskResponse,
    TaskStatus,
    ErrorResponse,
)
from .services.ai_factory import AIAdapterFactory
from .services.ppt_generator import PPTGenerator
from .services.converter import FileConverter


# 创建 FastAPI 应用
app = FastAPI(
    title="AI-PPT Architect API",
    description="AI 驱动的 PPT 自动生成服务",
    version="1.0.0",
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 任务存储（生产环境应使用 Redis 或数据库）
tasks_storage: Dict[str, Dict] = {}


@app.get("/")
async def root():
    """健康检查端点"""
    return {
        "message": "AI-PPT Architect API",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/api/models")
async def get_available_models():
    """
    获取可用的 AI 模型列表
    
    Returns:
        可用模型列表
    """
    try:
        models = AIAdapterFactory.get_available_models()
        return {
            "models": models,
            "count": len(models)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/upload-template")
async def upload_template(file: UploadFile = File(...)):
    """
    上传 PPT 模板文件 (.pptx)
    """
    if not file.filename.endswith(".pptx"):
        raise HTTPException(status_code=400, detail="只支持 .pptx 格式的模板文件")
    
    try:
        # 确保目录存在
        os.makedirs(settings.templates_dir, exist_ok=True)
        
        # 生成唯一 ID 和保存路径
        template_id = str(uuid.uuid4())
        file_ext = os.path.splitext(file.filename)[1]
        filename = f"{template_id}{file_ext}"
        save_path = os.path.join(settings.templates_dir, filename)
        
        # 保存文件
        with open(save_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        logger.info(f"模板上传成功: {file.filename} -> {template_id}")
        
        return {
            "template_id": template_id,
            "filename": file.filename,
            "message": "模板上传成功"
        }
    except Exception as e:
        logger.error(f"模板上传失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"模板上传失败: {str(e)}")


@app.post("/api/generate-outline", response_model=OutlineResponse)
async def generate_outline(request: GenerateOutlineRequest):
    """
    生成 PPT 大纲
    """
    logger.info(f"收到大纲生成请求: 模型={request.model.value}, 内容长度={len(request.content)}")
    try:
        # 创建适配器
        adapter = AIAdapterFactory.create_adapter(request.model)
        
        # 生成大纲
        outline_data = await adapter.generate_outline(request.content, slide_count=request.slide_count)
        
        logger.info(f"大纲生成成功: 幻灯片数量={len(outline_data.get('slides', []))}")
        # 验证返回数据
        return OutlineResponse(**outline_data)
        
    except ValueError as e:
        logger.error(f"参数错误: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"大纲生成异常: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"大纲生成失败: {str(e)}"
        )


@app.post("/api/generate-ppt", response_model=TaskResponse)
async def generate_ppt(request: GeneratePPTRequest):
    """
    生成 PPT 文件（异步任务）
    
    Args:
        request: 包含大纲和主题的请求
        
    Returns:
        任务信息，包含任务 ID
    """
    try:
        # 生成任务 ID
        task_id = str(uuid.uuid4())
        
        # 初始化任务状态
        tasks_storage[task_id] = {
            "status": TaskStatus.PENDING,
            "progress": 0,
            "message": "任务已创建",
            "created_at": datetime.now().isoformat(),
        }
        
        # 启动后台任务
        asyncio.create_task(process_ppt_generation(task_id, request))
        
        return TaskResponse(
            task_id=task_id,
            status=TaskStatus.PENDING,
            progress=0,
            message="PPT 生成任务已启动"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"任务创建失败: {str(e)}"
        )


async def process_ppt_generation(task_id: str, request: GeneratePPTRequest):
    """
    后台处理 PPT 生成任务
    
    Args:
        task_id: 任务 ID
        request: 生成请求
    """
    try:
        # 更新状态：处理中
        tasks_storage[task_id]["status"] = TaskStatus.PROCESSING
        tasks_storage[task_id]["progress"] = 10
        tasks_storage[task_id]["message"] = "正在初始化..."
        
        # 确保输出目录存在
        os.makedirs(settings.output_dir, exist_ok=True)
        
        # 生成文件名
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"ppt_{timestamp}_{task_id[:8]}.pptx"
        output_path = os.path.join(settings.output_dir, filename)
        
        tasks_storage[task_id]["progress"] = 30
        tasks_storage[task_id]["message"] = "正在生成 PPT..."
        
        # 获取模板路径
        template_path = None
        if request.template_id:
            template_path = os.path.abspath(os.path.join(settings.templates_dir, f"{request.template_id}.pptx"))
            logger.info(f"正在检查模板路径: {template_path}")
            if not os.path.exists(template_path):
                logger.warning(f"模板文件不存在: {template_path}, 将使用默认样式")
                template_path = None
            else:
                logger.info(f"模板文件确认存在，准备载入")
        
        # 创建 PPT 生成器
        generator = PPTGenerator(theme=request.theme, template_path=template_path)
        
        # 生成 PPT
        file_path = generator.generate(
            title=request.outline.title,
            slides=request.outline.slides,
            output_path=output_path
        )
        
        tasks_storage[task_id]["progress"] = 90
        tasks_storage[task_id]["message"] = "正在完成..."
        
        # 模拟一些处理时间
        await asyncio.sleep(0.5)
        
        # 完成
        tasks_storage[task_id]["status"] = TaskStatus.COMPLETED
        tasks_storage[task_id]["progress"] = 100
        tasks_storage[task_id]["message"] = "PPT 生成完成"
        tasks_storage[task_id]["file_path"] = file_path
        tasks_storage[task_id]["download_url"] = f"/api/download/{task_id}"
        
    except Exception as e:
        # 错误处理
        tasks_storage[task_id]["status"] = TaskStatus.FAILED
        tasks_storage[task_id]["message"] = f"生成失败: {str(e)}"
        tasks_storage[task_id]["error"] = str(e)


@app.get("/api/task/{task_id}", response_model=TaskResponse)
async def get_task_status(task_id: str):
    """
    查询任务状态
    
    Args:
        task_id: 任务 ID
        
    Returns:
        任务状态信息
    """
    if task_id not in tasks_storage:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    task = tasks_storage[task_id]
    
    return TaskResponse(
        task_id=task_id,
        status=task["status"],
        progress=task["progress"],
        message=task.get("message"),
        download_url=task.get("download_url")
    )


@app.get("/api/download/{task_id}")
async def download_ppt(task_id: str):
    """
    下载生成的 PPT 文件
    
    Args:
        task_id: 任务 ID
        
    Returns:
        PPT 文件
    """
    if task_id not in tasks_storage:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    task = tasks_storage[task_id]
    
    if task["status"] != TaskStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="文件尚未生成完成")
    
    file_path = task.get("file_path")
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="文件不存在")
    
    filename = os.path.basename(file_path)
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation"
    )


@app.post("/api/convert", response_model=TaskResponse)
async def convert_file(
    file: UploadFile = File(...),
    target_format: str = "pdf"
):
    """
    文件转换端点
    支持: 
    - pptx -> pdf
    - docx -> pdf
    - pdf -> docx
    - pdf -> pptx
    """
    # 获取文件后缀
    ext = os.path.splitext(file.filename)[1].lower()
    
    # 建立任务
    task_id = str(uuid.uuid4())
    tasks_storage[task_id] = {
        "status": TaskStatus.PENDING,
        "progress": 0,
        "message": "转换任务已启动",
        "created_at": datetime.now().isoformat(),
    }
    
    # 保存上传的文件到临时目录
    temp_dir = os.path.join(settings.output_dir, "temp")
    os.makedirs(temp_dir, exist_ok=True)
    input_filename = f"{task_id}_in{ext}"
    input_path = os.path.join(temp_dir, input_filename)
    
    with open(input_path, "wb") as f:
        content = await file.read()
        f.write(content)
        
    # 定义输出路径
    output_ext = f".{target_format}" if not target_format.startswith(".") else target_format
    output_filename = f"{task_id}_out{output_ext}"
    output_path = os.path.join(settings.output_dir, output_filename)
    
    # 异步处理转换
    asyncio.create_task(process_conversion(task_id, input_path, output_path, ext, output_ext))
    
    return TaskResponse(
        task_id=task_id,
        status=TaskStatus.PENDING,
        progress=0,
        message="文件转换中..."
    )


async def process_conversion(task_id: str, input_path: str, output_path: str, in_ext: str, out_ext: str):
    """处理文件转换后台任务"""
    try:
        tasks_storage[task_id]["status"] = TaskStatus.PROCESSING
        tasks_storage[task_id]["progress"] = 20
        
        success = False
        
        # 创建转换器实例
        converter = FileConverter()
        
        # 根据文件类型选择转换方法
        if in_ext in ['.ppt', '.pptx'] and out_ext == '.pdf':
            success = converter.ppt_to_pdf(input_path, output_path)
            logger.info(f"PPT to PDF conversion {'successful' if success else 'failed'}: {input_path} -> {output_path}")
        elif in_ext in ['.doc', '.docx'] and out_ext == '.pdf':
            success = converter.word_to_pdf(input_path, output_path)
            logger.info(f"Word to PDF conversion {'successful' if success else 'failed'}: {input_path} -> {output_path}")
        elif in_ext == '.pdf' and out_ext in ['.docx', '.doc']:
            success = converter.pdf_to_word(input_path, output_path)
            logger.info(f"PDF to Word conversion {'successful' if success else 'failed'}: {input_path} -> {output_path}")
        elif in_ext == '.pdf' and out_ext in ['.pptx', '.ppt']:
            success = converter.pdf_to_ppt(input_path, output_path)
            logger.info(f"PDF to PPT conversion {'successful' if success else 'failed'}: {input_path} -> {output_path}")
        else:
            logger.error(f"Unsupported conversion: {in_ext} to {out_ext}")
            raise HTTPException(status_code=400, detail=f"Unsupported conversion: {in_ext} to {out_ext}")

        if success:
            tasks_storage[task_id]["status"] = TaskStatus.COMPLETED
            tasks_storage[task_id]["progress"] = 100
            tasks_storage[task_id]["message"] = "转换完成"
            tasks_storage[task_id]["file_path"] = output_path
            tasks_storage[task_id]["download_url"] = f"/api/download/{task_id}"
        else:
            raise Exception("转换引擎执行失败，请检查文件格式或重试")
            
    except Exception as e:
        tasks_storage[task_id]["status"] = TaskStatus.FAILED
        tasks_storage[task_id]["message"] = f"转换失败: {str(e)}"
    finally:
        # 清理临时输入文件
        if os.path.exists(input_path):
            try:
                os.remove(input_path)
            except:
                pass


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=True
    )