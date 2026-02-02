import { ReactElement } from 'react';
import {
  History as HistoryIcon,
  Create as CreateIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SwapHoriz as ChangeIcon,
} from '@mui/icons-material';
import { createElement } from 'react';

export interface HistoryEntry {
  _id: string;
  taskId: string;
  action: string;
  changes: Record<string, { from: unknown; to: unknown }>;
  performedBy: string;
  performedAt: string;
  emailSent: boolean;
  emailTo?: string;
}

export const formatFieldName = (field: string): string => {
  const names: Record<string, string> = {
    title: 'Title',
    description: 'Description',
    assignee: 'Assignee',
    status: 'Status',
    priority: 'Priority',
    dueDate: 'Due Date',
    labels: 'Labels',
    taskType: 'Type',
  };
  return names[field] || field;
};

export const formatValue = (field: string, value: unknown): string => {
  if (value === null || value === undefined) return 'None';
  if (field === 'dueDate' && typeof value === 'string') {
    return new Date(value).toLocaleDateString();
  }
  if (field === 'labels' && Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : 'None';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
};

export const getActionIcon = (action: string): ReactElement => {
  const iconProps = { fontSize: 'small' as const };
  switch (action) {
    case 'created':
      return createElement(CreateIcon, iconProps);
    case 'updated':
      return createElement(EditIcon, iconProps);
    case 'deleted':
      return createElement(DeleteIcon, iconProps);
    case 'status_changed':
      return createElement(ChangeIcon, iconProps);
    default:
      return createElement(HistoryIcon, iconProps);
  }
};

export const getActionColor = (action: string): string => {
  switch (action) {
    case 'created':
      return '#4caf50';
    case 'updated':
      return '#2196f3';
    case 'deleted':
      return '#f44336';
    case 'status_changed':
      return '#ff9800';
    default:
      return '#9e9e9e';
  }
};

export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};
