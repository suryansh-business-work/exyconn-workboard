import { useState, useRef } from 'react';
import {
  Box,
  Button,
  IconButton,
  CircularProgress,
  Typography,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
} from '@mui/icons-material';
import { uploadService } from '../../services';

interface UploadedFile {
  url: string;
  name: string;
  type: 'image' | 'document';
}

interface FileUploaderProps {
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  accept?: string;
  maxFiles?: number;
  label?: string;
}

const getFileIcon = (url: string, type: string) => {
  if (type === 'image') return <ImageIcon fontSize="small" />;
  if (url.includes('.pdf')) return <PdfIcon fontSize="small" />;
  if (url.includes('.doc')) return <DocIcon fontSize="small" />;
  return <FileIcon fontSize="small" />;
};

const isImageFile = (file: File) => file.type.startsWith('image/');

const FileUploader = ({
  files,
  onChange,
  accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt',
  maxFiles = 10,
  label = 'Upload Files',
}: FileUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles?.length) return;

    if (files.length + selectedFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = Array.from(selectedFiles).map(async (file) => {
        const result = await uploadService.uploadImage(file);
        return {
          url: result.url,
          name: file.name,
          type: isImageFile(file) ? 'image' : 'document',
        } as UploadedFile;
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      onChange([...files, ...uploadedFiles]);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <Box>
      <Button
        variant="outlined"
        component="label"
        startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
        disabled={uploading || files.length >= maxFiles}
        sx={{ mb: 1 }}
      >
        {uploading ? 'Uploading...' : label}
        <input
          ref={inputRef}
          type="file"
          hidden
          multiple
          accept={accept}
          onChange={handleUpload}
        />
      </Button>

      {files.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
          {files.map((file, idx) => (
            <Paper
              key={idx}
              variant="outlined"
              sx={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 1,
              }}
            >
              {file.type === 'image' ? (
                <Box sx={{ width: 80, height: 80 }}>
                  <img
                    src={file.url}
                    alt={file.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
              ) : (
                <Tooltip title={file.name}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.100',
                      p: 1,
                    }}
                  >
                    {getFileIcon(file.url, file.type)}
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 0.5,
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {file.name.length > 10 ? `${file.name.slice(0, 8)}...` : file.name}
                    </Typography>
                  </Box>
                </Tooltip>
              )}
              <IconButton
                size="small"
                onClick={() => handleRemove(idx)}
                sx={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                  '&:hover': { bgcolor: 'error.light', color: 'white' },
                }}
              >
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default FileUploader;
