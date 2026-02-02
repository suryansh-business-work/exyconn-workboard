import {
  Button,
  Box,
  IconButton,
  CircularProgress,
  Typography,
  Link,
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudUpload as UploadIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
} from '@mui/icons-material';

interface AttachmentUploaderProps {
  images: string[];
  uploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
}

const getFileType = (url: string): 'image' | 'pdf' | 'doc' | 'other' => {
  const ext = url.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return 'image';
  if (ext === 'pdf') return 'pdf';
  if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv'].includes(ext))
    return 'doc';
  return 'other';
};

const getFileName = (url: string): string => {
  const parts = url.split('/');
  return parts[parts.length - 1] || 'File';
};

const FileIcon_ = ({ type }: { type: 'image' | 'pdf' | 'doc' | 'other' }) => {
  switch (type) {
    case 'image':
      return <ImageIcon sx={{ fontSize: 40, color: 'primary.main' }} />;
    case 'pdf':
      return <PdfIcon sx={{ fontSize: 40, color: 'error.main' }} />;
    case 'doc':
      return <DocIcon sx={{ fontSize: 40, color: 'info.main' }} />;
    default:
      return <FileIcon sx={{ fontSize: 40, color: 'grey.500' }} />;
  }
};

const ImageUploader = ({
  images,
  uploading,
  onUpload,
  onRemove,
}: AttachmentUploaderProps) => {
  return (
    <Box className="create-task__images">
      <Button
        variant="outlined"
        component="label"
        startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
        disabled={uploading}
      >
        {uploading ? 'Uploading...' : 'Upload Attachments'}
        <input
          type="file"
          hidden
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
          onChange={onUpload}
        />
      </Button>
      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
        Images, PDFs, Documents
      </Typography>
      {images.length > 0 && (
        <Box className="create-task__image-preview">
          {images.map((url, index) => {
            const fileType = getFileType(url);
            const fileName = getFileName(url);
            const isImage = fileType === 'image';

            return (
              <Box key={index} className="create-task__image-item">
                {isImage ? (
                  <img src={url} alt={`Upload ${index + 1}`} />
                ) : (
                  <Link
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                      textDecoration: 'none',
                      p: 1,
                    }}
                  >
                    <FileIcon_ type={fileType} />
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 0.5,
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        textAlign: 'center',
                      }}
                    >
                      {fileName.length > 15 ? fileName.slice(0, 12) + '...' : fileName}
                    </Typography>
                  </Link>
                )}
                <IconButton
                  size="small"
                  className="create-task__image-remove"
                  onClick={() => onRemove(index)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default ImageUploader;
