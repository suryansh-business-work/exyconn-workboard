import { useState } from 'react';
import { Box, IconButton, Tooltip, CircularProgress, Typography } from '@mui/material';
import {
  PlayArrow as RunIcon,
  BugReport as SyntaxIcon,
  FormatAlignLeft as FormatIcon,
  Fullscreen as ExpandIcon,
} from '@mui/icons-material';
import { executeCode, ExecutionResult } from './codeExecutor';

interface Props {
  code: string;
  onChange: (code: string) => void;
  onResult?: (result: ExecutionResult) => void;
  onExpand?: () => void;
  context?: Record<string, string>;
}

const CodeEditorToolbar = ({ code, onChange, onResult, onExpand, context }: Props) => {
  const [running, setRunning] = useState(false);
  const [syntaxOk, setSyntaxOk] = useState<boolean | null>(null);

  const handleSyntaxCheck = () => {
    try {
      new Function(code);
      setSyntaxOk(true);
      setTimeout(() => setSyntaxOk(null), 2000);
    } catch (e) {
      setSyntaxOk(false);
      if (onResult) {
        onResult({ success: false, error: String(e), logs: [], duration: 0 });
      }
    }
  };

  const handleFormat = () => {
    // Basic formatting — normalize indentation
    try {
      const lines = code.split('\n');
      let indent = 0;
      const formatted = lines.map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')'))
          indent--;
        if (indent < 0) indent = 0;
        const result = '  '.repeat(indent) + trimmed;
        if (trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('('))
          indent++;
        return result;
      });
      onChange(formatted.join('\n'));
    } catch {
      // keep as is
    }
  };

  const handleExecute = async () => {
    setRunning(true);
    const result = await executeCode(code, {
      config: context || {},
      nodeId: 'test',
      nodeName: 'Test Run',
      category: 'test',
      inputs: {},
    });
    if (onResult) onResult(result);
    setRunning(false);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
      <Tooltip title="Syntax Check">
        <IconButton
          size="small"
          onClick={handleSyntaxCheck}
          color={syntaxOk === true ? 'success' : syntaxOk === false ? 'error' : 'default'}
        >
          <SyntaxIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Format Code">
        <IconButton size="small" onClick={handleFormat}>
          <FormatIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Execute Code">
        <span>
          <IconButton
            size="small"
            color="success"
            onClick={handleExecute}
            disabled={running || !code.trim()}
          >
            {running ? <CircularProgress size={16} /> : <RunIcon sx={{ fontSize: 18 }} />}
          </IconButton>
        </span>
      </Tooltip>
      {onExpand && (
        <Tooltip title="Full Screen">
          <IconButton size="small" onClick={onExpand}>
            <ExpandIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      )}
      {syntaxOk === true && (
        <Typography variant="caption" color="success.main" sx={{ ml: 0.5, fontSize: 10 }}>
          ✓ Valid
        </Typography>
      )}
    </Box>
  );
};

export default CodeEditorToolbar;
