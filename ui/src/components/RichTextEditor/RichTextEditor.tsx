import {
  DefaultEditor,
  BtnBold,
  BtnItalic,
  BtnUnderline,
  BtnLink,
  BtnBulletList,
  BtnNumberedList,
  Toolbar,
  EditorProvider,
} from 'react-simple-wysiwyg';
import { Box } from '@mui/material';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

const RichTextEditor = ({
  value,
  onChange,
  placeholder = 'Enter text...',
  minHeight = 150,
}: RichTextEditorProps) => {
  return (
    <Box
      sx={{
        '& .rsw-editor': {
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          minHeight,
          '&:focus-within': {
            borderColor: 'primary.main',
            outline: '1px solid',
            outlineColor: 'primary.main',
          },
        },
        '& .rsw-toolbar': {
          bgcolor: 'grey.50',
          borderBottom: '1px solid',
          borderColor: 'divider',
        },
        '& .rsw-btn': {
          padding: '6px 10px',
          '&:hover': { bgcolor: 'grey.200' },
        },
        '& .rsw-ce': {
          padding: '12px',
          minHeight: minHeight - 40,
        },
      }}
    >
      <EditorProvider>
        <DefaultEditor
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        >
          <Toolbar>
            <BtnBold />
            <BtnItalic />
            <BtnUnderline />
            <BtnLink />
            <BtnBulletList />
            <BtnNumberedList />
          </Toolbar>
        </DefaultEditor>
      </EditorProvider>
    </Box>
  );
};

export default RichTextEditor;
