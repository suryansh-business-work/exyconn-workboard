import mongoose, { Schema, Document } from 'mongoose';

export interface INodeResult {
  nodeId: string;
  nodeName: string;
  category: string;
  success: boolean;
  result?: unknown;
  error?: string;
  logs: string[];
  duration: number;
}

export interface IAgentExecution extends Document {
  taskId: string;
  agentId: string;
  agentName: string;
  status: 'running' | 'success' | 'error';
  nodeResults: INodeResult[];
  totalDuration: number;
  triggeredBy: string;
  startedAt: Date;
  completedAt?: Date;
}

const NodeResultSchema = new Schema<INodeResult>(
  {
    nodeId: { type: String, required: true },
    nodeName: { type: String, required: true },
    category: { type: String, default: '' },
    success: { type: Boolean, required: true },
    result: { type: Schema.Types.Mixed },
    error: { type: String },
    logs: { type: [String], default: [] },
    duration: { type: Number, default: 0 },
  },
  { _id: false }
);

const AgentExecutionSchema = new Schema<IAgentExecution>(
  {
    taskId: { type: String, required: true, index: true },
    agentId: { type: String, required: true },
    agentName: { type: String, required: true },
    status: {
      type: String,
      enum: ['running', 'success', 'error'],
      default: 'running',
    },
    nodeResults: { type: [NodeResultSchema], default: [] },
    totalDuration: { type: Number, default: 0 },
    triggeredBy: { type: String, default: 'System' },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: false }
);

AgentExecutionSchema.index({ taskId: 1, agentId: 1 });

export const AgentExecution = mongoose.model<IAgentExecution>(
  'AgentExecution',
  AgentExecutionSchema
);
