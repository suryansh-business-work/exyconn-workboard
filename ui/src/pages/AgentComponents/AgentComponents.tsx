import { useState, useEffect, useCallback } from 'react';
import { Button, CircularProgress, Box, Alert } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import PageHeader from '../../components/PageHeader';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog/DeleteConfirmDialog';
import AgentComponentsTable from './AgentComponentsTable';
import AgentComponentFormDialog from './AgentComponentFormDialog';
import { agentComponentService } from '../../services';
import { AgentComponent, CreateAgentComponentPayload } from '../../types';

const AgentComponents = () => {
  const [components, setComponents] = useState<AgentComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AgentComponent | null>(null);
  const [deleting, setDeleting] = useState<AgentComponent | null>(null);

  const fetchComponents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await agentComponentService.getAll();
      setComponents(data);
      setError('');
    } catch {
      setError('Failed to load components');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComponents();
  }, [fetchComponents]);

  const handleCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const handleEdit = (component: AgentComponent) => {
    setEditing(component);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: CreateAgentComponentPayload) => {
    try {
      if (editing) {
        await agentComponentService.update(editing.id, data);
      } else {
        await agentComponentService.create(data);
      }
      setDialogOpen(false);
      setEditing(null);
      fetchComponents();
    } catch {
      setError('Failed to save component');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleting) return;
    try {
      await agentComponentService.delete(deleting.id);
      setDeleting(null);
      fetchComponents();
    } catch {
      setError('Failed to delete component');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Agent Components"
        breadcrumbs={[
          { label: 'Agents', path: '/agents' },
          { label: 'Components' },
        ]}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Add Component
          </Button>
        }
      />
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      <AgentComponentsTable
        components={components}
        onEdit={handleEdit}
        onDelete={(c) => setDeleting(c)}
      />
      <AgentComponentFormDialog
        open={dialogOpen}
        component={editing}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />
      <DeleteConfirmDialog
        open={Boolean(deleting)}
        title="Delete Component"
        message={`Are you sure you want to delete "${deleting?.name}"?`}
        onClose={() => setDeleting(null)}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  );
};

export default AgentComponents;
