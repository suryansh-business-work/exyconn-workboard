import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Drawer,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  History as HistoryIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import api from '../../services/api';
import { HistoryEntry } from './historyUtils';
import HistoryEntryItem from './HistoryEntryItem';

interface TaskHistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  taskId: string;
}

const TaskHistoryDrawer = ({ open, onClose, taskId }: TaskHistoryDrawerProps) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!taskId) return;
      setLoading(true);
      try {
        const response = await api.get(`/tasks/${taskId}/history`);
        setHistory(response.data);
      } catch (error) {
        console.error('Failed to fetch history:', error);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    if (open && taskId) {
      fetchHistory();
    }
  }, [open, taskId]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 480 },
          bgcolor: '#fafafa',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Enhanced Header */}
        <Box
          sx={{
            p: 2.5,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TimelineIcon />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  Activity History
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Track all changes made to this task
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={onClose} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          {!loading && history.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Chip
                label={`${history.length} events`}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
              <Chip
                label={`Last: ${new Date(history[0]?.performedAt).toLocaleDateString()}`}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </Box>
          )}
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
              <CircularProgress sx={{ color: '#667eea' }} />
            </Box>
          ) : history.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                pt: 8,
                px: 3,
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <HistoryIcon sx={{ fontSize: 32, color: '#9e9e9e' }} />
              </Box>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No History Yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Changes to this task will appear here
              </Typography>
            </Box>
          ) : (
            <Box sx={{ position: 'relative' }}>
              {/* Timeline line */}
              <Box
                sx={{
                  position: 'absolute',
                  left: 19,
                  top: 20,
                  bottom: 20,
                  width: 2,
                  background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
                  opacity: 0.3,
                  borderRadius: 1,
                }}
              />
              {history.map((entry, index) => (
                <HistoryEntryItem
                  key={entry._id}
                  entry={entry}
                  isFirst={index === 0}
                  isLast={index === history.length - 1}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default TaskHistoryDrawer;
