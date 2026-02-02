import { useState, useEffect, useMemo } from 'react';
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
  Autocomplete,
  Chip,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Project, Developer } from '../../types';
import { projectService, developerService } from '../../services';
import DeleteConfirmDialog from '../DeleteConfirmDialog/DeleteConfirmDialog';
import QuillEditor from '../QuillEditor';
import ProjectDetailDialog from '../ProjectDetailDialog';
import './SettingsTabs.scss';

const validationSchema = Yup.object({
  name: Yup.string().required('Project name is required').max(100),
  description: Yup.string().max(1000),
  urlTest: Yup.string().url('Invalid URL').nullable(),
  urlStage: Yup.string().url('Invalid URL').nullable(),
  urlProd: Yup.string().url('Invalid URL').nullable(),
  repoUrl: Yup.string().url('Invalid URL').nullable(),
  docsUrl: Yup.string().url('Invalid URL').nullable(),
  ownerId: Yup.string().required('Owner is required'),
});

const initialValues = {
  name: '',
  description: '',
  urlTest: '',
  urlStage: '',
  urlProd: '',
  repoUrl: '',
  docsUrl: '',
  ownerId: '',
  ownerName: '',
};

const ProjectsTab = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projectsData, devsData] = await Promise.all([
        projectService.getAll(),
        developerService.getAll(),
      ]);
      setProjects(projectsData);
      setDevelopers(devsData);
    } catch {
      setError('Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const query = searchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.ownerName.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
    );
  }, [projects, searchQuery]);

  const handleOpenDrawer = (project?: Project) => {
    setSelectedProject(project || null);
    setDrawerOpen(true);
  };

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting }: { setSubmitting: (v: boolean) => void }
  ) => {
    try {
      const dev = developers.find((d) => d.id === values.ownerId);
      const payload = { ...values, ownerName: dev?.name || '' };
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      selectedProject
        ? await projectService.update(selectedProject.id, payload)
        : await projectService.create(payload);
      setDrawerOpen(false);
      setSelectedProject(null);
      fetchData();
    } catch {
      setError('Failed to save project.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedProject) {
      try {
        await projectService.delete(selectedProject.id);
        fetchData();
      } catch {
        setError('Failed to delete project.');
      }
    }
    setDeleteDialogOpen(false);
    setSelectedProject(null);
  };

  if (loading)
    return (
      <Box className="settings-tab__loading">
        <CircularProgress />
      </Box>
    );

  const getInitialValues = () =>
    selectedProject
      ? {
          name: selectedProject.name,
          description: selectedProject.description,
          urlTest: selectedProject.urlTest || '',
          urlStage: selectedProject.urlStage || '',
          urlProd: selectedProject.urlProd || '',
          repoUrl: selectedProject.repoUrl || '',
          docsUrl: selectedProject.docsUrl || '',
          ownerId: selectedProject.ownerId,
          ownerName: selectedProject.ownerName,
        }
      : initialValues;

  return (
    <Box className="settings-tab">
      <Box className="settings-tab__header">
        <h3>Projects</h3>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 250 }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDrawer()}
          >
            Add Project
          </Button>
        </Box>
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
              <TableCell>Owner</TableCell>
              <TableCell>URLs</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProjects.map((project) => (
              <TableRow
                key={project.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => {
                  setViewingProject(project);
                  setDetailDialogOpen(true);
                }}
              >
                <TableCell>{project.name}</TableCell>
                <TableCell>{project.ownerName}</TableCell>
                <TableCell>
                  {[
                    project.urlTest && 'Test',
                    project.urlStage && 'Stage',
                    project.urlProd && 'Prod',
                    project.repoUrl && 'Repo',
                    project.docsUrl && 'Docs',
                  ]
                    .filter(Boolean)
                    .join(', ') || '-'}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDrawer(project);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProject(project);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {projects.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No projects. Add your first project!
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
        PaperProps={{ sx: { width: { xs: '100%', sm: 450 } } }}
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
              {selectedProject ? 'Edit Project' : 'Add Project'}
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Formik
            initialValues={getInitialValues()}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
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
                  overflowY: 'auto',
                }}
              >
                <Field
                  as={TextField}
                  name="name"
                  label="Project Name"
                  fullWidth
                  error={touched.name && !!errors.name}
                  helperText={touched.name && errors.name}
                />
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Description
                  </Typography>
                  <QuillEditor
                    value={values.description}
                    onChange={(val) => setFieldValue('description', val)}
                    placeholder="Enter project description..."
                    minHeight={120}
                  />
                </Box>

                <Autocomplete
                  options={developers}
                  getOptionLabel={(option) =>
                    `${option.name} (${option.proficient || 'No Role'})`
                  }
                  value={developers.find((d) => d.id === values.ownerId) || null}
                  isOptionEqualToValue={(option, value) => option?.id === value?.id}
                  onChange={(_, newValue) => {
                    if (newValue) {
                      setFieldValue('ownerId', newValue.id, true);
                      setFieldValue('ownerName', newValue.name, false);
                    } else {
                      setFieldValue('ownerId', '', true);
                      setFieldValue('ownerName', '', false);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Project Owner *"
                      error={touched.ownerId && !!errors.ownerId}
                      helperText={touched.ownerId && errors.ownerId}
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
                            <Chip label={option.proficient} size="small" />
                          )}
                        </Box>
                      </li>
                    );
                  }}
                />

                <Accordion
                  defaultExpanded={
                    !!(
                      values.urlTest ||
                      values.urlStage ||
                      values.urlProd ||
                      values.repoUrl ||
                      values.docsUrl
                    )
                  }
                  sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinkIcon fontSize="small" />
                      <Typography>Project URLs (Optional)</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                  >
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Field
                        as={TextField}
                        name="urlTest"
                        label="Test URL"
                        fullWidth
                        size="small"
                        error={touched.urlTest && !!errors.urlTest}
                        helperText={touched.urlTest && errors.urlTest}
                      />
                      <Field
                        as={TextField}
                        name="urlStage"
                        label="Stage URL"
                        fullWidth
                        size="small"
                        error={touched.urlStage && !!errors.urlStage}
                        helperText={touched.urlStage && errors.urlStage}
                      />
                    </Box>
                    <Field
                      as={TextField}
                      name="urlProd"
                      label="Production URL"
                      fullWidth
                      size="small"
                      error={touched.urlProd && !!errors.urlProd}
                      helperText={touched.urlProd && errors.urlProd}
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Field
                        as={TextField}
                        name="repoUrl"
                        label="Repository URL"
                        fullWidth
                        size="small"
                        error={touched.repoUrl && !!errors.repoUrl}
                        helperText={touched.repoUrl && errors.repoUrl}
                      />
                      <Field
                        as={TextField}
                        name="docsUrl"
                        label="Docs URL"
                        fullWidth
                        size="small"
                        error={touched.docsUrl && !!errors.docsUrl}
                        helperText={touched.docsUrl && errors.docsUrl}
                      />
                    </Box>
                  </AccordionDetails>
                </Accordion>

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
        title="Delete Project"
        message={`Delete "${selectedProject?.name}"?`}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      <ProjectDetailDialog
        open={detailDialogOpen}
        onClose={() => {
          setDetailDialogOpen(false);
          setViewingProject(null);
        }}
        project={viewingProject}
      />
    </Box>
  );
};

export default ProjectsTab;
