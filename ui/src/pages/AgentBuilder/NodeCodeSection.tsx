import { useState } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import MonacoCodeField from './MonacoCodeField';
import AICodePrompt from './AICodePrompt';
import FullScreenCodeEditor from './FullScreenCodeEditor';
import CodeEditorToolbar from './CodeEditorToolbar';
import type { ExecutionResult } from './codeExecutor';

interface Props {
  code: string;
  onChange: (code: string) => void;
  lastResult?: ExecutionResult;
  nodeConfig?: Record<string, string>;
}

const NodeCodeSection = ({ code, onChange, lastResult, nodeConfig }: Props) => {
  const [fullScreen, setFullScreen] = useState(false);
  const [localResult, setLocalResult] = useState<ExecutionResult | null>(null);
  const displayResult = localResult || lastResult;

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
        Custom Logic
      </Typography>
      <AICodePrompt currentCode={code} onCodeGenerated={onChange} />
      <CodeEditorToolbar
        code={code || ''}
        onChange={onChange}
        onResult={setLocalResult}
        onExpand={() => setFullScreen(true)}
        context={nodeConfig}
      />
      <MonacoCodeField
        label=""
        value={code || '// Write your custom logic here\n'}
        onChange={onChange}
        height={160}
      />
      {displayResult && (
        <Box
          sx={{
            mt: 1,
            border: '1px solid',
            borderColor: displayResult.success ? 'success.light' : 'error.light',
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1,
              py: 0.5,
              bgcolor: displayResult.success ? 'success.50' : 'error.50',
            }}
          >
            <Chip
              label={displayResult.success ? 'Success' : 'Error'}
              color={displayResult.success ? 'success' : 'error'}
              size="small"
              sx={{ height: 20, fontSize: 10 }}
            />
            {displayResult.duration > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                {displayResult.duration.toFixed(0)}ms
              </Typography>
            )}
          </Box>
          {displayResult.error && (
            <Box sx={{ px: 1, py: 0.5, bgcolor: '#fff5f5' }}>
              <Typography
                variant="caption"
                color="error"
                sx={{ fontFamily: 'monospace', fontSize: 11, wordBreak: 'break-word' }}
              >
                {displayResult.error}
              </Typography>
            </Box>
          )}
          {displayResult.logs.length > 0 && (
            <Box
              sx={{
                px: 1,
                py: 0.5,
                backgroundColor: '#1e1e1e',
                maxHeight: 100,
                overflow: 'auto',
              }}
            >
              <Typography
                variant="caption"
                color="#888"
                sx={{ fontSize: 9, display: 'block', mb: 0.3 }}
              >
                Console Output:
              </Typography>
              {displayResult.logs.map((log, i) => (
                <Typography
                  key={i}
                  variant="caption"
                  sx={{
                    color: '#d4d4d4',
                    display: 'block',
                    fontFamily: 'monospace',
                    fontSize: 11,
                    lineHeight: 1.4,
                  }}
                >
                  {log}
                </Typography>
              ))}
            </Box>
          )}
          <Box sx={{ px: 1, py: 0.5, bgcolor: '#f8f8f8' }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: 9, display: 'block' }}
            >
              Return Value:
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontFamily: 'monospace', fontSize: 11, wordBreak: 'break-word' }}
            >
              {displayResult.result !== undefined && displayResult.result !== null
                ? typeof displayResult.result === 'object'
                  ? JSON.stringify(displayResult.result, null, 2)
                  : String(displayResult.result)
                : 'undefined'}
            </Typography>
          </Box>
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
