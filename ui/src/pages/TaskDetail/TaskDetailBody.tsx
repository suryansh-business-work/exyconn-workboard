import {
  Box,
  Paper,
  Typography,
  Chip,
  Grid,
  Divider,
  ImageList,
  ImageListItem,
} from '@mui/material';
import { Task, TASK_PRIORITIES, TASK_TYPES } from '../../types';
import TaskInfoCard from './TaskInfoCard';
import TaskAgentSection from './TaskAgentSection';
import TaskComments from '../../components/TaskComments';
import QuillEditor from '../../components/QuillEditor/QuillEditor';

const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'success'> = {
  todo: 'default',
  'in-progress': 'primary',
  'in-review': 'secondary',
  done: 'success',
};

const formatStatus = (status: string) =>
  status.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase());

interface TaskDetailBodyProps {
  task: Task;
  description: string;
  isSaving: boolean;
  onDescriptionChange: (value: string) => void;
}

const TaskDetailBody = ({
  task,
  description,
  isSaving,
  onDescriptionChange,
}: TaskDetailBodyProps) => (
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
          onChange={onDescriptionChange}
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

        {task.agents && task.agents.length > 0 && (
          <Box id="agent-section">
            <TaskAgentSection taskId={task.id} agents={task.agents} />
          </Box>
        )}

        <Box sx={{ mt: 4 }}>
          <TaskComments taskId={task.id} />
        </Box>
      </Grid>
      <Grid item xs={12} md={4}>
        <TaskInfoCard task={task} />
      </Grid>
    </Grid>
  </Paper>
);

export default TaskDetailBody;
