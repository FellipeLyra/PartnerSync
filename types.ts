export interface User {
  id: string;
  username: string;
  avatar: string;
  password?: string; // stored plainly for this local demo only
}

export interface TimeEntry {
  id: string;
  userId: string;
  username: string;
  timestamp: string; // ISO string
  type: 'IN' | 'OUT';
  isLate?: boolean; // If clocked in after 8:00 AM
}

// Changed from enum to string to support dynamic columns
export type TaskStatus = string;

export const DEFAULT_STATUSES = {
  TODO: 'TODO',
  DOING: 'DOING',
  DONE: 'DONE'
};

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: string;
  content: string; // Title
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string; // ISO date string (YYYY-MM-DD)
  mediaUrl?: string; // Image or Video URL
  assignee?: string;
  createdAt: number;
}

export interface Column {
  id: string; // The status ID (e.g., 'TODO', 'custom-123')
  title: string;
  colorClass: string; // Tailwind class mostly for text/border colors
  order?: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
  columns?: Column[]; // If undefined, use defaults
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  userId: string; // 'system' or 'ai' or user.id
  username: string;
  text: string;
  timestamp: number;
  isAi?: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  projectId?: string; // 'global' or specific project ID
  isStarred?: boolean;
  isEdited?: boolean;
  userAvatar?: string;
  replyTo?: {
    id: string;
    username: string;
    text: string;
  };
}

export type ViewState = 'TIME_CLOCK' | 'PROJECTS' | 'CHAT';