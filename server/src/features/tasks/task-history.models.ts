import mongoose, { Schema, Document } from 'mongoose';

export interface ITaskHistory extends Document {
  taskId: string;
  action: 'created' | 'updated' | 'deleted' | 'status_changed';
  changes: Record<string, { from: unknown; to: unknown }>;
  performedBy: string;
  performedAt: Date;
  emailSent: boolean;
  emailTo?: string;
}

const TaskHistorySchema = new Schema<ITaskHistory>(
  {
    taskId: { type: String, required: true, index: true },
    action: {
      type: String,
      enum: ['created', 'updated', 'deleted', 'status_changed'],
      required: true,
    },
    changes: { type: Schema.Types.Mixed, default: {} },
    performedBy: { type: String, default: 'System' },
    performedAt: { type: Date, default: Date.now },
    emailSent: { type: Boolean, default: false },
    emailTo: { type: String },
  },
  { timestamps: false }
);

export const TaskHistory = mongoose.model<ITaskHistory>('TaskHistory', TaskHistorySchema);
