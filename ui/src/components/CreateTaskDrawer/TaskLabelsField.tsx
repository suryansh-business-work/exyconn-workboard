import { useState } from 'react';
import { Box, TextField, Button, Chip } from '@mui/material';
import { DEFAULT_LABELS, TaskLabelsFieldProps } from './types';

const TaskLabelsField = ({ labels, onAdd, onRemove }: TaskLabelsFieldProps) => {
  const [labelInput, setLabelInput] = useState('');

  const handleAddLabel = () => {
    if (labelInput.trim()) {
      onAdd(labelInput.trim());
      setLabelInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && labelInput.trim()) {
      e.preventDefault();
      handleAddLabel();
    }
  };

  const handleToggleDefaultLabel = (label: string) => {
    if (labels.includes(label)) {
      onRemove(labels.indexOf(label));
    } else {
      onAdd(label);
    }
  };

  // Custom labels (not in default list)
  const customLabels = labels.filter((l) => !DEFAULT_LABELS.includes(l));

  return (
    <Box>
      {/* Label Input */}
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <TextField
          size="small"
          label="Add Label"
          value={labelInput}
          onChange={(e) => setLabelInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button variant="outlined" onClick={handleAddLabel}>
          Add
        </Button>
      </Box>

      {/* Default Labels */}
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
        {DEFAULT_LABELS.map((label) => (
          <Chip
            key={label}
            label={label}
            size="small"
            variant={labels.includes(label) ? 'filled' : 'outlined'}
            onClick={() => handleToggleDefaultLabel(label)}
          />
        ))}
      </Box>

      {/* Custom Labels */}
      {customLabels.length > 0 && (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {customLabels.map((label) => (
            <Chip
              key={label}
              label={label}
              size="small"
              onDelete={() => onRemove(labels.indexOf(label))}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default TaskLabelsField;
