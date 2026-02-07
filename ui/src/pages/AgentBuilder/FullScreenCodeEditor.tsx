import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Chip,
  Typography,
} from '@mui/material';
import { Fullscreen as FullscreenIcon } from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import AICodePrompt from './AICodePrompt';
import CodeEditorToolbar from './CodeEditorToolbar';
import type { ExecutionResult } from './codeExecutor';

interface Props {
  open: boolean;
  title: string;
  code: string;
  onChange: (code: string) => void;
  onClose: () => void;
}

const FullScreenCodeEditor = ({ open, title, code, onChange, onClose }: Props) => {
  const [result, setResult] = useState<ExecutionResult | null>(null);

  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      <DialogTitle
        sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1, maxHeight: 55 }}
      >
        <FullscreenIcon color="primary" fontSize="small" />
        {title}
      </DialogTitle>
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ px: 2, pt: 1 }}>
          <AICodePrompt currentCode={code} onCodeGenerated={onChange} />
          <CodeEditorToolbar code={code} onChange={onChange} onResult={setResult} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Editor
            height="100%"
            language="javascript"
            value={code}
            onChange={(val) => onChange(val ?? '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              tabSize: 2,
              automaticLayout: true,
            }}
          />
        </Box>
        {result && (
          <Box
            sx={{
              px: 2,
              py: 1,
              borderTop: '1px solid',
              borderColor: 'divider',
              maxHeight: 160,
              overflow: 'auto',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Chip
                label={result.success ? 'Success' : 'Error'}
                color={result.success ? 'success' : 'error'}
                size="small"
              />
              {result.duration > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {result.duration.toFixed(0)}ms
                </Typography>
              )}
            </Box>
            {result.error && (
              <Typography
                variant="body2"
                color="error"
                sx={{ fontFamily: 'monospace', mb: 0.5 }}
              >
                {result.error}
              </Typography>
            )}
            {result.logs.length > 0 && (
              <Box sx={{ bgcolor: '#1e1e1e', borderRadius: 1, p: 1, mb: 0.5 }}>
                {result.logs.map((l, i) => (
                  <Typography
                    key={i}
                    variant="caption"
                    sx={{
                      display: 'block',
                      fontFamily: 'monospace',
                      fontSize: 12,
                      color: '#d4d4d4',
                    }}
                  >
                    {l}
                  </Typography>
                ))}
              </Box>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
              Return:{' '}
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
              {result.result !== undefined && result.result !== null
                ? typeof result.result === 'object'
                  ? JSON.stringify(result.result, null, 2)
                  : String(result.result)
                : 'undefined'}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FullScreenCodeEditor;
