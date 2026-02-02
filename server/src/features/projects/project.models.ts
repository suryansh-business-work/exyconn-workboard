import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description: string;
  urlTest?: string;
  urlStage?: string;
  urlProd?: string;
  repoUrl?: string;
  docsUrl?: string;
  ownerId: string;
  ownerName: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    urlTest: { type: String, default: '' },
    urlStage: { type: String, default: '' },
    urlProd: { type: String, default: '' },
    repoUrl: { type: String, default: '' },
    docsUrl: { type: String, default: '' },
    ownerId: { type: String, required: true },
    ownerName: { type: String, required: true },
  },
  { timestamps: true }
);

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
