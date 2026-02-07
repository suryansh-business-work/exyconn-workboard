import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Autocomplete,
  ListSubheader,
} from '@mui/material';
import { SmartToy as AgentIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Developer, Project, Agent } from '../../types';
import { FormValues, getRoleColor } from './types';
import { Dayjs } from 'dayjs';
import { useMemo } from 'react';

interface AssigneeOption {
  id: string;
  name: string;
  type: 'human' | 'agent';
  role?: string;
}

interface TaskBasicFieldsProps {
  values: FormValues;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  setFieldValue: (field: string, value: unknown) => void;
  developers: Developer[];
  agents: Agent[];
  projects: Project[];
}

const TaskBasicFields = ({
  values,
  errors,
  touched,
  setFieldValue,
  developers,
  agents,
  projects,
}: TaskBasicFieldsProps) => {
  const assigneeOptions: AssigneeOption[] = useMemo(() => {
    const humans: AssigneeOption[] = developers.map((d) => ({
      id: d.id,
      name: d.name,
      type: 'human',
      role: d.proficient,
    }));
    const agentOpts: AssigneeOption[] = agents.map((a) => ({
      id: a.id,
      name: a.name,
      type: 'agent',
      role: 'AI Agent',
    }));
    return [...humans, ...agentOpts];
  }, [developers, agents]);

  const selectedAssignee =
    assigneeOptions.find((o) => o.name === values.assignee) || null;

  return (
    <>
      {/* Assignee */}
      <Autocomplete
        options={assigneeOptions}
        groupBy={(option) => (option.type === 'human' ? 'Team Members' : 'AI Agents')}
        getOptionLabel={(option) => option.name}
        value={selectedAssignee}
        isOptionEqualToValue={(option, value) => option.id === value?.id}
        onChange={(_, newValue) => setFieldValue('assignee', newValue?.name || '')}
        filterOptions={(options, { inputValue }) =>
          options.filter(
            (opt) =>
              opt.name.toLowerCase().includes(inputValue.toLowerCase()) ||
              (opt.role && opt.role.toLowerCase().includes(inputValue.toLowerCase()))
          )
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Assignee *"
            error={touched.assignee && !!errors.assignee}
            helperText={touched.assignee && errors.assignee}
          />
        )}
        renderGroup={(params) => (
          <li key={params.key}>
            <ListSubheader
              component="div"
              sx={{ fontWeight: 700, bgcolor: 'background.paper' }}
            >
              {params.group}
            </ListSubheader>
            <ul style={{ padding: 0 }}>{params.children}</ul>
          </li>
        )}
        renderOption={(props, option) => {
          const { key, ...otherProps } = props;
          return (
            <li key={key} {...otherProps}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                  alignItems: 'center',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {option.type === 'agent' && (
                    <AgentIcon sx={{ fontSize: 16, color: '#9c27b0' }} />
                  )}
                  <span>{option.name}</span>
                </Box>
                {option.role && (
                  <Chip
                    label={option.role}
                    size="small"
                    sx={{
                      bgcolor:
                        option.type === 'agent' ? '#9c27b0' : getRoleColor(option.role),
                      color: 'white',
                    }}
                  />
                )}
              </Box>
            </li>
          );
        }}
      />

      {/* Project */}
      <FormControl fullWidth>
        <InputLabel>Project</InputLabel>
        <Select
          value={values.projectId}
          label="Project"
          onChange={(e) => setFieldValue('projectId', e.target.value)}
        >
          <MenuItem value="">None</MenuItem>
          {projects.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Due Date */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="Due Date *"
          value={values.dueDate as Dayjs}
          onChange={(v) => setFieldValue('dueDate', v)}
          slotProps={{
            textField: {
              fullWidth: true,
              error: touched.dueDate && !!errors.dueDate,
              helperText: touched.dueDate && (errors.dueDate as string),
            },
          }}
        />
      </LocalizationProvider>
    </>
  );
};

export default TaskBasicFields;
