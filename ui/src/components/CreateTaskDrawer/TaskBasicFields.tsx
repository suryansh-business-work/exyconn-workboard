import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Autocomplete,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Developer, Project } from '../../types';
import { FormValues, getRoleColor } from './types';
import { Dayjs } from 'dayjs';

interface TaskBasicFieldsProps {
  values: FormValues;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  setFieldValue: (field: string, value: unknown) => void;
  developers: Developer[];
  projects: Project[];
}

const TaskBasicFields = ({
  values,
  errors,
  touched,
  setFieldValue,
  developers,
  projects,
}: TaskBasicFieldsProps) => {
  const selectedAssignee = developers.find((d) => d.name === values.assignee) || null;

  return (
    <>
      {/* Assignee */}
      <Autocomplete
        options={developers}
        getOptionLabel={(option) => option.name}
        value={selectedAssignee}
        isOptionEqualToValue={(option, value) => option.id === value?.id}
        onChange={(_, newValue) => setFieldValue('assignee', newValue?.name || '')}
        filterOptions={(options, { inputValue }) =>
          options.filter(
            (opt) =>
              opt.name.toLowerCase().includes(inputValue.toLowerCase()) ||
              (opt.proficient &&
                opt.proficient.toLowerCase().includes(inputValue.toLowerCase()))
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
                <span>{option.name}</span>
                {option.proficient && (
                  <Chip
                    label={option.proficient}
                    size="small"
                    sx={{
                      bgcolor: getRoleColor(option.proficient),
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
