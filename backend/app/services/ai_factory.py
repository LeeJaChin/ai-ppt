"""
AI 模型工厂
根据模型类型创建对应的适配器实例
"""
import logging
from typing import Dict, Type
from .ai_adapter import BaseAIAdapter
from .openai_adapter import OpenAIAdapter
from .claude_adapter import ClaudeAdapter
from .deepseek_adapter import DeepSeekAdapter
from .gemini_adapter import GeminiAdapter
from .private_adapter import PrivateModelAdapter
from ..models import AIModel
from ..config import settings

logger = logging.getLogger("ai-ppt.factory")



class AIAdapterFactory:
    """AI 适配器工厂类"""
    
    # 私有化模型列表
    PRIVATE_MODELS = {
        AIModel.DEEPSEEK_R1, AIModel.QWEN3_235B, AIModel.QWEN25_72B,
        AIModel.QWEN25_VL_72B, AIModel.QWEN3_32B, AIModel.QWEN3_EMBEDDING_8B,
        AIModel.BGE_RERANKER_V2_M3, AIModel.BGE_M3, AIModel.COSYVOICE_05B,
        AIModel.WHISPER_LARGE_V3
    }
    
    # 模型映射表
    _adapters: Dict[AIModel, Type[BaseAIAdapter]] = {
        AIModel.GPT4O: OpenAIAdapter,
        AIModel.CLAUDE35: ClaudeAdapter,
        AIModel.DEEPSEEK: DeepSeekAdapter,
        AIModel.GEMINI: GeminiAdapter,
    }
    
    @classmethod
    def create_adapter(cls, model: AIModel) -> BaseAIAdapter:
        """
        创建指定模型的适配器实例
        """
        logger.info(f"正在为模型 {model} 创建适配器")
        # 处理私有化模型
        if model in cls.PRIVATE_MODELS:
            logger.info(f"使用私有化适配器: {model}")
            return PrivateModelAdapter(
                api_key=settings.private_api_key,
                base_url=settings.private_api_url,
                model_name=model.value
            )


        if model not in cls._adapters:
            raise ValueError(f"不支持的模型: {model}")
        
        # 处理公共模型
        _api_keys: Dict[AIModel, str] = {
            AIModel.GPT4O: settings.openai_api_key,
            AIModel.CLAUDE35: settings.anthropic_api_key,
            AIModel.DEEPSEEK: settings.deepseek_api_key,
            AIModel.GEMINI: settings.gemini_api_key,
        }
        
        api_key = _api_keys.get(model)
        if not api_key:
            raise ValueError(f"未配置 {model} 的 API Key")
        
        adapter_class = cls._adapters[model]
        adapter = adapter_class(api_key)
        
        if not adapter.validate_api_key():
            raise ValueError(f"{model} 的 API Key 格式无效")
        
        return adapter
    
    @classmethod
    def get_available_models(cls) -> list[str]:
        """
        获取已配置 API Key 的可用模型列表
        """
        available = []
        
        # 检查公共模型
        _api_keys: Dict[AIModel, str] = {
            AIModel.GPT4O: settings.openai_api_key,
            AIModel.CLAUDE35: settings.anthropic_api_key,
            AIModel.DEEPSEEK: settings.deepseek_api_key,
            AIModel.GEMINI: settings.gemini_api_key,
        }
        
        for model, api_key in _api_keys.items():
            if api_key and not api_key.startswith("your_"):
                available.append(model.value)
        
        # 检查私有化模型
        if settings.private_api_key and not settings.private_api_key.startswith("your_"):
            for model in cls.PRIVATE_MODELS:
                available.append(model.value)
                
        return available
