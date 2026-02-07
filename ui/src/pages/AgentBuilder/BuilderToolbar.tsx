import { Box, Button, Typography, Chip } from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as BackIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Download as DownloadIcon,
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
  onDownload: () => void;
}

const BuilderToolbar = ({
  agentName,
  saving,
  executing,
  nodeCount,
  onSave,
  onExecute,
  onStop,
  onDownload,
}: Props) => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1,
        py: 0.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        flexWrap: 'wrap',
      }}
    >
      <Button
        size="small"
        startIcon={<BackIcon />}
        onClick={() => navigate('/agents')}
        sx={{ minWidth: 0 }}
      >
        Back
      </Button>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 700, flex: 1, fontSize: { xs: 13, sm: 16 } }}
        noWrap
      >
        {agentName}
      </Typography>
      <Chip
        label={`${nodeCount}`}
        size="small"
        variant="outlined"
        sx={{ height: 22, fontSize: 11 }}
      />
      <Button
        size="small"
        startIcon={<DownloadIcon />}
        onClick={onDownload}
        sx={{ minWidth: 0, fontSize: 12 }}
      >
        Export
      </Button>
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
