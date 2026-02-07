import { useState } from 'react';
import { Box, Button, Tooltip, Typography, Chip } from '@mui/material';
import { Fullscreen as FullscreenIcon } from '@mui/icons-material';
import MonacoCodeField from './MonacoCodeField';
import AICodePrompt from './AICodePrompt';
import FullScreenCodeEditor from './FullScreenCodeEditor';
import type { ExecutionResult } from './codeExecutor';

interface Props {
  code: string;
  onChange: (code: string) => void;
  lastResult?: ExecutionResult;
}

const NodeCodeSection = ({ code, onChange, lastResult }: Props) => {
  const [fullScreen, setFullScreen] = useState(false);

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>Custom Logic</Typography>
        <Tooltip title="Full Screen">
          <Button size="small" startIcon={<FullscreenIcon />} onClick={() => setFullScreen(true)}>
            Expand
          </Button>
        </Tooltip>
      </Box>
      <AICodePrompt currentCode={code} onCodeGenerated={onChange} />
      <MonacoCodeField
        label=""
        value={code || '// Write your custom logic here\n'}
        onChange={onChange}
      />
      {lastResult && (
        <Box sx={{ mt: 1 }}>
          <Chip
            label={lastResult.success ? 'Success' : 'Error'}
            color={lastResult.success ? 'success' : 'error'}
            size="small"
            sx={{ mb: 0.5 }}
          />
          {lastResult.logs.length > 0 && (
            <Box
              sx={{
                mt: 0.5,
                p: 1,
                backgroundColor: '#1e1e1e',
                borderRadius: 1,
                maxHeight: 100,
                overflow: 'auto',
              }}
            >
              {lastResult.logs.map((log, i) => (
                <Typography key={i} variant="caption" sx={{ color: '#d4d4d4', display: 'block', fontFamily: 'monospace', fontSize: 10 }}>
                  {log}
                </Typography>
              ))}
            </Box>
          )}
          {lastResult.error && (
            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
              {lastResult.error}
            </Typography>
          )}
        </Box>
      )}
      <FullScreenCodeEditor
        open={fullScreen}
        title="Node Code Editor"
        code={code || '// Write your custom logic here\n'}
        onChange={onChange}
        onClose={() => setFullScreen(false)}
      />
    </Box>
  );
};

export default NodeCodeSection;
