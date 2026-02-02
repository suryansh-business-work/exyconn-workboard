import mongoose, { Schema, Document } from 'mongoose';

// Counter for task IDs
export interface ICounter extends Document {
  name: string;
  value: number;
}

const CounterSchema = new Schema<ICounter>({
  name: { type: String, required: true, unique: true },
  value: { type: Number, default: 0 },
});

export const Counter = mongoose.model<ICounter>('Counter', CounterSchema);

// SMTP Config
export interface ISMTPConfig extends Document {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromEmail: string;
  fromName: string;
}

const SMTPConfigSchema = new Schema<ISMTPConfig>({
  host: { type: String, default: '' },
  port: { type: Number, default: 587 },
  secure: { type: Boolean, default: false },
  user: { type: String, default: '' },
  password: { type: String, default: '' },
  fromEmail: { type: String, default: '' },
  fromName: { type: String, default: 'Workboard' },
});

export const SMTPConfig = mongoose.model<ISMTPConfig>('SMTPConfig', SMTPConfigSchema);

// ImageKit Config
export interface IImageKitConfig extends Document {
  publicKey: string;
  privateKey: string;
  urlEndpoint: string;
}

const ImageKitConfigSchema = new Schema<IImageKitConfig>({
  publicKey: { type: String, default: '' },
  privateKey: { type: String, default: '' },
  urlEndpoint: { type: String, default: '' },
});

export const ImageKitConfig = mongoose.model<IImageKitConfig>(
  'ImageKitConfig',
  ImageKitConfigSchema
);

// OpenAI Config
export interface IOpenAIConfig {
  apiKey: string;
  openAIModel: string;
  maxTokens: number;
}

const OpenAIConfigSchema = new Schema<IOpenAIConfig>({
  apiKey: { type: String, default: '' },
  openAIModel: { type: String, default: 'gpt-4o-mini' },
  maxTokens: { type: Number, default: 1000 },
});

export const OpenAIConfig = mongoose.model<IOpenAIConfig>(
  'OpenAIConfig',
  OpenAIConfigSchema
);

// Daily Report Config
export interface IDailyReportConfig extends Document {
  enabled: boolean;
  recipientEmail: string;
}

const DailyReportConfigSchema = new Schema<IDailyReportConfig>({
  enabled: { type: Boolean, default: true },
  recipientEmail: { type: String, default: 'Suryansh@exyconn.com' },
});

export const DailyReportConfig = mongoose.model<IDailyReportConfig>(
  'DailyReportConfig',
  DailyReportConfigSchema
);
