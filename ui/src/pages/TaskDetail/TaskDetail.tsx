import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  ImageList,
  ImageListItem,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { Task, TASK_PRIORITIES, TASK_TYPES } from '../../types';
import { taskService } from '../../services';
import CreateTaskDialog from '../../components/CreateTaskDialog/CreateTaskDialog';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog/DeleteConfirmDialog';
import TaskInfoCard from './TaskInfoCard';
import TaskComments from '../../components/TaskComments';
import TaskHistoryDrawer from '../../components/TaskHistoryDrawer';
import PageHeader from '../../components/PageHeader';
import QuillEditor from '../../components/QuillEditor/QuillEditor';
import './TaskDetail.scss';

const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'success'> = {
  todo: 'default',
  'in-progress': 'primary',
  'in-review': 'secondary',
  done: 'success',
};

const formatStatus = (status: string) =>
  status.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase());

// Generate PDF-like HTML and print
const downloadAsPDF = (task: Task) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${task.taskId} - ${task.title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
        .header { border-bottom: 2px solid #1976d2; padding-bottom: 20px; margin-bottom: 20px; }
        .task-id { color: #666; font-size: 14px; }
        .title { font-size: 24px; margin: 10px 0; }
        .badges { display: flex; gap: 10px; margin-top: 10px; }
        .badge { padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: bold; }
        .status { background: #e3f2fd; color: #1976d2; }
        .priority-high { background: #ffebee; color: #d32f2f; }
        .priority-medium { background: #fff3e0; color: #f57c00; }
        .priority-low { background: #e8f5e9; color: #388e3c; }
        .section { margin: 20px 0; }
        .section-title { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 10px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .info-item { }
        .info-label { font-size: 12px; color: #666; }
        .info-value { font-size: 14px; color: #333; }
        .description { background: #f5f5f5; padding: 15px; border-radius: 8px; white-space: pre-wrap; }
        .labels { display: flex; gap: 8px; flex-wrap: wrap; }
        .label { background: #e0e0e0; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="task-id">${task.taskId}</div>
        <div class="title">${task.title}</div>
        <div class="badges">
          <span class="badge status">${formatStatus(task.status)}</span>
          <span class="badge priority-${task.priority}">${task.priority.toUpperCase()}</span>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Details</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Assignee</div>
            <div class="info-value">${task.assignee}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Due Date</div>
            <div class="info-value">${new Date(task.dueDate).toLocaleDateString()}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Project</div>
            <div class="info-value">${task.projectName || 'None'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Created</div>
            <div class="info-value">${new Date(task.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      ${
        task.labels.length > 0
          ? `
      <div class="section">
        <div class="section-title">Labels</div>
        <div class="labels">
          ${task.labels.map((label) => `<span class="label">${label}</span>`).join('')}
        </div>
      </div>
      `
          : ''
      }

      <div class="section">
        <div class="section-title">Description</div>
        <div class="description">${task.description || 'No description provided.'}</div>
      </div>

      <div class="footer">
        Generated from Workboard on ${new Date().toLocaleString()}
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.print();
  };
};

const TaskDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);

  // Description editing state
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialDescriptionRef = useRef<string>('');

  const fetchTask = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const fetchedTask = await taskService.getById(id);
      setTask(fetchedTask);
      setDescription(fetchedTask.description || '');
      initialDescriptionRef.current = fetchedTask.description || '';
    } catch {
      setError('Failed to fetch task details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  // Auto-save description with debounce
  const handleDescriptionChange = useCallback(
    (value: string) => {
      setDescription(value);

      // Clear previous timeout
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Don't save if unchanged
      if (value === initialDescriptionRef.current) return;

      // Debounce save
      debounceRef.current = setTimeout(async () => {
        if (!task) return;
        setIsSaving(true);
        try {
          await taskService.update(task.id, { description: value });
          initialDescriptionRef.current = value;
        } catch (err) {
          console.error('Failed to auto-save description:', err);
        } finally {
          setIsSaving(false);
        }
      }, 1000); // 1 second debounce
    },
    [task]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleDeleteConfirm = async () => {
    if (task) {
      try {
        await taskService.delete(task.id);
        navigate('/tasks');
      } catch {
        setError('Failed to delete task.');
      }
    }
    setDeleteDialogOpen(false);
  };

  if (loading)
    return (
      <Box className="task-detail__loading">
        <CircularProgress />
      </Box>
    );

  if (error || !task) {
    return (
      <Box className="task-detail">
        <Alert severity="error">{error || 'Task not found.'}</Alert>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/tasks')}
          sx={{ mt: 2 }}
        >
          Back to Tasks
        </Button>
      </Box>
    );
  }

  return (
    <Box className="task-detail">
      <PageHeader
        title={task.taskId}
        breadcrumbs={[{ label: 'Tasks', path: '/tasks' }, { label: task.taskId }]}
        action={
          <Box className="task-detail__actions">
            <Button
              variant="outlined"
              startIcon={<HistoryIcon />}
              onClick={() => setHistoryDrawerOpen(true)}
            >
              History
            </Button>
            <Button
              variant="outlined"
              startIcon={<PdfIcon />}
              onClick={() => downloadAsPDF(task)}
            >
              Download PDF
            </Button>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setEditDialogOpen(true)}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete
            </Button>
          </Box>
        }
      />

      <Paper className="task-detail__content">
        <Box className="task-detail__title-section">
          <Typography variant="caption" className="task-detail__id">
            {task.taskId}
          </Typography>
          <Typography variant="h4" className="task-detail__title">
            {task.title}
          </Typography>
          <Box className="task-detail__badges">
            <Chip label={formatStatus(task.status)} color={statusColors[task.status]} />
            {(() => {
              const priority = TASK_PRIORITIES.find((p) => p.value === task.priority);
              return (
                <Chip
                  label={priority?.label || task.priority}
                  sx={{ bgcolor: priority?.color, color: 'white' }}
                />
              );
            })()}
            {(() => {
              const taskType = TASK_TYPES.find((t) => t.value === task.taskType);
              return taskType ? (
                <Chip
                  label={taskType.label}
                  sx={{ bgcolor: taskType.color, color: 'white' }}
                  size="small"
                />
              ) : null;
            })()}
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h6">Description</Typography>
              {isSaving && (
                <Typography variant="caption" color="text.secondary">
                  Saving...
                </Typography>
              )}
            </Box>
            <QuillEditor
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Add a description..."
              minHeight={200}
            />
            {task.images && task.images.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Attachments
                </Typography>
                <ImageList cols={3} gap={8}>
                  {task.images.map((img, index) => (
                    <ImageListItem key={index}>
                      <img
                        src={img}
                        alt={`Attachment ${index + 1}`}
                        loading="lazy"
                        className="task-detail__image"
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              </Box>
            )}

            {/* Comments Section */}
            <Box sx={{ mt: 4 }}>
              <TaskComments taskId={task.id} />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <TaskInfoCard task={task} />
          </Grid>
        </Grid>
      </Paper>

      <CreateTaskDialog
        open={editDialogOpen}
        onClose={(r) => {
          setEditDialogOpen(false);
          if (r) fetchTask();
        }}
        task={task}
      />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        title="Delete Task"
        message={`Are you sure you want to delete task "${task.title}"?`}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
      <TaskHistoryDrawer
        open={historyDrawerOpen}
        onClose={() => setHistoryDrawerOpen(false)}
        taskId={task.id}
      />
    </Box>
  );
};

export default TaskDetail;
