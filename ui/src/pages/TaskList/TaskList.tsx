import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  TablePagination,
  CircularProgress,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Chip,
  IconButton,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  SmartToy as AIIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { Task, TaskStatus, TaskPriority, TASK_PRIORITIES } from '../../types';
import { taskService } from '../../services';
import CreateTaskDrawer from '../../components/CreateTaskDrawer/CreateTaskDrawer';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog/DeleteConfirmDialog';
import TaskAIAssistant from '../../components/TaskAIAssistant';
import PageHeader from '../../components/PageHeader';
import TaskTable from './TaskTable';
import './TaskList.scss';

// Export tasks to CSV
const exportToCSV = (tasks: Task[]) => {
  const headers = [
    'Task ID',
    'Title',
    'Description',
    'Assignee',
    'Status',
    'Priority',
    'Due Date',
    'Labels',
    'Project',
  ];
  const rows = tasks.map((task) => [
    task.taskId,
    `"${task.title.replace(/"/g, '""')}"`,
    `"${task.description.replace(/"/g, '""')}"`,
    task.assignee,
    task.status,
    task.priority,
    new Date(task.dueDate).toLocaleDateString(),
    `"${task.labels.join(', ')}"`,
    task.projectName || '',
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `tasks_export_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

const TaskList = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [aiFilteredTaskIds, setAiFilteredTaskIds] = useState<string[] | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');

  // AI Search
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [aiSearchLoading, setAiSearchLoading] = useState(false);
  const [aiSearchExplanation, setAiSearchExplanation] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      setTasks(await taskService.getAll());
    } catch {
      setError('Failed to fetch tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // AI filter takes priority if active - compare against taskId (e.g., "TASK-001") not id
      if (aiFilteredTaskIds !== null) {
        return aiFilteredTaskIds.includes(task.taskId);
      }
      const matchesSearch =
        !searchQuery ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.taskId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignee.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !statusFilter || task.status === statusFilter;
      const matchesPriority = !priorityFilter || task.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, aiFilteredTaskIds]);

  const handleDeleteConfirm = async () => {
    if (selectedTask) {
      try {
        await taskService.delete(selectedTask.id);
        fetchTasks();
      } catch {
        setError('Failed to delete task.');
      }
    }
    setDeleteDialogOpen(false);
    setSelectedTask(null);
  };

  const handleDrawerClose = (refresh?: boolean) => {
    setDrawerOpen(false);
    setEditTask(null);
    if (refresh) fetchTasks();
  };

  const handleAiSearch = async () => {
    if (!aiSearchQuery.trim()) return;
    setAiSearchLoading(true);
    try {
      const result = await taskService.aiSearch(aiSearchQuery);
      setAiFilteredTaskIds(result.matchedIds);
      setAiSearchExplanation(result.explanation);
    } catch (err) {
      setError('AI search failed. Please check OpenAI configuration.');
    } finally {
      setAiSearchLoading(false);
    }
  };

  const clearAiSearch = () => {
    setAiFilteredTaskIds(null);
    setAiSearchExplanation(null);
    setAiSearchQuery('');
  };

  if (loading)
    return (
      <Box className="task-list__loading">
        <CircularProgress />
      </Box>
    );

  const paginatedTasks = filteredTasks.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box className="task-list">
      <PageHeader
        title="Tasks"
        breadcrumbs={[{ label: 'Tasks' }]}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => exportToCSV(filteredTasks)}
              disabled={filteredTasks.length === 0}
            >
              Export CSV
            </Button>
            <Button
              variant="outlined"
              startIcon={<AIIcon />}
              onClick={() => setAiAssistantOpen(true)}
              color="secondary"
            >
              AI Assistant
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditTask(null);
                setDrawerOpen(true);
              }}
            >
              Create Task
            </Button>
          </Box>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {aiFilteredTaskIds !== null && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={
            <Chip
              icon={<ClearIcon />}
              label="Clear AI Filter"
              onClick={clearAiSearch}
              onDelete={clearAiSearch}
              size="small"
            />
          }
        >
          <Typography variant="body2">
            Showing {aiFilteredTaskIds.length} tasks from AI Search
            {aiSearchExplanation && (
              <Typography
                variant="caption"
                display="block"
                sx={{ mt: 0.5, opacity: 0.9 }}
              >
                {aiSearchExplanation}
              </Typography>
            )}
          </Typography>
        </Alert>
      )}

      {/* Simplified AI Search */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Ask AI: 'overdue tasks' or 'high priority bugs'"
            value={aiSearchQuery}
            onChange={(e) => setAiSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && tasks.length > 0 && handleAiSearch()}
            disabled={aiSearchLoading || tasks.length === 0}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AIIcon color="primary" fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: aiSearchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setAiSearchQuery('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            onClick={handleAiSearch}
            disabled={aiSearchLoading || !aiSearchQuery.trim() || tasks.length === 0}
            sx={{ minWidth: 100 }}
          >
            {aiSearchLoading ? <CircularProgress size={20} color="inherit" /> : 'Search'}
          </Button>
        </Box>
      </Paper>

      <Paper className="task-list__filters" sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => {
                setStatusFilter(e.target.value as TaskStatus | '');
                setPage(0);
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="todo">To Do</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="in-review">In Review</MenuItem>
              <MenuItem value="done">Done</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={priorityFilter}
              label="Priority"
              onChange={(e) => {
                setPriorityFilter(e.target.value as TaskPriority | '');
                setPage(0);
              }}
            >
              <MenuItem value="">All</MenuItem>
              {TASK_PRIORITIES.map((p) => (
                <MenuItem key={p.value} value={p.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: p.color,
                      }}
                    />
                    {p.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <Paper className="task-list__table-container">
        <TaskTable
          tasks={paginatedTasks}
          onView={(id) => navigate(`/tasks/${id}`)}
          onEdit={(task) => {
            setEditTask(task);
            setDrawerOpen(true);
          }}
          onDelete={(task) => {
            setSelectedTask(task);
            setDeleteDialogOpen(true);
          }}
        />
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredTasks.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      <CreateTaskDrawer open={drawerOpen} onClose={handleDrawerClose} task={editTask} />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        title="Delete Task"
        message={`Are you sure you want to delete task "${selectedTask?.title}"?`}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
      <TaskAIAssistant
        open={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
        tasks={tasks}
        onFilterTasks={(taskIds) => setAiFilteredTaskIds(taskIds)}
      />
    </Box>
  );
};

export default TaskList;
