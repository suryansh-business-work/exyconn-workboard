import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Box, Typography, CircularProgress } from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import type { AgentNodeData } from './useAgentBuilder';

type ExecStatus = AgentNodeData['execStatus'];

const STATUS_STYLES: Record<NonNullable<ExecStatus>, { border: string; icon: React.ReactNode }> = {
  running: { border: '2px solid #f57c00', icon: <CircularProgress size={14} sx={{ color: '#f57c00' }} /> },
  success: { border: '2px solid #2e7d32', icon: <SuccessIcon sx={{ fontSize: 14, color: '#2e7d32' }} /> },
  error: { border: '2px solid #d32f2f', icon: <ErrorIcon sx={{ fontSize: 14, color: '#d32f2f' }} /> },
};

const AgentNode = ({ data, selected }: NodeProps & { data: AgentNodeData }) => {
  const config = data?.config ?? {};
  const configCount = Object.keys(config).length;
  const statusStyle = data?.execStatus ? STATUS_STYLES[data.execStatus] : null;

  return (
    <Box
      sx={{
        minWidth: 180,
        border: statusStyle?.border ?? (selected ? '2px solid #1976d2' : '1px solid #e0e0e0'),
        borderRadius: 2,
        backgroundColor: '#fff',
        boxShadow: selected ? 3 : 1,
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      <Box sx={{ px: 1.5, py: 0.75, backgroundColor: data?.color || '#1976d2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: 10 }}>
          {data?.category ?? 'unknown'}
        </Typography>
        {statusStyle?.icon}
      </Box>
      <Box sx={{ px: 1.5, py: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {data?.componentName ?? 'Unnamed'}
        </Typography>
        {configCount > 0 && (
          <Typography variant="caption" color="text.secondary">
            {configCount} field(s) configured
          </Typography>
        )}
      </Box>
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </Box>
  );
};

export default memo(AgentNode);
