"""
图片生成服务
支持基于文本描述生成相关图片
"""
import os
import logging
import asyncio
from typing import Optional
from ..config import settings

logger = logging.getLogger("ai-ppt.image-generator")


class ImageGenerator:
    """
    图片生成器类
    支持多种图片生成方式
    """
    
    def __init__(self):
        self.enabled = False
        self.provider = None
        self.api_key = None
        
        # 检查配置
        if hasattr(settings, "OPENAI_API_KEY") and settings.OPENAI_API_KEY:
            self.provider = "openai"
            self.api_key = settings.OPENAI_API_KEY
            self.enabled = True
        elif hasattr(settings, "GEMINI_API_KEY") and settings.GEMINI_API_KEY:
            self.provider = "gemini"
            self.api_key = settings.GEMINI_API_KEY
            self.enabled = True
        
        logger.info(f"ImageGenerator initialized: provider={self.provider}, enabled={self.enabled}")
    
    async def generate_image(self, prompt: str, size: str = "1024x1024") -> Optional[str]:
        """
        生成图片
        
        Args:
            prompt: 图片描述
            size: 图片尺寸，默认1024x1024
            
        Returns:
            图片URL或本地路径
        """
        if not self.enabled:
            logger.warning("Image generation is not enabled, missing API key")
            return None
        
        try:
            if self.provider == "openai":
                return await self._generate_with_openai(prompt, size)
            elif self.provider == "gemini":
                return await self._generate_with_gemini(prompt, size)
            else:
                logger.error(f"Unsupported image provider: {self.provider}")
                return None
        except Exception as e:
            logger.error(f"Image generation failed: {str(e)}")
            return None
    
    async def _generate_with_openai(self, prompt: str, size: str) -> Optional[str]:
        """
        使用OpenAI生成图片
        """
        try:
            from openai import AsyncOpenAI
            
            client = AsyncOpenAI(api_key=self.api_key)
            
            response = await client.images.generate(
                model="dall-e-3",
                prompt=prompt,
                size=size,
                quality="standard",
                n=1,
            )
            
            image_url = response.data[0].url
            logger.info(f"Generated image with OpenAI: {image_url}")
            return image_url
        except Exception as e:
            logger.error(f"OpenAI image generation failed: {str(e)}")
            return None
    
    async def _generate_with_gemini(self, prompt: str, size: str) -> Optional[str]:
        """
        使用Gemini生成图片
        """
        try:
            from google.generativeai import configure, generate_images
            
            configure(api_key=self.api_key)
            
            response = generate_images(
                prompt=prompt,
                size=size,
                safety_filter_level="block_none"
            )
            
            image_url = response.images[0].url
            logger.info(f"Generated image with Gemini: {image_url}")
            return image_url
        except Exception as e:
            logger.error(f"Gemini image generation failed: {str(e)}")
            return None


# 创建全局实例
image_generator = ImageGenerator()
