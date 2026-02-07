import { useEffect } from 'react';
import { useTaskChat } from './useTaskChat';
import { useTaskForm } from './useTaskForm';
import { Task } from './types';
export { validationSchema } from './validationSchema';

interface UseTaskDrawerProps {
  open: boolean;
  task?: Task | null;
  onClose: (refresh?: boolean) => void;
}

export const useTaskDrawer = ({ open, task, onClose }: UseTaskDrawerProps) => {
  // Chat hook
  const {
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
  } = useTaskChat();

  // Form hook
  const {
    developers,
    agents,
    projects,
    loading,
    formikRef,
    initialValues,
    rewriting,
    handleSubmit,
    handleRewriteDescription,
    selectedAssignee,
    isEditMode,
  } = useTaskForm({
    open,
    task,
    onClose,
    pendingParsedTask,
    clearPendingParsedTask,
  });

  // Reset chat when drawer opens
  useEffect(() => {
    if (open) {
      resetChat();
    }
  }, [open, resetChat]);

  return {
    // Data
    developers,
    agents,
    projects,
    loading,
    formikRef,
    initialValues,

    // Chat state
    chatInput,
    chatMessages,
    parsing,
    setChatInput,

    // UI state
    rewriting,

    // Handlers
    handleSubmit,
    handleParseChat,
    handleApplyParsedTask,
    handleRewriteDescription,

    // Helpers
    selectedAssignee,
    isEditMode,
    chatContainerRef,
  };
};

export default useTaskDrawer;
