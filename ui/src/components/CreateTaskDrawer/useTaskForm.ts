import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { FormikProps } from 'formik';
import dayjs from 'dayjs';
import { Developer, Project, ParsedTask, TaskPriority } from '../../types';
import {
  taskService,
  developerService,
  projectService,
  settingsService,
} from '../../services';
import { FormValues, Task } from './types';

interface UseTaskFormProps {
  open: boolean;
  task?: Task | null;
  onClose: (refresh?: boolean) => void;
  pendingParsedTask: ParsedTask | null;
  clearPendingParsedTask: () => void;
}

export interface UseTaskFormReturn {
  developers: Developer[];
  projects: Project[];
  formikRef: React.MutableRefObject<FormikProps<FormValues> | null>;
  initialValues: FormValues;
  rewriting: boolean;
  handleSubmit: (
    values: FormValues,
    { setSubmitting }: { setSubmitting: (v: boolean) => void }
  ) => Promise<void>;
  handleRewriteDescription: (
    description: string,
    title: string,
    setFieldValue: (field: string, value: string) => void
  ) => Promise<void>;
  selectedAssignee: (assigneeName: string) => Developer | null;
  isEditMode: boolean;
}

export const useTaskForm = ({
  open,
  task,
  onClose,
  pendingParsedTask,
  clearPendingParsedTask,
}: UseTaskFormProps): UseTaskFormReturn => {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [rewriting, setRewriting] = useState(false);

  const formikRef = useRef<FormikProps<FormValues>>(null);
  const isEditMode = !!task;

  // Load developers and projects when drawer opens
  useEffect(() => {
    if (open) {
      Promise.all([developerService.getAll(), projectService.getAll()])
        .then(([devs, projs]) => {
          setDevelopers(devs);
          setProjects(projs);
        })
        .catch(console.error);
    }
  }, [open]);

  // Apply pending parsed task to form
  useEffect(() => {
    if (!pendingParsedTask) return;

    const applyParsedTask = () => {
      const formik = formikRef.current;
      if (!formik) {
        setTimeout(applyParsedTask, 50);
        return;
      }

      if (pendingParsedTask.title) {
        formik.setFieldValue('title', pendingParsedTask.title);
      }
      if (pendingParsedTask.description) {
        formik.setFieldValue('description', pendingParsedTask.description);
      }
      if (pendingParsedTask.priority) {
        formik.setFieldValue('priority', pendingParsedTask.priority as TaskPriority);
      }
      if (pendingParsedTask.labels && pendingParsedTask.labels.length > 0) {
        formik.setFieldValue('labels', pendingParsedTask.labels);
      }
      if (pendingParsedTask.estimatedDueDate) {
        formik.setFieldValue(
          'dueDate',
          dayjs().add(pendingParsedTask.estimatedDueDate, 'day')
        );
      }

      clearPendingParsedTask();
    };

    applyParsedTask();
  }, [pendingParsedTask, clearPendingParsedTask]);

  // Initial form values
  const initialValues: FormValues = useMemo(
    () => ({
      title: task?.title || '',
      description: task?.description || '',
      assignee: task?.assignee || '',
      projectId: task?.projectId || '',
      projectName: task?.projectName || '',
      status: task?.status || 'todo',
      priority: task?.priority || 'P3',
      taskType: task?.taskType || 'task',
      dueDate: task?.dueDate ? dayjs(task.dueDate) : dayjs().add(7, 'day'),
      labels: task?.labels || [],
      images: task?.images || [],
      links: task?.links || [],
    }),
    [task]
  );

  // Form submission
  const handleSubmit = useCallback(
    async (
      values: FormValues,
      { setSubmitting }: { setSubmitting: (v: boolean) => void }
    ) => {
      try {
        const project = projects.find((p) => p.id === values.projectId);
        const payload = {
          ...values,
          projectName: project?.name || '',
          dueDate: values.dueDate.toISOString(),
        };
        if (task) {
          await taskService.update(task.id, payload);
        } else {
          await taskService.create(payload);
        }
        onClose(true);
      } catch (err) {
        console.error(err);
      } finally {
        setSubmitting(false);
      }
    },
    [projects, task, onClose]
  );

  // AI description rewrite
  const handleRewriteDescription = useCallback(
    async (
      description: string,
      title: string,
      setFieldValue: (field: string, value: string) => void
    ) => {
      if (!description.trim()) return;
      setRewriting(true);
      try {
        const result = await settingsService.rewriteWithAI(description, title);
        setFieldValue('description', result.rewrittenText);
      } catch (err) {
        console.error('Rewrite error:', err);
      } finally {
        setRewriting(false);
      }
    },
    []
  );

  // Get selected assignee
  const selectedAssignee = useCallback(
    (assigneeName: string) => developers.find((d) => d.name === assigneeName) || null,
    [developers]
  );

  return {
    developers,
    projects,
    formikRef,
    initialValues,
    rewriting,
    handleSubmit,
    handleRewriteDescription,
    selectedAssignee,
    isEditMode,
  };
};

export default useTaskForm;
