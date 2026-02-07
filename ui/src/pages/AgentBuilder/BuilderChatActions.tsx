import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  CircularProgress,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  AutoFixHigh as BuildIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { settingsService } from '../../services';
import { agentComponentService } from '../../services';
import {
  MissingComponent,
  SuggestedWorkflow,
  AgentComponent,
  ConfigField,
  CreateAgentComponentPayload,
} from '../../types';

interface Props {
  missingComponents: MissingComponent[];
  workflow: SuggestedWorkflow | null;
  components: AgentComponent[];
  onComponentCreated: (comp: AgentComponent) => void;
  onBuildWorkflow: (workflow: SuggestedWorkflow) => void;
  onAllComponentsCreated?: () => void;
}

const BuilderChatActions = ({
  missingComponents,
  workflow,
  components,
  onComponentCreated,
  onBuildWorkflow,
  onAllComponentsCreated,
}: Props) => {
  const [creating, setCreating] = useState<Record<string, boolean>>({});
  const [created, setCreated] = useState<Record<string, boolean>>({});
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState('');

  // Auto-mark components that already exist in the components list
  const componentNames = useMemo(
    () => new Set(components.map((c) => c.name.toLowerCase())),
    [components]
  );
  const effectiveCreated = useMemo(() => {
    const result: Record<string, boolean> = { ...created };
    missingComponents.forEach((mc) => {
      if (componentNames.has(mc.name.toLowerCase())) result[mc.name] = true;
    });
    return result;
  }, [created, missingComponents, componentNames]);

  // Notify parent when all missing components are created
  const allCreated =
    missingComponents.length > 0 &&
    missingComponents.every((mc) => effectiveCreated[mc.name]);

  useEffect(() => {
    if (allCreated && onAllComponentsCreated) onAllComponentsCreated();
  }, [allCreated, onAllComponentsCreated]);

  const handleCreateComponent = useCallback(
    async (mc: MissingComponent) => {
      setCreating((p) => ({ ...p, [mc.name]: true }));
      setError('');
      try {
        const result = await settingsService.generateComponent(mc.suggestedPrompt);
        const payload: CreateAgentComponentPayload = {
          name: (result.name as string) || mc.name,
          category:
            (result.category as CreateAgentComponentPayload['category']) || 'custom',
          description: (result.description as string) || mc.description,
          icon: 'Build',
          color: (result.color as string) || '#1976d2',
          configSchema: (result.configSchema as ConfigField[]) || [],
          defaultCode: (result.defaultCode as string) || '',
          status: 'active',
        };
        const created = await agentComponentService.create(payload);
        onComponentCreated(created);
        setCreated((p) => ({ ...p, [mc.name]: true }));
      } catch {
        setError(`Failed to create "${mc.name}"`);
      } finally {
        setCreating((p) => ({ ...p, [mc.name]: false }));
      }
    },
    [onComponentCreated]
  );

  const handleBuild = useCallback(() => {
    if (!workflow) return;
    setBuilding(true);
    setTimeout(() => {
      onBuildWorkflow(workflow);
      setBuilding(false);
    }, 300);
  }, [workflow, onBuildWorkflow]);

  return (
    <Box sx={{ mt: 1 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 1, py: 0 }} onClose={() => setError('')}>
          <Typography variant="caption">{error}</Typography>
        </Alert>
      )}
      {missingComponents.length > 0 && (
        <Box sx={{ mb: 1 }}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}
          >
            Missing Components:
          </Typography>
          {missingComponents.map((mc) => (
            <Box
              key={mc.name}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 0.75,
                mb: 0.5,
                borderRadius: 1,
                border: '1px solid',
                borderColor: effectiveCreated[mc.name] ? 'success.light' : 'divider',
                bgcolor: effectiveCreated[mc.name] ? 'success.50' : 'background.default',
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }} noWrap>
                  {mc.name}
                </Typography>
                <Chip
                  label={mc.category}
                  size="small"
                  sx={{ ml: 0.5, height: 16, fontSize: 9 }}
                />
              </Box>
              {effectiveCreated[mc.name] ? (
                <CheckIcon color="success" sx={{ fontSize: 16 }} />
              ) : (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={
                    creating[mc.name] ? <CircularProgress size={12} /> : <AddIcon />
                  }
                  onClick={() => handleCreateComponent(mc)}
                  disabled={creating[mc.name]}
                  sx={{ fontSize: 10, py: 0, px: 1, minWidth: 0 }}
                >
                  {creating[mc.name] ? '...' : 'Create'}
                </Button>
              )}
            </Box>
          ))}
        </Box>
      )}
      {workflow && (
        <Button
          variant="contained"
          color="success"
          size="small"
          startIcon={building ? <CircularProgress size={14} /> : <BuildIcon />}
          onClick={handleBuild}
          disabled={building}
          fullWidth
          sx={{ mt: 0.5 }}
        >
          {building ? 'Building...' : `Build Workflow (${workflow.nodes.length} nodes)`}
        </Button>
      )}
      {creating && Object.values(creating).some(Boolean) && (
        <LinearProgress sx={{ mt: 0.5, borderRadius: 1 }} />
      )}
    </Box>
  );
};

export default BuilderChatActions;
