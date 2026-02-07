import { Box, Button, Typography, Chip } from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as BackIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Props {
  agentName: string;
  saving: boolean;
  executing: boolean;
  nodeCount: number;
  onSave: () => void;
  onExecute: () => void;
  onStop: () => void;
}

const BuilderToolbar = ({
  agentName, saving, executing, nodeCount,
  onSave, onExecute, onStop,
}: Props) => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.5,
        py: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        flexWrap: 'wrap',
      }}
    >
      <Button size="small" startIcon={<BackIcon />} onClick={() => navigate('/agents')}>
        Back
      </Button>
      <Typography variant="h6" sx={{ fontWeight: 700, flex: 1, fontSize: { xs: 14, sm: 18 } }} noWrap>
        {agentName} — Builder
      </Typography>
      <Chip label={`${nodeCount} nodes`} size="small" variant="outlined" />
      {executing ? (
        <Button
          variant="contained"
          color="error"
          startIcon={<StopIcon />}
          onClick={onStop}
          size="small"
        >
          Stop
        </Button>
      ) : (
        <Button
          variant="outlined"
          color="success"
          startIcon={<PlayIcon />}
          onClick={onExecute}
          disabled={nodeCount === 0}
          size="small"
        >
          Run
        </Button>
      )}
      <Button
        variant="contained"
        startIcon={<SaveIcon />}
        onClick={onSave}
        disabled={saving}
        size="small"
      >
        {saving ? 'Saving...' : 'Save'}
      </Button>
    </Box>
  );
};

export default BuilderToolbar;
