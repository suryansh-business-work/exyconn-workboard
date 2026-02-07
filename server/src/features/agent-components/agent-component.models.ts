import mongoose, { Schema, Document } from 'mongoose';

export interface IConfigField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'select' | 'number' | 'boolean' | 'textarea';
  required: boolean;
  placeholder: string;
  options: { label: string; value: string }[];
  defaultValue: string;
}

export type AgentComponentCategory =
  | 'event'
  | 'data-scrapper'
  | 'communication'
  | 'ai'
  | 'action'
  | 'logic'
  | 'custom';

export interface IAgentComponent extends Document {
  name: string;
  category: AgentComponentCategory;
  description: string;
  icon: string;
  color: string;
  configSchema: IConfigField[];
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const ConfigFieldSchema = new Schema<IConfigField>(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: ['text', 'password', 'select', 'number', 'boolean', 'textarea'],
      default: 'text',
    },
    required: { type: Boolean, default: false },
    placeholder: { type: String, default: '' },
    options: {
      type: [{ label: { type: String }, value: { type: String } }],
      default: [],
    },
    defaultValue: { type: String, default: '' },
  },
  { _id: false }
);

const AgentComponentSchema = new Schema<IAgentComponent>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    category: {
      type: String,
      enum: ['event', 'data-scrapper', 'communication', 'ai', 'action', 'logic', 'custom'],
      required: true,
    },
    description: { type: String, default: '' },
    icon: { type: String, default: 'Extension' },
    color: { type: String, default: '#1976d2' },
    configSchema: { type: [ConfigFieldSchema], default: [] },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export const AgentComponent = mongoose.model<IAgentComponent>(
  'AgentComponent',
  AgentComponentSchema
);
