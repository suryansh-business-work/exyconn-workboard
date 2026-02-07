import { useState } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import Editor from '@monaco-editor/react';
import AICodePrompt from '../AgentBuilder/AICodePrompt';
import FullScreenCodeEditor from '../AgentBuilder/FullScreenCodeEditor';
import CodeEditorToolbar from '../AgentBuilder/CodeEditorToolbar';
import type { ExecutionResult } from '../AgentBuilder/codeExecutor';

interface Props {
  code: string;
  onChange: (code: string) => void;
}

const DEFAULT_CODE = `// Agent component logic\n// Access: context.config, context.inputs\n// Return result to pass to downstream nodes\n\nconst { config, inputs } = context;\n\n// Your logic here\nconsole.log('Running component...');\nreturn { success: true };\n`;

const ComponentCodeEditor = ({ code, onChange }: Props) => {
  const [fullScreen, setFullScreen] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const currentCode = code || DEFAULT_CODE;

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
        Default Code (JavaScript)
      </Typography>
      <AICodePrompt currentCode={currentCode} onCodeGenerated={onChange} />
      <CodeEditorToolbar
        code={currentCode}
        onChange={onChange}
        onResult={setResult}
        onExpand={() => setFullScreen(true)}
      />
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
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
      {result && (
        <Box sx={{ mt: 0.5 }}>
          <Chip
            label={result.success ? '✓ Pass' : '✗ Error'}
            color={result.success ? 'success' : 'error'}
            size="small"
          />
          {result.error && (
            <Typography variant="caption" color="error" sx={{ ml: 1 }}>
              {result.error}
            </Typography>
          )}
          {result.logs.length > 0 && (
            <Box sx={{ mt: 0.5, p: 0.5, backgroundColor: '#1e1e1e', borderRadius: 1 }}>
              {result.logs.map((l, i) => (
                <Typography
                  key={i}
                  variant="caption"
                  sx={{
                    color: '#d4d4d4',
                    fontFamily: 'monospace',
                    fontSize: 10,
                    display: 'block',
                  }}
                >
                  {l}
                </Typography>
              ))}
            </Box>
          )}
        </Box>
      )}
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
