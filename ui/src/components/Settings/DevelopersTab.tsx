import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  CircularProgress,
  Drawer,
  Typography,
  TextField,
  Chip,
  Autocomplete,
  Tooltip,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Developer, RESOURCE_ROLES, ResourceRole } from '../../types';
import { developerService } from '../../services';
import DeleteConfirmDialog from '../DeleteConfirmDialog/DeleteConfirmDialog';
import './SettingsTabs.scss';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required').max(100, 'Max 100 characters'),
  email: Yup.string().required('Email is required').email('Invalid email format'),
  proficient: Yup.string().required('Role is required'),
});

const initialValues = {
  name: '',
  email: '',
  proficient: 'AI Developer' as ResourceRole,
};

const getRoleColor = (role: ResourceRole) => {
  const colors: Record<string, string> = {
    'AI Developer': '#9c27b0',
    'Frontend Developer': '#2196f3',
    'Backend Developer': '#4caf50',
    'Full Stack Developer': '#ff9800',
    Tester: '#f44336',
    'QA Engineer': '#e91e63',
    'Product Owner': '#673ab7',
    'Project Manager': '#3f51b5',
    Designer: '#00bcd4',
    'UI/UX Designer': '#009688',
    'DevOps Engineer': '#795548',
    'Data Analyst': '#607d8b',
    'Business Analyst': '#8bc34a',
    'Scrum Master': '#ff5722',
    'Tech Lead': '#1976d2',
    'HR Manager': '#c2185b',
    'HR Executive': '#d81b60',
    Admin: '#5d4037',
    Finance: '#00695c',
    Marketing: '#f57c00',
    Sales: '#0288d1',
    Support: '#7b1fa2',
    Operations: '#455a64',
    Legal: '#6a1b9a',
    Other: '#9e9e9e',
  };
  return colors[role] || '#9e9e9e';
};

const DevelopersTab = () => {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(null);
  const [resendingPassword, setResendingPassword] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchDevelopers = async () => {
    setLoading(true);
    try {
      setDevelopers(await developerService.getAll());
    } catch {
      setError('Failed to fetch resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const handleResendPassword = async (email: string) => {
    setResendingPassword(email);
    try {
      await developerService.resendPassword(email);
      setSnackbar({
        open: true,
        message: `Password email sent to ${email}`,
        severity: 'success',
      });
    } catch {
      setSnackbar({
        open: true,
        message: 'Failed to send password email. Please try again.',
        severity: 'error',
      });
    } finally {
      setResendingPassword(null);
    }
  };

  const handleOpenDrawer = (dev?: Developer) => {
    setSelectedDeveloper(dev || null);
    setDrawerOpen(true);
  };

  const handleSave = async (
    values: typeof initialValues,
    { setSubmitting }: { setSubmitting: (v: boolean) => void }
  ) => {
    try {
      selectedDeveloper
        ? await developerService.update(selectedDeveloper.id, values)
        : await developerService.create(values);
      setDrawerOpen(false);
      setSelectedDeveloper(null);
      fetchDevelopers();
    } catch {
      setError('Failed to save resource.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedDeveloper) {
      try {
        await developerService.delete(selectedDeveloper.id);
        fetchDevelopers();
      } catch {
        setError('Failed to delete resource.');
      }
    }
    setDeleteDialogOpen(false);
    setSelectedDeveloper(null);
  };

  const getInitialValues = () =>
    selectedDeveloper
      ? {
          name: selectedDeveloper.name,
          email: selectedDeveloper.email,
          proficient: selectedDeveloper.proficient || ('AI Developer' as ResourceRole),
        }
      : initialValues;

  if (loading)
    return (
      <Box className="settings-tab__loading">
        <CircularProgress />
      </Box>
    );

  return (
    <Box className="settings-tab">
      <Box className="settings-tab__header">
        <h3>Resources</h3>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDrawer()}
        >
          Add Resource
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {developers.map((dev) => (
              <TableRow key={dev.id}>
                <TableCell>{dev.name}</TableCell>
                <TableCell>{dev.email}</TableCell>
                <TableCell>
                  <Chip
                    label={dev.proficient || 'Not Set'}
                    size="small"
                    sx={{
                      bgcolor: getRoleColor(dev.proficient),
                      color: 'white',
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Resend Password Email">
                    <IconButton
                      size="small"
                      onClick={() => handleResendPassword(dev.email)}
                      disabled={resendingPassword === dev.email}
                    >
                      {resendingPassword === dev.email ? (
                        <CircularProgress size={16} />
                      ) : (
                        <EmailIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => handleOpenDrawer(dev)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedDeveloper(dev);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {developers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No resources configured. Add your first resource!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 400 } } }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              borderBottom: '1px solid #e0e0e0',
            }}
          >
            <Typography variant="h6">
              {selectedDeveloper ? 'Edit Resource' : 'Add Resource'}
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Formik
            initialValues={getInitialValues()}
            validationSchema={validationSchema}
            onSubmit={handleSave}
            enableReinitialize
          >
            {({ errors, touched, isSubmitting, values, setFieldValue }) => (
              <Form
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 24,
                  gap: 20,
                }}
              >
                <Field
                  as={TextField}
                  name="name"
                  label="Name"
                  fullWidth
                  error={touched.name && !!errors.name}
                  helperText={touched.name && errors.name}
                />

                <Field
                  as={TextField}
                  name="email"
                  label="Email"
                  type="email"
                  fullWidth
                  error={touched.email && !!errors.email}
                  helperText={touched.email && errors.email}
                />

                <Autocomplete
                  options={RESOURCE_ROLES}
                  value={values.proficient}
                  onChange={(_, newValue) =>
                    setFieldValue('proficient', newValue || 'AI Developer')
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Role / Proficient"
                      error={touched.proficient && !!errors.proficient}
                      helperText={touched.proficient && errors.proficient}
                    />
                  )}
                  renderOption={(props, option) => {
                    const { key, ...otherProps } = props;
                    return (
                      <li key={key} {...otherProps}>
                        <Chip
                          label={option}
                          size="small"
                          sx={{
                            bgcolor: getRoleColor(option),
                            color: 'white',
                            mr: 1,
                          }}
                        />
                      </li>
                    );
                  }}
                />

                <Box
                  sx={{
                    mt: 'auto',
                    pt: 2,
                    borderTop: '1px solid #e0e0e0',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 2,
                  }}
                >
                  <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="contained" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        </Box>
      </Drawer>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        title="Delete Resource"
        message={`Are you sure you want to delete "${selectedDeveloper?.name}"?`}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DevelopersTab;
