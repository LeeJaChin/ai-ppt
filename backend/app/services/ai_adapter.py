"""
AI 模型适配器基类
使用适配器模式统一不同 AI 模型的调用接口
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional


class BaseAIAdapter(ABC):
    """AI 模型适配器抽象基类"""
    
    def __init__(self, api_key: str):
        """
        初始化适配器
        
        Args:
            api_key: API 密钥
        """
        self.api_key = api_key
        
    @abstractmethod
    async def generate_outline(self, prompt: str, slide_count: Optional[int] = None) -> Dict[str, Any]:
        """
        生成 PPT 大纲
        
        Args:
            prompt: 提示词
            slide_count: 期望的幻灯片数量
            
        Returns:
            包含大纲信息的字典
            
        Raises:
            Exception: API 调用失败时抛出异常
        """
        pass
    
    @abstractmethod
    def validate_api_key(self) -> bool:
        """
        验证 API 密钥是否有效
        
        Returns:
            密钥是否有效
        """
        pass
