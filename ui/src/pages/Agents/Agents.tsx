import { useState, useEffect, useCallback } from 'react';
import { Button, CircularProgress, Box, Alert } from '@mui/material';
import { Add as AddIcon, Extension as ComponentIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog/DeleteConfirmDialog';
import AgentsTable from './AgentsTable';
import AgentFormDialog from './AgentFormDialog';
import { agentService } from '../../services';
import { Agent, CreateAgentPayload } from '../../types';

const Agents = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [deleteAgent, setDeleteAgent] = useState<Agent | null>(null);

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await agentService.getAll();
      setAgents(data);
      setError('');
    } catch {
      setError('Failed to load agents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleCreate = () => {
    setEditingAgent(null);
    setDialogOpen(true);
  };

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: CreateAgentPayload) => {
    try {
      if (editingAgent) {
        await agentService.update(editingAgent.id, data);
      } else {
        await agentService.create(data);
      }
      setDialogOpen(false);
      setEditingAgent(null);
      fetchAgents();
    } catch {
      setError('Failed to save agent');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteAgent) return;
    try {
      await agentService.delete(deleteAgent.id);
      setDeleteAgent(null);
      fetchAgents();
    } catch {
      setError('Failed to delete agent');
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
        title="Agents"
        breadcrumbs={[{ label: 'Agents' }]}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<ComponentIcon />} onClick={() => navigate('/agents/components')}>
              Components
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
              Create Agent
            </Button>
          </Box>
        }
      />
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      <AgentsTable
        agents={agents}
        onEdit={handleEdit}
        onDelete={(agent) => setDeleteAgent(agent)}
      />
      <AgentFormDialog
        open={dialogOpen}
        agent={editingAgent}
        onClose={() => {
          setDialogOpen(false);
          setEditingAgent(null);
        }}
        onSubmit={handleSubmit}
      />
      <DeleteConfirmDialog
        open={Boolean(deleteAgent)}
        title="Delete Agent"
        message={`Are you sure you want to delete "${deleteAgent?.name}"? This action cannot be undone.`}
        onClose={() => setDeleteAgent(null)}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  );
};

export default Agents;
