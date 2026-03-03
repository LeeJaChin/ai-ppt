"""
Redis客户端工具类
用于管理与Redis的连接和操作
"""
import json
import redis
from typing import Optional, Dict, Any
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class RedisClient:
    """Redis客户端封装"""
    
    def __init__(self):
        self.redis_url = settings.redis_url
        self.redis_expiry = settings.redis_expiry
        self._client: Optional[redis.Redis] = None
    
    @property
    def client(self) -> redis.Redis:
        """获取Redis客户端实例"""
        if self._client is None:
            try:
                self._client = redis.from_url(self.redis_url, decode_responses=True)
                # 测试连接
                self._client.ping()
                logger.info("Redis连接成功")
            except Exception as e:
                logger.error(f"Redis连接失败: {str(e)}")
                # 如果Redis连接失败，返回None，后续会使用内存存储作为降级方案
                self._client = None
        return self._client
    
    def get(self, key: str) -> Optional[Dict[str, Any]]:
        """获取Redis中的数据"""
        try:
            if not self.client:
                return None
            data = self.client.get(key)
            if data:
                return json.loads(data)
            return None
        except Exception as e:
            logger.error(f"Redis get操作失败: {str(e)}")
            return None
    
    def set(self, key: str, value: Dict[str, Any]) -> bool:
        """设置Redis中的数据"""
        try:
            if not self.client:
                return False
            data = json.dumps(value, ensure_ascii=False)
            self.client.setex(key, self.redis_expiry, data)
            return True
        except Exception as e:
            logger.error(f"Redis set操作失败: {str(e)}")
            return False
    
    def delete(self, key: str) -> bool:
        """删除Redis中的数据"""
        try:
            if not self.client:
                return False
            self.client.delete(key)
            return True
        except Exception as e:
            logger.error(f"Redis delete操作失败: {str(e)}")
            return False
    
    def exists(self, key: str) -> bool:
        """检查Redis中是否存在指定key"""
        try:
            if not self.client:
                return False
            return bool(self.client.exists(key))
        except Exception as e:
            logger.error(f"Redis exists操作失败: {str(e)}")
            return False


# 全局Redis客户端实例
redis_client = RedisClient()
