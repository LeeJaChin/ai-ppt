"""
认证服务
处理用户认证和JWT令牌生成
"""
import jwt
import bcrypt
import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# 用于存储用户数据的内存存储（生产环境应使用数据库）
users_db: Dict[str, Dict[str, Any]] = {}

# 用于存储历史记录的内存存储
history_db: Dict[str, Dict[str, Any]] = {}


class AuthService:
    """认证服务类"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """哈希密码"""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """验证密码"""
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    @staticmethod
    def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """创建访问令牌"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=120)  # 默认2小时过期
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, "secret_key", algorithm="HS256")  # 生产环境应使用环境变量中的密钥
        return encoded_jwt
    
    @staticmethod
    def decode_token(token: str) -> Optional[Dict[str, Any]]:
        """解码令牌"""
        try:
            payload = jwt.decode(token, "secret_key", algorithms=["HS256"])
            return payload
        except jwt.PyJWTError:
            return None
    
    @staticmethod
    def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
        """根据邮箱获取用户"""
        for user in users_db.values():
            if user['email'] == email:
                return user
        return None
    
    @staticmethod
    def create_user(name: str, email: str, password: str) -> Dict[str, Any]:
        """创建用户"""
        user_id = str(uuid.uuid4())
        hashed_password = AuthService.hash_password(password)
        user = {
            "id": user_id,
            "name": name,
            "email": email,
            "password": hashed_password,
            "is_active": True,
            "created_at": datetime.utcnow().isoformat()
        }
        users_db[user_id] = user
        logger.info(f"创建用户: {email}")
        return user
    
    @staticmethod
    def add_history_record(user_id: str, title: str, task_id: str, file_path: Optional[str] = None) -> Dict[str, Any]:
        """添加历史记录"""
        history_id = str(uuid.uuid4())
        history = {
            "id": history_id,
            "user_id": user_id,
            "title": title,
            "task_id": task_id,
            "file_path": file_path,
            "created_at": datetime.utcnow().isoformat()
        }
        history_db[history_id] = history
        logger.info(f"添加历史记录: {title} 对于用户: {user_id}")
        return history
    
    @staticmethod
    def get_user_history(user_id: str) -> list[Dict[str, Any]]:
        """获取用户历史记录"""
        history = []
        for record in history_db.values():
            if record['user_id'] == user_id:
                history.append(record)
        # 按创建时间倒序排序
        history.sort(key=lambda x: x['created_at'], reverse=True)
        return history
