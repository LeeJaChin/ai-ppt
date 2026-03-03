import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 定义状态类型
interface UserState {
  user: {
    id: string;
    username: string;
    email: string;
  } | null;
  token: string | null;
  setUser: (user: { id: string; username: string; email: string }, token: string) => void;
  logout: () => void;
}

interface PptState {
  content: string;
  selectedModel: string;
  selectedTheme: string;
  outline: {
    title: string;
    slides: Array<{
      title: string;
      bullet_points: string[];
      notes: string;
    }>;
  } | null;
  setContent: (content: string) => void;
  setSelectedModel: (model: string) => void;
  setSelectedTheme: (theme: string) => void;
  setOutline: (outline: any) => void;
  updateSlide: (index: number, slide: any) => void;
  resetPptState: () => void;
}

interface TaskState {
  taskId: string | null;
  progress: number;
  status: 'idle' | 'generating' | 'completed' | 'failed';
  error: string | null;
  setTaskId: (taskId: string) => void;
  setProgress: (progress: number) => void;
  setStatus: (status: 'idle' | 'generating' | 'completed' | 'failed') => void;
  setError: (error: string | null) => void;
  resetTaskState: () => void;
}

interface HistoryState {
  history: Array<{
    id: string;
    title: string;
    createdAt: string;
    downloadUrl: string;
  }>;
  addToHistory: (item: { title: string; downloadUrl: string }) => void;
  clearHistory: () => void;
}

// 创建用户状态store
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'user-storage',
    }
  )
);

// 创建PPT状态store
export const usePptStore = create<PptState>((set) => ({
  content: '',
  selectedModel: 'gpt-4o',
  selectedTheme: 'business',
  outline: null,
  setContent: (content) => set({ content }),
  setSelectedModel: (model) => set({ selectedModel: model }),
  setSelectedTheme: (theme) => set({ selectedTheme: theme }),
  setOutline: (outline) => set({ outline }),
  updateSlide: (index, slide) =>
    set((state) => {
      if (!state.outline) return state;
      const newSlides = [...state.outline.slides];
      newSlides[index] = slide;
      return {
        outline: {
          ...state.outline,
          slides: newSlides,
        },
      };
    }),
  resetPptState: () =>
    set({
      content: '',
      selectedModel: 'gpt-4o',
      selectedTheme: 'business',
      outline: null,
    }),
}));

// 创建任务状态store
export const useTaskStore = create<TaskState>((set) => ({
  taskId: null,
  progress: 0,
  status: 'idle',
  error: null,
  setTaskId: (taskId) => set({ taskId }),
  setProgress: (progress) => set({ progress }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),
  resetTaskState: () =>
    set({
      taskId: null,
      progress: 0,
      status: 'idle',
      error: null,
    }),
}));

// 创建历史记录状态store
export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      history: [],
      addToHistory: (item) =>
        set((state) => ({
          history: [
            {
              id: Date.now().toString(),
              ...item,
              createdAt: new Date().toISOString(),
            },
            ...state.history,
          ],
        })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'history-storage',
    }
  )
);

// 组合所有状态的类型
export type RootState = UserState & PptState & TaskState & HistoryState;
