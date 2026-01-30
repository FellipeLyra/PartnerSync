// SYSTEM TYPES

export interface Company {
  id: string;
  name: string;
  ownerId: string; // The user who created/owns this company space
  inviteCode: string; // Unique 6-char code for joining
  subscription?: 'FREE' | 'PRO';
  createdAt: number;
}

export interface UserPermissions {
  allowedViews: ViewState[];
  allowedProjectIds?: string[]; // If undefined, all projects. If empty array, no projects.
}

export interface User {
  id: string;
  username: string;
  avatar: string;
  email: string; // Should be mandatory now
  companyId: string; // REQUIRED: Users must belong to a company
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER'; // Simple RBAC
  password?: string; // stored plainly for this local demo only
  phone?: string; // Optional phone number
  permissions?: UserPermissions;
}

export interface TimeEntry {
  id: string;
  companyId: string; // Link to company
  userId: string;
  username: string;
  timestamp: string; // ISO string
  type: 'IN' | 'LUNCH_START' | 'LUNCH_END' | 'OUT';
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
  companyId: string; // Link to company
  name: string;
  description: string;
  tasks: Task[];
  columns?: Column[]; // If undefined, use defaults
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  companyId: string; // Link to company
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

export interface Transaction {
  id: string;
  companyId: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  date: string; // ISO Date "YYYY-MM-DD"
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  createdAt: number;
  createdBy: string;
}

export type ViewState = 'TIME_CLOCK' | 'PROJECTS' | 'CHAT' | 'SUPER_ADMIN_DASHBOARD' | 'FINANCE' | 'TEAM' | 'CRM';

// CRM TYPES

export interface Client {
  id: string;
  companyId: string;
  name: string; // Contact Person Name
  email?: string;
  phone?: string;
  organizationName?: string; // Company Name (e.g., "Tech Corp")
  cnpj?: string;
  role?: string; // e.g., "CEO", "Marketing Manager"
  linkedinProfile?: string;
  revenueHistory?: number; // Total revenue generated from this client
  leadSource?: string; // e.g., "Website", "Referral"
  tags?: string[];
  notes?: string;
  address?: string;
  createdAt: number;
}

export interface Deal {
  id: string;
  companyId: string;
  clientId: string;
  title: string;
  value: number;
  pipelineId?: string; // For multiple pipelines
  stageId: string; // Column ID
  probability: number; // 0-100%
  expectedCloseDate?: string;
  status: 'OPEN' | 'WON' | 'LOST';
  lostReason?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Interaction {
  id: string;
  companyId: string;
  clientId: string;
  dealId?: string;
  type: 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE' | 'WHATSAPP';
  content: string;
  date: number;
  performedBy: string; // User ID
}

export interface CRMPipeline {
  id: string;
  companyId: string; // If custom pipelines are allowed per company
  name: string;
  stages: Column[];
}

export interface ClientMessage {
  id: string;
  companyId: string;
  clientId: string;
  direction: 'INBOUND' | 'OUTBOUND'; // INBOUND = Do cliente para nós, OUTBOUND = Nós para cliente
  content: string;
  timestamp: number;
  status: 'SENT' | 'DELIVERED' | 'READ';
  type: 'TEXT' | 'IMAGE' | 'DOCUMENT';
  mediaUrl?: string;
  senderId?: string; // ID of the user (employee) who sent the message
  senderName?: string; // Display name
}