import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Box,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useEffect } from 'react';
import { AgentComponent, AgentComponentCategory, CreateAgentComponentPayload, ConfigField } from '../../types';
import ConfigSchemaBuilder from './ConfigSchemaBuilder';
import MuiIconPicker from './MuiIconPicker';
import { CATEGORY_DEFAULT_ICONS } from './iconList';

const CATEGORIES: { value: AgentComponentCategory; label: string }[] = [
  { value: 'event', label: 'Event' },
  { value: 'data-scrapper', label: 'Data Scrapper' },
  { value: 'communication', label: 'Communication' },
  { value: 'ai', label: 'AI' },
  { value: 'action', label: 'Action' },
  { value: 'logic', label: 'Logic' },
  { value: 'custom', label: 'Custom' },
];

const COLORS = [
  '#1976d2', '#f57c00', '#2e7d32', '#9c27b0',
  '#d32f2f', '#00796b', '#616161', '#e91e63',
];

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required').max(100),
  category: Yup.string().required('Category is required'),
  description: Yup.string().max(500),
  color: Yup.string().required('Color is required'),
  status: Yup.string().oneOf(['active', 'inactive']).required(),
});

interface Props {
  open: boolean;
  component: AgentComponent | null;
  onClose: () => void;
  onSubmit: (data: CreateAgentComponentPayload) => void;
}

const AgentComponentFormDialog = ({ open, component, onClose, onSubmit }: Props) => {
  const formik = useFormik<CreateAgentComponentPayload>({
    initialValues: {
      name: component?.name || '',
      category: component?.category || 'custom',
      description: component?.description || '',
      icon: component?.icon || CATEGORY_DEFAULT_ICONS['custom'],
      color: component?.color || '#1976d2',
      configSchema: component?.configSchema || [],
      status: component?.status || 'active',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      onSubmit(values);
      formik.resetForm();
    },
  });

  useEffect(() => {
    if (!component) {
      const cat = formik.values.category as AgentComponentCategory;
      const defaultIcon = CATEGORY_DEFAULT_ICONS[cat];
      if (defaultIcon) {
        formik.setFieldValue('icon', defaultIcon);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.category, component]);

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>{component ? 'Edit Component' : 'Create Component'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="Name" name="name" value={formik.values.name}
            onChange={formik.handleChange} error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name} fullWidth margin="dense" />
          <TextField label="Description" name="description" value={formik.values.description}
            onChange={formik.handleChange} multiline rows={2} fullWidth />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Category" name="category" select value={formik.values.category}
              onChange={formik.handleChange} fullWidth
              error={formik.touched.category && Boolean(formik.errors.category)}>
              {CATEGORIES.map((c) => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
            </TextField>
            <TextField label="Status" name="status" select value={formik.values.status}
              onChange={formik.handleChange} fullWidth>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <MuiIconPicker
                value={formik.values.icon}
                onChange={(iconName) => formik.setFieldValue('icon', iconName)}
              />
            </Box>
            <TextField label="Color" name="color" select value={formik.values.color}
              onChange={formik.handleChange} fullWidth sx={{ flex: 1 }}>
              {COLORS.map((c) => (
                <MenuItem key={c} value={c}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: c }} />
                    {c}
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <ConfigSchemaBuilder
            fields={formik.values.configSchema}
            onChange={(fields: ConfigField[]) => formik.setFieldValue('configSchema', fields)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained">{component ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AgentComponentFormDialog;
