/**
 * API 客户端
 * 封装与后端 API 的交互
 */
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 120000, // 增加到 120 秒
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器，添加认证令牌
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 类型定义
export interface SlideContent {
  title: string;
  bullet_points: string[];
  layout: 
    | 'title' 
    | 'bullets' 
    | 'column' 
    | 'process' 
    | 'column_chart' 
    | 'bar_chart' 
    | 'line_chart' 
    | 'pie_chart' 
    | 'area_chart' 
    | 'stacked_chart' 
    | 'timeline' 
    | 'big_number' 
    | 'thanks';
  icon?: string;
  data_points?: any[]; // 使用 any 兼容多种格式
  notes?: string;
}

export interface OutlineResponse {
  title: string;
  slides: SlideContent[];
}

export interface GenerateOutlineRequest {
  content: string;
  model: string;
  slide_count?: number;
}

export interface GeneratePPTRequest {
  outline: OutlineResponse;
  theme: string;
  template_id?: string;
}

export interface TaskResponse {
  task_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message?: string;
  download_url?: string;
}

/**
 * 获取可用的 AI 模型列表
 */
export async function getAvailableModels(): Promise<string[]> {
  try {
    const response = await apiClient.get('/api/models');
    return response.data.models;
  } catch (error) {
    console.error('获取模型列表失败:', error);
    throw error;
  }
}

/**
 * 生成 PPT 大纲
 */
export async function generateOutline(
  content: string,
  model: string,
  slideCount?: number
): Promise<OutlineResponse> {
  try {
    const response = await apiClient.post<OutlineResponse>('/api/generate-outline', {
      content,
      model,
      slide_count: slideCount,
    });
    return response.data;
  } catch (error: any) {
    console.error('生成大纲失败:', error);
    throw new Error(error.response?.data?.detail || '生成大纲失败');
  }
}

/**
 * 生成 PPT 文件
 */
export async function generatePPT(
  outline: OutlineResponse,
  theme: string,
  templateId?: string
): Promise<TaskResponse> {
  try {
    const response = await apiClient.post<TaskResponse>('/api/generate-ppt', {
      outline,
      theme,
      template_id: templateId,
    });
    return response.data;
  } catch (error: any) {
    console.error('生成 PPT 失败:', error);
    const detail = error.response?.data?.detail;
    const errorMessage = typeof detail === 'object' 
      ? JSON.stringify(detail) 
      : (detail || error.message || '生成 PPT 失败');
    throw new Error(errorMessage);
  }
}

/**
 * 上传 PPT 模板
 */
export async function uploadTemplate(file: File): Promise<{ template_id: string; filename: string }> {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await apiClient.post('/api/upload-template', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('上传模板失败:', error);
    throw new Error(error.response?.data?.detail || '上传模板失败');
  }
}

/**
 * 查询任务状态
 */
export async function getTaskStatus(taskId: string): Promise<TaskResponse> {
  try {
    const response = await apiClient.get<TaskResponse>(`/api/task/${taskId}`);
    return response.data;
  } catch (error: any) {
    console.error('查询任务状态失败:', error);
    throw new Error(error.response?.data?.detail || '查询任务状态失败');
  }
}

/**
 * 获取下载链接
 */
export function getDownloadUrl(taskId: string): string {
  return `${API_URL}/api/download/${taskId}`;
}

/**
 * 文件转换
 */
export async function convertFile(file: File, targetFormat: string): Promise<TaskResponse> {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await apiClient.post<TaskResponse>(`/api/convert?target_format=${targetFormat}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('发起转换失败:', error);
    throw new Error(error.response?.data?.detail || '发起转换失败');
  }
}

// 认证相关的类型定义
export interface User {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface HistoryItem {
  id: string;
  user_id: string;
  title: string;
  task_id: string;
  file_path?: string;
  created_at: string;
}

export interface HistoryResponse {
  items: HistoryItem[];
  total: number;
}

// 认证相关的API调用
export async function register(name: string, email: string, password: string): Promise<TokenResponse> {
  try {
    const response = await apiClient.post<TokenResponse>('/api/auth/register', {
      name,
      email,
      password,
    });
    // 存储令牌
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  } catch (error: any) {
    console.error('注册失败:', error);
    throw new Error(error.response?.data?.detail || '注册失败');
  }
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  try {
    const response = await apiClient.post<TokenResponse>('/api/auth/login', {
      email,
      password,
    });
    // 存储令牌
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  } catch (error: any) {
    console.error('登录失败:', error);
    throw new Error(error.response?.data?.detail || '登录失败');
  }
}

export function logout(): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
}

export async function getCurrentUser(): Promise<User> {
  try {
    const response = await apiClient.get<User>('/api/auth/me');
    return response.data;
  } catch (error: any) {
    console.error('获取用户信息失败:', error);
    throw new Error(error.response?.data?.detail || '获取用户信息失败');
  }
}

export async function getHistory(): Promise<HistoryResponse> {
  try {
    const response = await apiClient.get<HistoryResponse>('/api/history');
    return response.data;
  } catch (error: any) {
    console.error('获取历史记录失败:', error);
    throw new Error(error.response?.data?.detail || '获取历史记录失败');
  }
}

// 获取存储的用户信息
export function getStoredUser(): User | null {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
}

// 检查是否已登录
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('access_token');
}
