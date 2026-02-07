import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material';
import { Fullscreen as FullscreenIcon } from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import AICodePrompt from './AICodePrompt';

interface Props {
  open: boolean;
  title: string;
  code: string;
  onChange: (code: string) => void;
  onClose: () => void;
}

const FullScreenCodeEditor = ({ open, title, code, onChange, onClose }: Props) => (
  <Dialog open={open} onClose={onClose} fullScreen>
    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1.5 }}>
      <FullscreenIcon color="primary" />
      {title}
    </DialogTitle>
    <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 2, pt: 1 }}>
        <AICodePrompt currentCode={code} onCodeGenerated={onChange} />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Editor
          height="100%"
          language="javascript"
          value={code}
          onChange={(val) => onChange(val ?? '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 2,
            automaticLayout: true,
          }}
        />
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} variant="contained">
        Done
      </Button>
    </DialogActions>
  </Dialog>
);

export default FullScreenCodeEditor;
