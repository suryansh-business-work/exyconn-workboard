import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Chip,
  IconButton,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useState } from 'react';
import { Agent, CreateAgentPayload } from '../../types';

const AGENT_ROLES = [
  'Code Review',
  'Testing',
  'Deployment',
  'Monitoring',
  'Documentation',
  'Security',
  'Performance',
  'Data Processing',
  'Notification',
  'Custom',
];

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required').max(100),
  description: Yup.string().max(1000),
  role: Yup.string().required('Role is required').max(100),
  status: Yup.string().oneOf(['active', 'inactive', 'draft']).required(),
});

interface AgentFormDialogProps {
  open: boolean;
  agent: Agent | null;
  onClose: () => void;
  onSubmit: (data: CreateAgentPayload) => void;
}

const AgentFormDialog = ({ open, agent, onClose, onSubmit }: AgentFormDialogProps) => {
  const [capabilityInput, setCapabilityInput] = useState('');

  const formik = useFormik<CreateAgentPayload>({
    initialValues: {
      name: agent?.name || '',
      description: agent?.description || '',
      role: agent?.role || '',
      status: agent?.status || 'draft',
      capabilities: agent?.capabilities || [],
      configuration: agent?.configuration || {},
      nodes: agent?.nodes || [],
      edges: agent?.edges || [],
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      onSubmit(values);
      formik.resetForm();
    },
  });

  const handleAddCapability = () => {
    const trimmed = capabilityInput.trim();
    if (trimmed && !formik.values.capabilities.includes(trimmed)) {
      formik.setFieldValue('capabilities', [...formik.values.capabilities, trimmed]);
      setCapabilityInput('');
    }
  };

  const handleRemoveCapability = (cap: string) => {
    formik.setFieldValue(
      'capabilities',
      formik.values.capabilities.filter((c) => c !== cap)
    );
  };

  const handleClose = () => {
    formik.resetForm();
    setCapabilityInput('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>{agent ? 'Edit Agent' : 'Create Agent'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Name"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Description"
            name="description"
            value={formik.values.description}
            onChange={formik.handleChange}
            multiline
            rows={3}
            fullWidth
          />
          <TextField
            label="Role"
            name="role"
            select
            value={formik.values.role}
            onChange={formik.handleChange}
            error={formik.touched.role && Boolean(formik.errors.role)}
            helperText={formik.touched.role && formik.errors.role}
            fullWidth
          >
            {AGENT_ROLES.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Status"
            name="status"
            select
            value={formik.values.status}
            onChange={formik.handleChange}
            fullWidth
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
          </TextField>
          <Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                label="Add Capability"
                value={capabilityInput}
                onChange={(e) => setCapabilityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCapability();
                  }
                }}
                size="small"
                fullWidth
              />
              <IconButton onClick={handleAddCapability} color="primary">
                <AddIcon />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
              {formik.values.capabilities.map((cap) => (
                <Chip
                  key={cap}
                  label={cap}
                  size="small"
                  onDelete={() => handleRemoveCapability(cap)}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {agent ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AgentFormDialog;
