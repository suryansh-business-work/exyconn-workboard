import { Box, TextField, IconButton } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

interface AIChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
  multiline?: boolean;
}

const AIChatInput = ({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
  multiline = true,
}: AIChatInputProps) => {
  return (
    <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
      <TextField
        fullWidth
        size="small"
        multiline={multiline}
        maxRows={4}
        placeholder={`${placeholder} (Shift+Enter for new line)`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        InputProps={{
          endAdornment: (
            <IconButton
              size="small"
              onClick={onSend}
              disabled={disabled || !value.trim()}
              color="primary"
            >
              <SendIcon fontSize="small" />
            </IconButton>
          ),
        }}
      />
    </Box>
  );
};

export default AIChatInput;
