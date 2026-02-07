import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import { Task, CreateTaskPayload, Developer } from '../../types';
import { taskService, developerService, uploadService } from '../../services';
import TaskFormFields from './TaskFormFields';
import LabelSelector from './LabelSelector';
import ImageUploader from './ImageUploader';
import TaskAgentSelector from '../TaskAgentSelector/TaskAgentSelector';
import './CreateTaskDialog.scss';

interface CreateTaskDialogProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  task?: Task | null;
}

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

const CreateTaskDialog = ({ open, onClose, task }: CreateTaskDialogProps) => {
  const [formData, setFormData] = useState<CreateTaskPayload>(initialFormData());
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [labelInput, setLabelInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dueDate, setDueDate] = useState<Dayjs | null>(dayjs().add(7, 'day'));

  useEffect(() => {
    if (open) {
      developerService.getAll().then(setDevelopers).catch(console.error);
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

  const handleSave = async () => {
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
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const results = await Promise.all(
        Array.from(files).map((f) => uploadService.uploadImage(f))
      );
      setFormData({
        ...formData,
        images: [...formData.images, ...results.map((r) => r.url)],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const toggleLabel = (label: string) => {
    setFormData({
      ...formData,
      labels: formData.labels.includes(label)
        ? formData.labels.filter((l) => l !== label)
        : [...formData.labels, label],
    });
  };

  return (
    <Dialog open={open} onClose={() => onClose()} maxWidth="md" fullWidth>
      <DialogTitle>
        {task ? 'Edit Task' : 'Create New Task'}
        <IconButton
          onClick={() => onClose()}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <TaskFormFields
            title={formData.title}
            description={formData.description}
            assignee={formData.assignee}
            status={formData.status}
            priority={formData.priority}
            dueDate={dueDate}
            developers={developers}
            onTitleChange={(v) => setFormData({ ...formData, title: v })}
            onDescriptionChange={(v) => setFormData({ ...formData, description: v })}
            onAssigneeChange={(v) => setFormData({ ...formData, assignee: v })}
            onStatusChange={(v) => setFormData({ ...formData, status: v })}
            onPriorityChange={(v) => setFormData({ ...formData, priority: v })}
            onDueDateChange={setDueDate}
          />
          <Grid item xs={12}>
            <LabelSelector
              labels={formData.labels}
              labelInput={labelInput}
              onLabelInputChange={setLabelInput}
              onAddLabel={() => {
                if (labelInput && !formData.labels.includes(labelInput)) {
                  setFormData({ ...formData, labels: [...formData.labels, labelInput] });
                  setLabelInput('');
                }
              }}
              onToggleLabel={toggleLabel}
              onRemoveLabel={(l) =>
                setFormData({
                  ...formData,
                  labels: formData.labels.filter((x) => x !== l),
                })
              }
            />
          </Grid>
          <Grid item xs={12}>
            <ImageUploader
              images={formData.images}
              uploading={uploading}
              onUpload={handleImageUpload}
              onRemove={(i) => {
                const imgs = [...formData.images];
                imgs.splice(i, 1);
                setFormData({ ...formData, images: imgs });
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TaskAgentSelector
              selectedAgents={formData.agents}
              onChange={(agents) => setFormData({ ...formData, agents })}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || !formData.title}
        >
          {saving ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTaskDialog;
