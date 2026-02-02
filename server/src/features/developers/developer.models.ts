import mongoose, { Schema, Document } from 'mongoose';

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
  | 'Other';

export interface IDeveloper extends Document {
  name: string;
  email: string;
  proficient: ResourceRole;
  createdAt: Date;
  updatedAt: Date;
}

const DeveloperSchema = new Schema<IDeveloper>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    proficient: { type: String, required: true, default: 'AI Developer' },
  },
  { timestamps: true }
);

export const Developer = mongoose.model<IDeveloper>('Developer', DeveloperSchema);
