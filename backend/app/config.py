"""
配置管理模块
使用 pydantic-settings 管理环境变量
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """应用配置类"""
    
    # API Keys
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    deepseek_api_key: str = ""
    gemini_api_key: str = ""
    
    # 私有化模型配置
    private_api_key: str = ""
    private_api_url: str = ""
    
    # 服务配置
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    cors_origins: str = "http://localhost:3000"
    
    # PPT 配置
    output_dir: str = "./output"
    templates_dir: str = "./templates"
    max_slides: int = 50
    
    class Config:
        env_file = ".env"
        case_sensitive = False

    @property
    def cors_origins_list(self) -> List[str]:
        """将 CORS 来源字符串转换为列表"""
        return [origin.strip() for origin in self.cors_origins.split(",")]


# 全局配置实例
settings = Settings()
