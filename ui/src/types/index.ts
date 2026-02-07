export interface TaskAgent {
  agentId: string;
  agentName: string;
}

export interface AgentExecutionNodeResult {
  nodeId: string;
  nodeName: string;
  category: string;
  success: boolean;
  result?: unknown;
  error?: string;
  logs: string[];
  duration: number;
}

export interface AgentExecutionLog {
  _id: string;
  taskId: string;
  agentId: string;
  agentName: string;
  status: 'running' | 'success' | 'error';
  nodeResults: AgentExecutionNodeResult[];
  totalDuration: number;
  triggeredBy: string;
  startedAt: string;
  completedAt?: string;
}

export interface Task {
  id: string;
  taskId: string;
  title: string;
  description: string;
  assignee: string;
  projectId?: string;
  projectName?: string;
  status: TaskStatus;
  priority: TaskPriority;
  taskType: TaskType;
  labels: string[];
  dueDate: string;
  images: string[];
  links: { title: string; url: string }[];
  agents: TaskAgent[];
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'todo' | 'in-progress' | 'in-review' | 'done';

export type TaskPriority = 'P1' | 'P2' | 'P3' | 'P4';

export type TaskType = 'task' | 'bug' | 'incident' | 'feature' | 'improvement' | 'other';

export const TASK_PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'P1', label: 'P1 - Critical', color: '#d32f2f' },
  { value: 'P2', label: 'P2 - High', color: '#f57c00' },
  { value: 'P3', label: 'P3 - Medium', color: '#fbc02d' },
  { value: 'P4', label: 'P4 - Low', color: '#388e3c' },
];

export const TASK_TYPES: { value: TaskType; label: string; color: string }[] = [
  { value: 'task', label: 'Task', color: '#1976d2' },
  { value: 'bug', label: 'Bug', color: '#d32f2f' },
  { value: 'incident', label: 'Incident', color: '#f44336' },
  { value: 'feature', label: 'Feature', color: '#9c27b0' },
  { value: 'improvement', label: 'Improvement', color: '#00bcd4' },
  { value: 'other', label: 'Other', color: '#9e9e9e' },
];

export interface CreateTaskPayload {
  title: string;
  description: string;
  assignee: string;
  projectId?: string;
  projectName?: string;
  status: TaskStatus;
  priority: TaskPriority;
  taskType: TaskType;
  labels: string[];
  dueDate: string;
  images: string[];
  links: { title: string; url: string }[];
  agents: TaskAgent[];
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {
  id: string;
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  authorEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddCommentPayload {
  text: string;
  author: string;
  authorEmail: string;
}

export type ResourceRole =
  | 'AI Developer'
  | 'Frontend Developer'
  | 'Backend Developer'
  | 'Full Stack Developer'
  | 'Tester'
  | 'QA Engineer'
  | 'Product Owner'
  | 'Project Manager'
  | 'Designer'
  | 'UI/UX Designer'
  | 'DevOps Engineer'
  | 'Data Analyst'
  | 'Business Analyst'
  | 'Scrum Master'
  | 'Tech Lead'
  | 'HR Manager'
  | 'HR Executive'
  | 'Admin'
  | 'Finance'
  | 'Marketing'
  | 'Sales'
  | 'Support'
  | 'Operations'
  | 'Legal'
  | 'Other';

export const RESOURCE_ROLES: ResourceRole[] = [
  'AI Developer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Tester',
  'QA Engineer',
  'Product Owner',
  'Project Manager',
  'Designer',
  'UI/UX Designer',
  'DevOps Engineer',
  'Data Analyst',
  'Business Analyst',
  'Scrum Master',
  'Tech Lead',
  'HR Manager',
  'HR Executive',
  'Admin',
  'Finance',
  'Marketing',
  'Sales',
  'Support',
  'Operations',
  'Legal',
  'Other',
];

export interface Developer {
  id: string;
  name: string;
  email: string;
  proficient: ResourceRole;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  urlTest?: string;
  urlStage?: string;
  urlProd?: string;
  repoUrl?: string;
  docsUrl?: string;
  ownerId: string;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectPayload {
  name: string;
  description: string;
  urlTest?: string;
  urlStage?: string;
  urlProd?: string;
  repoUrl?: string;
  docsUrl?: string;
  ownerId: string;
  ownerName: string;
}

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromEmail: string;
  fromName: string;
}

export interface ImageKitConfig {
  publicKey: string;
  privateKey: string;
  urlEndpoint: string;
}

export interface OpenAIConfig {
  apiKey: string;
  openAIModel: string;
  maxTokens: number;
}

export interface Settings {
  smtp: SMTPConfig;
  imageKit: ImageKitConfig;
  openAI: OpenAIConfig;
}

export interface ParsedTask {
  title: string;
  description: string;
  priority: TaskPriority;
  labels: string[];
  estimatedDueDate: number;
}

// ============ Agent Component Types ============

export type AgentComponentCategory =
  | 'event'
  | 'data-scrapper'
  | 'communication'
  | 'ai'
  | 'action'
  | 'logic'
  | 'custom';

export interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'select' | 'number' | 'boolean' | 'textarea';
  required: boolean;
  placeholder: string;
  options: { label: string; value: string }[];
  defaultValue: string;
}

export interface AgentComponent {
  id: string;
  name: string;
  category: AgentComponentCategory;
  description: string;
  icon: string;
  color: string;
  configSchema: ConfigField[];
  defaultCode: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentComponentPayload {
  name: string;
  category: AgentComponentCategory;
  description: string;
  icon: string;
  color: string;
  configSchema: ConfigField[];
  defaultCode: string;
  status: 'active' | 'inactive';
}

// ============ Agent Workflow Types ============

export interface WorkflowNode {
  nodeId: string;
  componentId: string;
  componentName: string;
  category: string;
  color: string;
  position: { x: number; y: number };
  config: Record<string, string>;
}

export interface WorkflowEdge {
  edgeId: string;
  source: string;
  target: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  role: string;
  status: 'active' | 'inactive' | 'draft';
  capabilities: string[];
  configuration: Record<string, unknown>;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentPayload {
  name: string;
  description: string;
  role: string;
  status: 'active' | 'inactive' | 'draft';
  capabilities: string[];
  configuration: Record<string, unknown>;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface UpdateAgentPayload extends Partial<CreateAgentPayload> {
  id: string;
}

// ============ Build Agent Assistant Types ============

export interface MissingComponent {
  name: string;
  category: string;
  description: string;
  suggestedPrompt: string;
}

export interface SuggestedWorkflow {
  nodes: {
    componentName: string;
    category: string;
    position: { x: number; y: number };
    config: Record<string, string>;
  }[];
  edges: { sourceIndex: number; targetIndex: number }[];
}

export interface BuildAgentResponse {
  message: string;
  missingComponents: MissingComponent[];
  workflow: SuggestedWorkflow | null;
}
