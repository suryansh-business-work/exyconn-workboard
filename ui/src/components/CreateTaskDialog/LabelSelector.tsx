import { TextField, Button, Chip, Box } from '@mui/material';

interface LabelSelectorProps {
  labels: string[];
  labelInput: string;
  onLabelInputChange: (val: string) => void;
  onAddLabel: () => void;
  onToggleLabel: (label: string) => void;
  onRemoveLabel: (label: string) => void;
}

const defaultLabels = ['bug', 'feature', 'enhancement', 'documentation', 'urgent'];

const LabelSelector = ({
  labels,
  labelInput,
  onLabelInputChange,
  onAddLabel,
  onToggleLabel,
  onRemoveLabel,
}: LabelSelectorProps) => {
  return (
    <Box className="create-task__labels">
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <TextField
          label="Add Label"
          size="small"
          value={labelInput}
          onChange={(e) => onLabelInputChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onAddLabel()}
        />
        <Button variant="outlined" onClick={onAddLabel}>
          Add
        </Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
        {defaultLabels.map((label) => (
          <Chip
            key={label}
            label={label}
            size="small"
            variant={labels.includes(label) ? 'filled' : 'outlined'}
            onClick={() => onToggleLabel(label)}
          />
        ))}
      </Box>
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {labels
          .filter((l) => !defaultLabels.includes(l))
          .map((label) => (
            <Chip
              key={label}
              label={label}
              size="small"
              onDelete={() => onRemoveLabel(label)}
            />
          ))}
      </Box>
    </Box>
  );
};

export default LabelSelector;
