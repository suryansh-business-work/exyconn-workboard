import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Box,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  BugReport as BugIcon,
  ErrorOutline as IncidentIcon,
  Star as FeatureIcon,
  TrendingUp as ImprovementIcon,
  Assignment as TaskIcon,
  MoreHoriz as OtherIcon,
} from '@mui/icons-material';
import { Task, TASK_PRIORITIES, TASK_TYPES } from '../../types';

interface TaskTableProps {
  tasks: Task[];
  onView: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'success'> = {
  todo: 'default',
  'in-progress': 'primary',
  'in-review': 'secondary',
  done: 'success',
};

const formatStatus = (status: string) => {
  return status.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const getTaskTypeIcon = (type: string) => {
  switch (type) {
    case 'bug':
      return <BugIcon fontSize="small" />;
    case 'incident':
      return <IncidentIcon fontSize="small" />;
    case 'feature':
      return <FeatureIcon fontSize="small" />;
    case 'improvement':
      return <ImprovementIcon fontSize="small" />;
    case 'other':
      return <OtherIcon fontSize="small" />;
    default:
      return <TaskIcon fontSize="small" />;
  }
};

const isDueToday = (dueDate: string): boolean => {
  const today = new Date();
  const due = new Date(dueDate);
  return (
    due.getFullYear() === today.getFullYear() &&
    due.getMonth() === today.getMonth() &&
    due.getDate() === today.getDate()
  );
};

const isOverdue = (dueDate: string, status: string): boolean => {
  if (status === 'done') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
};

// Due tomorrow (1 day before due becomes today)
const isDueTomorrow = (dueDate: string, status: string): boolean => {
  if (status === 'done') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due.getTime() === tomorrow.getTime();
};

const TaskTable = ({ tasks, onView, onEdit, onDelete }: TaskTableProps) => {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Task ID</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Assignee</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Due Date</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tasks.map((task, index) => {
            const overdue = isOverdue(task.dueDate, task.status);
            const dueToday = isDueToday(task.dueDate) && task.status !== 'done';
            const dueTomorrow = isDueTomorrow(task.dueDate, task.status);
            const taskType =
              TASK_TYPES.find((t) => t.value === task.taskType) || TASK_TYPES[0];
            const priority =
              TASK_PRIORITIES.find((p) => p.value === task.priority) ||
              TASK_PRIORITIES[2];

            // Due date coloring: Same day = Red, 1 day = Yellow, Rest = Normal
            let rowBgColor: string | undefined;
            let rowHoverColor: string | undefined;

            if (overdue || dueToday) {
              // Same day or overdue = Red
              rowBgColor = 'rgba(244, 67, 54, 0.12)';
              rowHoverColor = 'rgba(244, 67, 54, 0.20) !important';
            } else if (dueTomorrow) {
              // 1 day before due = Yellow
              rowBgColor = 'rgba(255, 193, 7, 0.15)';
              rowHoverColor = 'rgba(255, 193, 7, 0.25) !important';
            }

            return (
              <TableRow
                key={task.id || `task-${index}`}
                hover
                className="task-list__row"
                onClick={() => onView(task.id)}
                sx={{
                  backgroundColor: rowBgColor,
                  '&:hover': {
                    backgroundColor: rowHoverColor,
                  },
                }}
              >
                <TableCell className="task-list__id">{task.taskId}</TableCell>
                <TableCell>
                  <Tooltip title={taskType.label}>
                    <Box
                      sx={{
                        color: taskType.color,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {getTaskTypeIcon(task.taskType || 'task')}
                    </Box>
                  </Tooltip>
                </TableCell>
                <TableCell className="task-list__title">{task.title}</TableCell>
                <TableCell>{task.assignee}</TableCell>
                <TableCell>
                  <Chip
                    label={formatStatus(task.status)}
                    size="small"
                    color={statusColors[task.status]}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={priority.value}
                    size="small"
                    sx={{
                      bgcolor: priority.color,
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
                <TableCell
                  sx={{
                    color:
                      overdue || dueToday
                        ? '#d32f2f'
                        : dueTomorrow
                          ? '#f57c00'
                          : undefined,
                    fontWeight: overdue || dueToday || dueTomorrow ? 600 : undefined,
                  }}
                >
                  {new Date(task.dueDate).toLocaleDateString()}
                  {(overdue || dueToday) && (
                    <Chip
                      label={overdue ? 'Overdue' : 'Today'}
                      size="small"
                      color="error"
                      sx={{ ml: 1, height: 18 }}
                    />
                  )}
                  {dueTomorrow && (
                    <Chip
                      label="Tomorrow"
                      size="small"
                      color="warning"
                      sx={{ ml: 1, height: 18 }}
                    />
                  )}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="View">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(task.id);
                      }}
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(task);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(task);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
          {tasks.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} align="center">
                No tasks found. Create your first task!
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TaskTable;
