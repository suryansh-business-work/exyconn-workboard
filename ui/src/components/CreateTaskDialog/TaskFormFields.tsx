import { useState } from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Button,
  CircularProgress,
  Typography,
} from '@mui/material';
import { AutoFixHigh as AIIcon, SmartToy as AgentIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import { Developer, Agent, TaskStatus, TaskPriority, TASK_PRIORITIES } from '../../types';
import QuillEditor from '../QuillEditor';
import { settingsService } from '../../services';

interface TaskFormFieldsProps {
  title: string;
  description: string;
  assignee: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Dayjs | null;
  developers: Developer[];
  agents: Agent[];
  onTitleChange: (val: string) => void;
  onDescriptionChange: (val: string) => void;
  onAssigneeChange: (val: string) => void;
  onStatusChange: (val: TaskStatus) => void;
  onPriorityChange: (val: TaskPriority) => void;
  onDueDateChange: (val: Dayjs | null) => void;
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'in-review', label: 'In Review' },
  { value: 'done', label: 'Done' },
];

const TaskFormFields = (props: TaskFormFieldsProps) => {
  const [rewriting, setRewriting] = useState(false);

  const handleAIRewrite = async () => {
    if (!props.description.trim()) return;
    setRewriting(true);
    try {
      const result = await settingsService.rewriteWithAI(
        props.description,
        `Task title: ${props.title}. Please improve this task description to be clearer and more professional.`
      );
      props.onDescriptionChange(result.rewrittenText);
    } catch (error) {
      console.error('AI rewrite failed:', error);
    } finally {
      setRewriting(false);
    }
  };

  return (
    <>
      <Grid item xs={12}>
        <TextField
          label="Title"
          fullWidth
          required
          value={props.title}
          onChange={(e) => props.onTitleChange(e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Description
          </Typography>
          <Button
            size="small"
            startIcon={rewriting ? <CircularProgress size={16} /> : <AIIcon />}
            onClick={handleAIRewrite}
            disabled={rewriting || !props.description.trim()}
            sx={{ textTransform: 'none' }}
          >
            {rewriting ? 'Rewriting...' : 'Rewrite with AI'}
          </Button>
        </Box>
        <QuillEditor
          value={props.description}
          onChange={props.onDescriptionChange}
          placeholder="Enter task description..."
          minHeight={150}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Assignee</InputLabel>
          <Select
            value={props.assignee}
            label="Assignee"
            onChange={(e) => props.onAssigneeChange(e.target.value)}
          >
            <MenuItem disabled sx={{ fontWeight: 700, opacity: 1 }}>
              Team Members
            </MenuItem>
            {props.developers.map((dev) => (
              <MenuItem key={dev.id} value={dev.name}>
                {dev.name}
              </MenuItem>
            ))}
            {props.agents.length > 0 && (
              <MenuItem disabled sx={{ fontWeight: 700, opacity: 1 }}>
                AI Agents
              </MenuItem>
            )}
            {props.agents.map((agent) => (
              <MenuItem key={agent.id} value={agent.name}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AgentIcon sx={{ fontSize: 16, color: '#9c27b0' }} />
                  {agent.name}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={6}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Due Date"
            value={props.dueDate}
            onChange={props.onDueDateChange}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </LocalizationProvider>
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            value={props.status}
            label="Status"
            onChange={(e) => props.onStatusChange(e.target.value as TaskStatus)}
          >
            {statusOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Priority</InputLabel>
          <Select
            value={props.priority}
            label="Priority"
            onChange={(e) => props.onPriorityChange(e.target.value as TaskPriority)}
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
      </Grid>
    </>
  );
};

export default TaskFormFields;
