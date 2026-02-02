import { useState, useEffect, useRef, useCallback } from 'react';
import { AIChatMessage, MessageHistory } from './types';

interface UseAIChatOptions<TMetadata> {
  onSendMessage: (
    message: string,
    history: MessageHistory[]
  ) => Promise<{ content: string; metadata?: TMetadata }>;
  onError?: (error: unknown) => string;
}

export function useAIChat<TMetadata = unknown>(options: UseAIChatOptions<TMetadata>) {
  const { onSendMessage, onError } = options;
  const [messages, setMessages] = useState<AIChatMessage<TMetadata>[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const send = useCallback(
    async (customMessage?: string) => {
      const messageToSend = customMessage || input.trim();
      if (!messageToSend) return;

      const userMessage: AIChatMessage<TMetadata> = {
        id: Date.now().toString(),
        type: 'user',
        content: messageToSend,
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInput('');
      setLoading(true);

      try {
        const history: MessageHistory[] = updatedMessages.map((m) => ({
          role: m.type === 'user' ? 'user' : 'assistant',
          content: m.content,
        }));

        const result = await onSendMessage(messageToSend, history);

        const assistantMessage: AIChatMessage<TMetadata> = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: result.content,
          metadata: result.metadata,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        const errorContent = onError
          ? onError(error)
          : 'Sorry, an error occurred. Please try again.';

        const errorMessage: AIChatMessage<TMetadata> = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: errorContent,
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setLoading(false);
      }
    },
    [input, messages, onSendMessage, onError]
  );

  const reset = useCallback(() => {
    setMessages([]);
    setInput('');
    setLoading(false);
  }, []);

  return {
    messages,
    input,
    setInput,
    loading,
    send,
    reset,
    containerRef,
  };
}
