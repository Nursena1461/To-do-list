// src/types/index.ts
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
}

export type TabName = 'today' | 'weekly' | 'monthly' | 'yearly' | 'all'; // 'all' ekleyebiliriz