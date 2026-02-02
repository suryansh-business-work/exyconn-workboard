import { useState, useCallback, useEffect, useRef } from 'react';
import { settingsService } from '../../services';
import { ParsedTask } from '../../types';
import { ChatMessage } from './types';

export interface UseTaskChatReturn {
  chatInput: string;
  chatMessages: ChatMessage[];
  parsing: boolean;
  setChatInput: (value: string) => void;
  handleParseChat: () => Promise<void>;
  handleApplyParsedTask: (parsed: ParsedTask) => void;
  pendingParsedTask: ParsedTask | null;
  clearPendingParsedTask: () => void;
  chatContainerRef: React.RefObject<HTMLDivElement | null>;
  resetChat: () => void;
}

export const useTaskChat = (): UseTaskChatReturn => {
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [parsing, setParsing] = useState(false);
  const [pendingParsedTask, setPendingParsedTask] = useState<ParsedTask | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Reset chat state
  const resetChat = useCallback(() => {
    setChatInput('');
    setChatMessages([]);
    setPendingParsedTask(null);
  }, []);

  // AI Chat parsing
  const handleParseChat = useCallback(async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: chatInput,
    };
    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    const messageToSend = chatInput;
    setChatInput('');
    setParsing(true);

    try {
      const history = updatedMessages.map((m) => ({
        role: m.type === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));
      const parsed: ParsedTask = await settingsService.parseTaskFromChat(
        messageToSend,
        history
      );

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `I've parsed your request:\n• Title: ${parsed.title}\n• Priority: ${parsed.priority}\n• Labels: ${parsed.labels?.join(', ') || 'None'}\n• Due in: ${parsed.estimatedDueDate} days`,
        parsedTask: parsed,
      };
      setChatMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      console.error('Parse error:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to parse. Configure OpenAI in Settings.';
      const errorAssistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Error: ${errorMessage}`,
      };
      setChatMessages((prev) => [...prev, errorAssistantMessage]);
    } finally {
      setParsing(false);
    }
  }, [chatInput, chatMessages]);

  // Apply parsed task
  const handleApplyParsedTask = useCallback((parsed: ParsedTask) => {
    setPendingParsedTask(parsed);
  }, []);

  // Clear pending parsed task
  const clearPendingParsedTask = useCallback(() => {
    setPendingParsedTask(null);
  }, []);

  return {
    chatInput,
    chatMessages,
    parsing,
    setChatInput,
    handleParseChat,
    handleApplyParsedTask,
    pendingParsedTask,
    clearPendingParsedTask,
    chatContainerRef,
    resetChat,
  };
};

export default useTaskChat;
