import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { TASK_PRIORITIES, TASK_TYPES } from '../../types';
import { TaskStatus } from '../../types';
import { STATUS_OPTIONS } from './types';

interface TaskStatusSelectsProps {
  status: TaskStatus;
  priority: string;
  taskType: string;
  setFieldValue: (field: string, value: unknown) => void;
}

const TaskStatusSelects = ({
  status,
  priority,
  taskType,
  setFieldValue,
}: TaskStatusSelectsProps) => {
  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <FormControl fullWidth>
        <InputLabel>Status</InputLabel>
        <Select
          value={status}
          label="Status"
          onChange={(e) => setFieldValue('status', e.target.value)}
        >
          {STATUS_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>Priority</InputLabel>
        <Select
          value={priority}
          label="Priority"
          onChange={(e) => setFieldValue('priority', e.target.value)}
        >
          {TASK_PRIORITIES.map((p) => (
            <MenuItem key={p.value} value={p.value}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
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

      <FormControl fullWidth>
        <InputLabel>Type</InputLabel>
        <Select
          value={taskType}
          label="Type"
          onChange={(e) => setFieldValue('taskType', e.target.value)}
        >
          {TASK_TYPES.map((t) => (
            <MenuItem key={t.value} value={t.value}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: t.color,
                  }}
                />
                {t.label}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default TaskStatusSelects;
