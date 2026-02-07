import {
  Paper, Typography, TextField, Button, Box, IconButton, Divider,
} from '@mui/material';
import { Delete as DeleteIcon, Close as CloseIcon } from '@mui/icons-material';
import { Node } from '@xyflow/react';
import { useMemo } from 'react';
import { AgentComponent, ConfigField } from '../../types';
import type { AgentNodeData } from './useAgentBuilder';
import MonacoCodeField from './MonacoCodeField';
import CustomConfigFields from './CustomConfigFields';

interface Props {
  node: Node<AgentNodeData>;
  components: AgentComponent[];
  onUpdateConfig: (nodeId: string, config: Record<string, string>) => void;
  onDelete: (nodeId: string) => void;
  onClose: () => void;
}

const NodeConfigPanel = ({ node, components, onUpdateConfig, onDelete, onClose }: Props) => {
  const config = node.data?.config ?? {};
  const category = node.data?.category ?? '';
  const isCodeNode = category === 'logic' || category === 'custom';

  const component = useMemo(
    () => components.find((c) => c.id === node.data.componentId),
    [components, node.data.componentId]
  );

  const handleChange = (key: string, value: string) => {
    onUpdateConfig(node.id, { ...config, [key]: value });
  };

  const schema: ConfigField[] = component?.configSchema || [];

  return (
    <Paper
      variant="outlined"
      sx={{ width: 320, minWidth: 320, height: '100%', overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column' }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Configure Node</Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: node.data?.color }} />
        <Typography variant="body1" sx={{ fontWeight: 600 }}>{node.data?.componentName ?? 'Node'}</Typography>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
        Category: {category}
      </Typography>

      {schema.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
          {schema.map((field) => (
            <TextField
              key={field.key}
              label={field.label}
              type={field.type === 'password' ? 'password' : field.type === 'number' ? 'number' : 'text'}
              multiline={field.type === 'textarea'}
              rows={field.type === 'textarea' ? 3 : undefined}
              select={field.type === 'select'}
              required={field.required}
              placeholder={field.placeholder}
              value={config[field.key] || field.defaultValue || ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
              size="small"
              fullWidth
              slotProps={field.type === 'select' ? { select: { native: true } } : undefined}
            >
              {field.type === 'select' && (
                <>
                  <option value="">Select...</option>
                  {field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </>
              )}
            </TextField>
          ))}
        </Box>
      )}

      {isCodeNode && (
        <Box sx={{ mb: 2 }}>
          <MonacoCodeField
            label="Custom Logic"
            value={config._code || '// Write your custom logic here\n'}
            onChange={(val) => handleChange('_code', val)}
          />
        </Box>
      )}

      {category === 'custom' && (
        <Box sx={{ mb: 2 }}>
          <CustomConfigFields
            config={config}
            onChange={(newConfig) => onUpdateConfig(node.id, newConfig)}
          />
        </Box>
      )}

      {schema.length === 0 && !isCodeNode && category !== 'custom' && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          This component has no configuration fields.
        </Typography>
      )}

      <Box sx={{ mt: 'auto', pt: 2 }}>
        <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />}
          onClick={() => onDelete(node.id)} fullWidth>
          Remove Node
        </Button>
      </Box>
    </Paper>
  );
};

export default NodeConfigPanel;
