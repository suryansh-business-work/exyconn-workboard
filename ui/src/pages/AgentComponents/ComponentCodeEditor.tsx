import { useState } from 'react';
import { Box, Typography, Button, Tooltip } from '@mui/material';
import { Fullscreen as FullscreenIcon } from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import AICodePrompt from '../AgentBuilder/AICodePrompt';
import FullScreenCodeEditor from '../AgentBuilder/FullScreenCodeEditor';

interface Props {
  code: string;
  onChange: (code: string) => void;
}

const DEFAULT_CODE = `// Agent component logic
// Access config via: context.config
// Access workflow data via: context.data
// Return result: return { success: true, data: ... }

async function execute(context) {
  const { config, data } = context;
  
  // Your logic here
  
  return { success: true };
}
`;

const ComponentCodeEditor = ({ code, onChange }: Props) => {
  const [fullScreen, setFullScreen] = useState(false);
  const currentCode = code || DEFAULT_CODE;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Default Code (JavaScript)
        </Typography>
        <Tooltip title="Full Screen Editor">
          <Button size="small" startIcon={<FullscreenIcon />} onClick={() => setFullScreen(true)}>
            Expand
          </Button>
        </Tooltip>
      </Box>
      <AICodePrompt currentCode={currentCode} onCodeGenerated={onChange} />
      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
        <Editor
          height={180}
          language="javascript"
          value={currentCode}
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
      <FullScreenCodeEditor
        open={fullScreen}
        title="Component Code Editor"
        code={currentCode}
        onChange={onChange}
        onClose={() => setFullScreen(false)}
      />
    </Box>
  );
};

export { DEFAULT_CODE };
export default ComponentCodeEditor;
