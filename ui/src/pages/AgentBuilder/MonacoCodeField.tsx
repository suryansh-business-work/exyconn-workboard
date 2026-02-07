import { Box, Typography } from '@mui/material';
import Editor from '@monaco-editor/react';

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: number;
}

const MonacoCodeField = ({
  label,
  value,
  onChange,
  language = 'javascript',
  height = 200,
}: Props) => {
  return (
    <Box>
      <Typography variant="caption" sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
        {label}
      </Typography>
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <Editor
          height={height}
          language={language}
          value={value}
          onChange={(val) => onChange(val ?? '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 12,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 2,
            automaticLayout: true,
          }}
        />
      </Box>
    </Box>
  );
};

export default MonacoCodeField;
