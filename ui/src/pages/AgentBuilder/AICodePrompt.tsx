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
      const config = await settingsService.getOpenAIConfig();
      if (!config?.apiKey) return;

      const systemPrompt = `You are a JavaScript code generator for an agent workflow builder. Generate ONLY valid JavaScript code — no explanations, no markdown, no code fences. The code runs in a sandboxed Web Worker with a "context" object containing node config and workflow data. Current code:\n${currentCode || '// empty'}`;

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.openAIModel || 'gpt-4o-mini',
          max_tokens: config.maxTokens || 1500,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: trimmed },
          ],
        }),
      });
      const data = await res.json();
      const generated = data.choices?.[0]?.message?.content || '';
      const cleaned = generated.replace(/^```[\w]*\n?/gm, '').replace(/```$/gm, '').trim();
      if (cleaned) onCodeGenerated(cleaned);
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
