import { Dayjs } from 'dayjs';
import {
  Task,
  Developer,
  Project,
  ParsedTask,
  TaskStatus,
  TaskPriority,
  TaskType,
} from '../../types';

// ============ Props Interfaces ============

export interface CreateTaskDrawerProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  task?: Task | null;
}

export interface TaskFormFieldsProps {
  values: FormValues;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  setFieldValue: (field: string, value: unknown) => void;
  developers: Developer[];
  projects: Project[];
  rewriting: boolean;
  onRewriteDescription: () => void;
}

export interface TaskAIChatSectionProps {
  chatMessages: ChatMessage[];
  chatInput: string;
  parsing: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onApplyParsedTask: (parsed: ParsedTask) => void;
}

export interface TaskLabelsFieldProps {
  labels: string[];
  onAdd: (label: string) => void;
  onRemove: (index: number) => void;
}

// ============ Form Interfaces ============

export interface FormValues {
  title: string;
  description: string;
  assignee: string;
  projectId: string;
  projectName: string;
  status: TaskStatus;
  priority: TaskPriority;
  taskType: TaskType;
  dueDate: Dayjs;
  labels: string[];
  images: string[];
  links: { title: string; url: string }[];
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  parsedTask?: ParsedTask;
}

// ============ Constants ============

export const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'in-review', label: 'In Review' },
  { value: 'done', label: 'Done' },
];

export const DEFAULT_LABELS = [
  'bug',
  'feature',
  'enhancement',
  'documentation',
  'urgent',
];

export const ROLE_COLORS: Record<string, string> = {
  'AI Developer': '#9c27b0',
  'Frontend Developer': '#2196f3',
  'Backend Developer': '#4caf50',
  'Full Stack Developer': '#ff9800',
  Tester: '#f44336',
  'QA Engineer': '#e91e63',
  'Product Owner': '#673ab7',
  'Project Manager': '#3f51b5',
  Designer: '#00bcd4',
  'UI/UX Designer': '#009688',
  'DevOps Engineer': '#795548',
  'Data Analyst': '#607d8b',
  'Business Analyst': '#8bc34a',
  'Scrum Master': '#ff5722',
  'Tech Lead': '#1976d2',
  'HR Manager': '#c2185b',
  'HR Executive': '#d81b60',
  Admin: '#5d4037',
  Finance: '#00695c',
  Marketing: '#f57c00',
  Sales: '#0288d1',
  Support: '#7b1fa2',
  Operations: '#455a64',
  Legal: '#6a1b9a',
  Other: '#9e9e9e',
};

// ============ Helper Functions ============

export const getRoleColor = (role: string): string => {
  return ROLE_COLORS[role] || '#9e9e9e';
};

// Re-export types from main types file
export type { Task, Developer, Project, ParsedTask, TaskStatus, TaskPriority, TaskType };
