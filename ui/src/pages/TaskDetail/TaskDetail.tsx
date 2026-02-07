import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, Alert } from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { Task } from '../../types';
import { taskService } from '../../services';
import CreateTaskDialog from '../../components/CreateTaskDialog/CreateTaskDialog';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog/DeleteConfirmDialog';
import TaskHistoryDrawer from '../../components/TaskHistoryDrawer';
import PageHeader from '../../components/PageHeader';
import TaskDetailBody from './TaskDetailBody';
import { downloadAsPDF } from './taskPdfExport';
import './TaskDetail.scss';

const TaskDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);

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

  const handleDescriptionChange = useCallback(
    (value: string) => {
      setDescription(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (value === initialDescriptionRef.current) return;
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
      }, 1000);
    },
    [task]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
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

      <TaskDetailBody
        task={task}
        description={description}
        isSaving={isSaving}
        onDescriptionChange={handleDescriptionChange}
      />

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
