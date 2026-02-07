import { useState } from 'react';
import { Box, TextField, IconButton, Typography, Button } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface Props {
  config: Record<string, string>;
  onChange: (config: Record<string, string>) => void;
}

const CustomConfigFields = ({ config, onChange }: Props) => {
  const [newKey, setNewKey] = useState('');

  const entries = Object.entries(config).filter(([key]) => key !== '_code');

  const handleAdd = () => {
    const trimmed = newKey.trim();
    if (!trimmed || config[trimmed] !== undefined) return;
    onChange({ ...config, [trimmed]: '' });
    setNewKey('');
  };

  const handleChange = (key: string, value: string) => {
    onChange({ ...config, [key]: value });
  };

  const handleRemove = (key: string) => {
    const updated = { ...config };
    delete updated[key];
    onChange(updated);
  };

  return (
    <Box>
      <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
        Custom Fields
      </Typography>
      {entries.map(([key, value]) => (
        <Box key={key} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
          <TextField size="small" label="Key" value={key} disabled sx={{ flex: 1 }} />
          <TextField
            size="small"
            label="Value"
            value={value}
            onChange={(e) => handleChange(key, e.target.value)}
            sx={{ flex: 2 }}
          />
          <IconButton size="small" color="error" onClick={() => handleRemove(key)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          size="small"
          label="New field key"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          sx={{ flex: 1 }}
        />
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          disabled={!newKey.trim()}
        >
          Add
        </Button>
      </Box>
    </Box>
  );
};

export default CustomConfigFields;
