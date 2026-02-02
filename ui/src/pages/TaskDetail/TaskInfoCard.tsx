import { Box, Paper, Typography, Chip } from '@mui/material';
import { Task } from '../../types';

interface TaskInfoCardProps {
  task: Task;
}

const TaskInfoCard = ({ task }: TaskInfoCardProps) => {
  return (
    <Paper variant="outlined" className="task-detail__info-card">
      <Box className="task-detail__info-item">
        <Typography variant="caption">Assignee</Typography>
        <Typography variant="body1">{task.assignee}</Typography>
      </Box>
      <Box className="task-detail__info-item">
        <Typography variant="caption">Due Date</Typography>
        <Typography variant="body1">
          {new Date(task.dueDate).toLocaleDateString()}
        </Typography>
      </Box>
      <Box className="task-detail__info-item">
        <Typography variant="caption">Created</Typography>
        <Typography variant="body1">
          {new Date(task.createdAt).toLocaleDateString()}
        </Typography>
      </Box>
      <Box className="task-detail__info-item">
        <Typography variant="caption">Last Updated</Typography>
        <Typography variant="body1">
          {new Date(task.updatedAt).toLocaleDateString()}
        </Typography>
      </Box>
      {task.labels && task.labels.length > 0 && (
        <Box className="task-detail__info-item">
          <Typography variant="caption">Labels</Typography>
          <Box className="task-detail__labels">
            {task.labels.map((label, index) => (
              <Chip key={index} label={label} size="small" />
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default TaskInfoCard;
