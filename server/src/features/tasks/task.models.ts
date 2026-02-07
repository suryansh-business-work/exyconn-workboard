import mongoose, { Schema, Document, Types } from 'mongoose';

// Comment subdocument interface
export interface IComment {
  _id: Types.ObjectId;
  text: string;
  author: string;
  authorEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

// History entry interface
export interface IHistoryEntry {
  _id: Types.ObjectId;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  author: string;
  authorEmail: string;
  createdAt: Date;
}

export interface ITaskAgent {
  agentId: string;
  agentName: string;
}

export interface ITask extends Document {
  taskId: string;
  title: string;
  description: string;
  assignee: string;
  projectId?: string;
  projectName?: string;
  status: 'todo' | 'in-progress' | 'in-review' | 'done';
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  taskType: 'task' | 'bug' | 'incident' | 'feature' | 'improvement' | 'other';
  labels: string[];
  dueDate: Date;
  images: string[];
  links: { title: string; url: string }[];
  agents: ITaskAgent[];
  comments: IComment[];
  history: IHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    text: { type: String, required: true },
    author: { type: String, required: true },
    authorEmail: { type: String, required: true },
  },
  { timestamps: true }
);

const HistorySchema = new Schema<IHistoryEntry>(
  {
    action: { type: String, required: true },
    field: { type: String },
    oldValue: { type: String },
    newValue: { type: String },
    author: { type: String, required: true },
    authorEmail: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const TaskSchema = new Schema<ITask>(
  {
    taskId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    assignee: { type: String, required: true },
    projectId: { type: String, default: '' },
    projectName: { type: String, default: '' },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'in-review', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['P1', 'P2', 'P3', 'P4'],
      default: 'P3',
    },
    taskType: {
      type: String,
      enum: ['task', 'bug', 'incident', 'feature', 'improvement', 'other'],
      default: 'task',
    },
    labels: { type: [String], default: [] },
    dueDate: { type: Date, required: true },
    images: { type: [String], default: [] },
    links: {
      type: [
        {
          title: { type: String, required: true },
          url: { type: String, required: true },
        },
      ],
      default: [],
    },
    agents: {
      type: [
        {
          agentId: { type: String, required: true },
          agentName: { type: String, required: true },
        },
      ],
      default: [],
    },
    comments: { type: [CommentSchema], default: [] },
    history: { type: [HistorySchema], default: [] },
  },
  { timestamps: true }
);

export const Task = mongoose.model<ITask>('Task', TaskSchema);
