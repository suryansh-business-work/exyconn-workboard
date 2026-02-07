import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import { AutoAwesome as AIIcon } from '@mui/icons-material';
import { settingsService } from '../../services';
import { CreateAgentComponentPayload, ConfigField } from '../../types';
import ComponentCodeEditor from './ComponentCodeEditor';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAgentComponentPayload) => void;
}

const AIComponentDialog = ({ open, onClose, onSubmit }: Props) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState<CreateAgentComponentPayload | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await settingsService.generateComponent(prompt);
      const comp: CreateAgentComponentPayload = {
        name: (result.name as string) || '',
        category:
          (result.category as CreateAgentComponentPayload['category']) || 'custom',
        description: (result.description as string) || '',
        icon: 'Build',
        color: (result.color as string) || '#1976d2',
        configSchema: (result.configSchema as ConfigField[]) || [],
        defaultCode: (result.defaultCode as string) || '',
        status: 'active',
      };
      setGenerated(comp);
    } catch {
      setError('Failed to generate component. Check OpenAI settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPrompt('');
    setGenerated(null);
    setError('');
    onClose();
  };

  const handleSubmit = () => {
    if (generated) {
      onSubmit(generated);
      handleClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AIIcon color="primary" /> AI Component Generator
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        {error && (
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {!generated ? (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Describe the component you want to create. Be specific about what it should
              do.
            </Typography>
            <TextField
              multiline
              rows={4}
              fullWidth
              placeholder="E.g. Create a web scraper tool that fetches content from a given URL using the fetch API, extracts the page title and main text content, and returns them as structured data."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
            />
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={16} /> : <AIIcon />}
              onClick={handleGenerate}
              disabled={!prompt.trim() || loading}
              sx={{ mt: 1 }}
              fullWidth
            >
              {loading ? 'Generating...' : 'Generate Component'}
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="success">Component generated! Review and save.</Alert>
            <TextField
              label="Name"
              value={generated.name}
              onChange={(e) => setGenerated({ ...generated, name: e.target.value })}
              fullWidth
              size="small"
            />
            <TextField
              label="Description"
              value={generated.description}
              onChange={(e) =>
                setGenerated({ ...generated, description: e.target.value })
              }
              multiline
              rows={2}
              fullWidth
              size="small"
            />
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip label={generated.category} color="primary" size="small" />
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  backgroundColor: generated.color,
                }}
              />
              <Typography variant="caption">
                {generated.configSchema.length} config fields
              </Typography>
            </Box>
            <ComponentCodeEditor
              code={generated.defaultCode}
              onChange={(code) => setGenerated({ ...generated, defaultCode: code })}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        {generated && (
          <Button variant="contained" onClick={handleSubmit}>
            Save Component
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AIComponentDialog;
