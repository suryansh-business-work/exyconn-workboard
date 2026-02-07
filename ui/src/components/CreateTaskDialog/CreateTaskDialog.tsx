import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  IconButton,
  CircularProgress,
  Box,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Task } from '../../types';
import TaskFormFields from './TaskFormFields';
import LabelSelector from './LabelSelector';
import ImageUploader from './ImageUploader';
import TaskAgentSelector from '../TaskAgentSelector/TaskAgentSelector';
import { useCreateTaskDialog } from './useCreateTaskDialog';
import './CreateTaskDialog.scss';

interface CreateTaskDialogProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  task?: Task | null;
}

const CreateTaskDialog = ({ open, onClose, task }: CreateTaskDialogProps) => {
  const {
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
  } = useCreateTaskDialog(open, task, onClose);

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
        {loadingData ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
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
                    setFormData({
                      ...formData,
                      labels: [...formData.labels, labelInput],
                    });
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
        )}
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
