import {
  Box,
  Button,
  IconButton,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  Typography,
  Paper,
  Divider,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { ConfigField } from '../../types';

interface Props {
  fields: ConfigField[];
  onChange: (fields: ConfigField[]) => void;
}

const FIELD_TYPES: ConfigField['type'][] = [
  'text',
  'password',
  'select',
  'number',
  'boolean',
  'textarea',
];

const emptyField: ConfigField = {
  key: '',
  label: '',
  type: 'text',
  required: false,
  placeholder: '',
  options: [],
  defaultValue: '',
};

const ConfigSchemaBuilder = ({ fields, onChange }: Props) => {
  const addField = () => onChange([...fields, { ...emptyField }]);

  const removeField = (index: number) => onChange(fields.filter((_, i) => i !== index));

  const updateField = (index: number, patch: Partial<ConfigField>) => {
    const updated = fields.map((f, i) => (i === index ? { ...f, ...patch } : f));
    onChange(updated);
  };

  const addOption = (index: number) => {
    const f = fields[index];
    updateField(index, { options: [...f.options, { label: '', value: '' }] });
  };

  const removeOption = (fIdx: number, oIdx: number) => {
    const f = fields[fIdx];
    updateField(fIdx, { options: f.options.filter((_, i) => i !== oIdx) });
  };

  const updateOption = (
    fIdx: number,
    oIdx: number,
    key: 'label' | 'value',
    val: string
  ) => {
    const f = fields[fIdx];
    const opts = f.options.map((o, i) => (i === oIdx ? { ...o, [key]: val } : o));
    updateField(fIdx, { options: opts });
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
        }}
      >
        <Typography variant="subtitle2">Config Schema</Typography>
        <Button size="small" startIcon={<AddIcon />} onClick={addField}>
          Add Field
        </Button>
      </Box>
      {fields.map((field, idx) => (
        <Paper key={idx} variant="outlined" sx={{ p: 1.5, mb: 1.5 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="small"
              label="Key"
              value={field.key}
              sx={{ flex: 1, minWidth: 100 }}
              onChange={(e) => updateField(idx, { key: e.target.value })}
            />
            <TextField
              size="small"
              label="Label"
              value={field.label}
              sx={{ flex: 1, minWidth: 100 }}
              onChange={(e) => updateField(idx, { label: e.target.value })}
            />
            <TextField
              size="small"
              select
              label="Type"
              value={field.type}
              sx={{ minWidth: 110 }}
              onChange={(e) =>
                updateField(idx, { type: e.target.value as ConfigField['type'] })
              }
            >
              {FIELD_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
            <FormControlLabel
              label="Required"
              control={
                <Switch
                  size="small"
                  checked={field.required}
                  onChange={(e) => updateField(idx, { required: e.target.checked })}
                />
              }
            />
            <IconButton size="small" color="error" onClick={() => removeField(idx)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              label="Placeholder"
              value={field.placeholder}
              sx={{ flex: 1 }}
              onChange={(e) => updateField(idx, { placeholder: e.target.value })}
            />
            <TextField
              size="small"
              label="Default Value"
              value={field.defaultValue}
              sx={{ flex: 1 }}
              onChange={(e) => updateField(idx, { defaultValue: e.target.value })}
            />
          </Box>
          {field.type === 'select' && (
            <Box sx={{ mt: 1 }}>
              <Divider sx={{ mb: 1 }} />
              <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>
                Options
              </Typography>
              {field.options.map((opt, oIdx) => (
                <Box
                  key={oIdx}
                  sx={{ display: 'flex', gap: 1, mb: 0.5, alignItems: 'center' }}
                >
                  <TextField
                    size="small"
                    label="Label"
                    value={opt.label}
                    onChange={(e) => updateOption(idx, oIdx, 'label', e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    size="small"
                    label="Value"
                    value={opt.value}
                    onChange={(e) => updateOption(idx, oIdx, 'value', e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <IconButton size="small" onClick={() => removeOption(idx, oIdx)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              <Button size="small" onClick={() => addOption(idx)}>
                Add Option
              </Button>
            </Box>
          )}
        </Paper>
      ))}
      {fields.length === 0 && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: 'center', py: 2 }}
        >
          No config fields. Click &quot;Add Field&quot; to define configuration options.
        </Typography>
      )}
    </Box>
  );
};

export default ConfigSchemaBuilder;
