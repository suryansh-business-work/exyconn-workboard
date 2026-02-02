import { ReactNode } from 'react';

export interface AIChatMessage<TMetadata = unknown> {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  metadata?: TMetadata;
}

export interface QuickAction {
  label: string;
  icon: ReactNode;
  prompt: string;
}

export interface MessageHistory {
  role: 'user' | 'assistant';
  content: string;
}
