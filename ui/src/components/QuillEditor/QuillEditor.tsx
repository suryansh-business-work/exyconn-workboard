import { useMemo } from 'react';
import ReactQuill from 'react-quill-new';
import 'quill/dist/quill.snow.css';
import { Box, SxProps, Theme } from '@mui/material';

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  readOnly?: boolean;
  sx?: SxProps<Theme>;
}

const QuillEditor = ({
  value,
  onChange,
  placeholder = 'Enter text...',
  minHeight = 150,
  readOnly = false,
  sx,
}: QuillEditorProps) => {
  const modules = useMemo(
    () => ({
      toolbar: readOnly
        ? false
        : [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'blockquote', 'code-block'],
            ['clean'],
          ],
    }),
    [readOnly]
  );

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'link',
    'blockquote',
    'code-block',
  ];

  return (
    <Box
      sx={{
        '& .quill': {
          display: 'flex',
          flexDirection: 'column',
        },
        '& .ql-toolbar': {
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
          bgcolor: 'grey.50',
          borderColor: 'divider',
        },
        '& .ql-container': {
          borderBottomLeftRadius: 4,
          borderBottomRightRadius: 4,
          borderColor: 'divider',
          minHeight,
          fontSize: '14px',
        },
        '& .ql-editor': {
          minHeight: minHeight - 42,
        },
        '& .ql-editor.ql-blank::before': {
          fontStyle: 'normal',
          color: 'text.secondary',
        },
        ...sx,
      }}
    >
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        readOnly={readOnly}
      />
    </Box>
  );
};

export default QuillEditor;
