import { useState, useEffect, useCallback } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { Task, CreateTaskPayload, Developer } from '../../types';
import { taskService, developerService, uploadService } from '../../services';

const initialFormData = (): CreateTaskPayload => ({
  title: '',
  description: '',
  assignee: '',
  status: 'todo',
  priority: 'P3',
  taskType: 'task',
  labels: [],
  dueDate: dayjs().add(7, 'day').toISOString(),
  images: [],
  links: [],
  agents: [],
});

export const useCreateTaskDialog = (
  open: boolean,
  task: Task | null | undefined,
  onClose: (refresh?: boolean) => void
) => {
  const [formData, setFormData] = useState<CreateTaskPayload>(initialFormData());
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [labelInput, setLabelInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [dueDate, setDueDate] = useState<Dayjs | null>(dayjs().add(7, 'day'));

  useEffect(() => {
    if (open) {
      setLoadingData(true);
      developerService
        .getAll()
        .then(setDevelopers)
        .catch(console.error)
        .finally(() => setLoadingData(false));
      if (task) {
        setFormData({
          title: task.title,
          description: task.description,
          assignee: task.assignee,
          status: task.status,
          priority: task.priority,
          taskType: task.taskType || 'task',
          labels: task.labels || [],
          dueDate: task.dueDate,
          images: task.images || [],
          links: task.links || [],
          agents: task.agents || [],
        });
        setDueDate(dayjs(task.dueDate));
      } else {
        setFormData(initialFormData());
        setDueDate(dayjs().add(7, 'day'));
      }
    }
  }, [open, task]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        dueDate: dueDate?.toISOString() || dayjs().add(7, 'day').toISOString(),
      };
      if (task) {
        await taskService.update(task.id, payload);
      } else {
        await taskService.create(payload);
      }
      onClose(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }, [formData, dueDate, task, onClose]);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files?.length) return;
      setUploading(true);
      try {
        const results = await Promise.all(
          Array.from(files).map((f) => uploadService.uploadImage(f))
        );
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...results.map((r) => r.url)],
        }));
      } catch (err) {
        console.error(err);
      } finally {
        setUploading(false);
      }
    },
    []
  );

  const toggleLabel = useCallback((label: string) => {
    setFormData((prev) => ({
      ...prev,
      labels: prev.labels.includes(label)
        ? prev.labels.filter((l) => l !== label)
        : [...prev.labels, label],
    }));
  }, []);

  return {
    formData,
    setFormData,
    developers,
    labelInput,
    setLabelInput,
    saving,
    uploading,
    loadingData,
    dueDate,
    setDueDate,
    handleSave,
    handleImageUpload,
    toggleLabel,
  };
};
