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
