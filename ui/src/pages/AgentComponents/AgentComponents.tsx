import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Button,
  ButtonGroup,
  CircularProgress,
  Box,
  Alert,
  TextField,
  InputAdornment,
  Popper,
  Grow,
  Paper,
  ClickAwayListener,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  AutoAwesome as AIIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import PageHeader from '../../components/PageHeader';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog/DeleteConfirmDialog';
import AgentComponentsTable from './AgentComponentsTable';
import AgentComponentFormDialog from './AgentComponentFormDialog';
import AIComponentDialog from './AIComponentDialog';
import { agentComponentService } from '../../services';
import { AgentComponent, CreateAgentComponentPayload } from '../../types';

const AgentComponents = () => {
  const [components, setComponents] = useState<AgentComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AgentComponent | null>(null);
  const [deleting, setDeleting] = useState<AgentComponent | null>(null);
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () =>
      components.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.category.toLowerCase().includes(search.toLowerCase()) ||
          c.description.toLowerCase().includes(search.toLowerCase())
      ),
    [components, search]
  );

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
        breadcrumbs={[{ label: 'Agents', path: '/agents' }, { label: 'Components' }]}
        action={
          <>
            <ButtonGroup variant="contained" ref={anchorRef}>
              <Button startIcon={<AddIcon />} onClick={handleCreate}>
                Create Component
              </Button>
              <Button size="small" onClick={() => setMenuOpen((p) => !p)}>
                <ArrowDropDownIcon />
              </Button>
            </ButtonGroup>
            <Popper
              open={menuOpen}
              anchorEl={anchorRef.current}
              transition
              disablePortal
              sx={{ zIndex: 1 }}
            >
              {({ TransitionProps }) => (
                <Grow {...TransitionProps}>
                  <Paper elevation={4}>
                    <ClickAwayListener onClickAway={() => setMenuOpen(false)}>
                      <MenuList>
                        <MenuItem
                          onClick={() => {
                            handleCreate();
                            setMenuOpen(false);
                          }}
                        >
                          <ListItemIcon>
                            <AddIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText>Manual Create</ListItemText>
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            setAiDialogOpen(true);
                            setMenuOpen(false);
                          }}
                        >
                          <ListItemIcon>
                            <AIIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText>AI Generate</ListItemText>
                        </MenuItem>
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Grow>
              )}
            </Popper>
          </>
        }
      />
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      <TextField
        size="small"
        placeholder="Search components..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 2, maxWidth: 320 }}
      />
      <AgentComponentsTable
        components={filtered}
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
      <AIComponentDialog
        open={aiDialogOpen}
        onClose={() => setAiDialogOpen(false)}
        onSubmit={handleSubmit}
      />
    </Box>
  );
};

export default AgentComponents;
