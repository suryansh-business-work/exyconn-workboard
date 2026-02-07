import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkflowNode {
  nodeId: string;
  componentId: string;
  componentName: string;
  category: string;
  color: string;
  position: { x: number; y: number };
  config: Record<string, string>;
}

export interface IWorkflowEdge {
  edgeId: string;
  source: string;
  target: string;
}

export interface IAgent extends Document {
  name: string;
  description: string;
  role: string;
  status: 'active' | 'inactive' | 'draft';
  capabilities: string[];
  configuration: Record<string, unknown>;
  nodes: IWorkflowNode[];
  edges: IWorkflowEdge[];
  createdAt: Date;
  updatedAt: Date;
}

const WorkflowNodeSchema = new Schema<IWorkflowNode>(
  {
    nodeId: { type: String, required: true },
    componentId: { type: String, required: true },
    componentName: { type: String, required: true },
    category: { type: String, required: true },
    color: { type: String, default: '#1976d2' },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
    },
    config: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const WorkflowEdgeSchema = new Schema<IWorkflowEdge>(
  {
    edgeId: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
  },
  { _id: false }
);

const AgentSchema = new Schema<IAgent>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    role: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['active', 'inactive', 'draft'],
      default: 'draft',
    },
    capabilities: { type: [String], default: [] },
    configuration: { type: Schema.Types.Mixed, default: {} },
    nodes: { type: [WorkflowNodeSchema], default: [] },
    edges: { type: [WorkflowEdgeSchema], default: [] },
  },
  { timestamps: true }
);

export const Agent = mongoose.model<IAgent>('Agent', AgentSchema);
