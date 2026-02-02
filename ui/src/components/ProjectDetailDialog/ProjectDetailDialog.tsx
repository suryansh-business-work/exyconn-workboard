import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  Link as MuiLink,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Code as RepoIcon,
  Description as DocsIcon,
  Language as WebIcon,
} from '@mui/icons-material';
import { Project } from '../../types';

interface ProjectDetailDialogProps {
  open: boolean;
  onClose: () => void;
  project: Project | null;
}

const ProjectDetailDialog = ({ open, onClose, project }: ProjectDetailDialogProps) => {
  if (!project) return null;

  const renderLink = (url: string | undefined, label: string, icon: React.ReactNode) => {
    if (!url) return null;
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        {icon}
        <MuiLink
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ fontSize: 14 }}
        >
          {label}
        </MuiLink>
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Typography variant="h6" fontWeight={600}>
            {project.name}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {/* Owner */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Chip
            icon={<PersonIcon />}
            label={project.ownerName || 'No owner'}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>

        {/* Description */}
        {project.description && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Description
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 1,
                '& p': { margin: 0 },
                '& a': { color: 'primary.main' },
              }}
              dangerouslySetInnerHTML={{ __html: project.description }}
            />
          </Box>
        )}

        {/* Links Section */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Links
          </Typography>
          <Divider sx={{ mb: 1 }} />

          {renderLink(
            project.urlProd,
            'Production URL',
            <WebIcon fontSize="small" color="success" />
          )}
          {renderLink(
            project.urlStage,
            'Staging URL',
            <WebIcon fontSize="small" color="warning" />
          )}
          {renderLink(
            project.urlTest,
            'Test URL',
            <WebIcon fontSize="small" color="info" />
          )}
          {renderLink(
            project.repoUrl,
            'Repository',
            <RepoIcon fontSize="small" color="action" />
          )}
          {renderLink(
            project.docsUrl,
            'Documentation',
            <DocsIcon fontSize="small" color="action" />
          )}

          {!project.urlProd &&
            !project.urlStage &&
            !project.urlTest &&
            !project.repoUrl &&
            !project.docsUrl && (
              <Typography variant="body2" color="text.secondary">
                No links available
              </Typography>
            )}
        </Box>

        {/* Metadata */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Created: {new Date(project.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectDetailDialog;
