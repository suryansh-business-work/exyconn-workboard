import { useState } from 'react';
import { Box, TextField, IconButton, CircularProgress, Tooltip } from '@mui/material';
import { AutoAwesome as AIIcon } from '@mui/icons-material';
import { settingsService } from '../../services';

interface Props {
  currentCode: string;
  onCodeGenerated: (code: string) => void;
}

const AICodePrompt = ({ currentCode, onCodeGenerated }: Props) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    const trimmed = prompt.trim();
    if (!trimmed || loading) return;
    try {
      setLoading(true);
      const { code } = await settingsService.generateCode(trimmed, currentCode);
      if (code) onCodeGenerated(code);
      setPrompt('');
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', mb: 1 }}>
      <TextField
        size="small"
        fullWidth
        placeholder="Describe what code to write..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleGenerate();
          }
        }}
        disabled={loading}
      />
      <Tooltip title="Generate code with AI">
        <span>
          <IconButton
            size="small"
            color="primary"
            onClick={handleGenerate}
            disabled={!prompt.trim() || loading}
          >
            {loading ? <CircularProgress size={18} /> : <AIIcon />}
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
};

export default AICodePrompt;
