import { Box, Paper, Typography, Chip, Avatar } from '@mui/material';
import { Email as EmailIcon } from '@mui/icons-material';
import {
  HistoryEntry,
  formatFieldName,
  formatValue,
  formatRelativeTime,
  getActionIcon,
  getActionColor,
} from './historyUtils';

interface HistoryEntryItemProps {
  entry: HistoryEntry;
  isFirst: boolean;
  isLast?: boolean;
}

const HistoryEntryItem = ({ entry, isFirst, isLast }: HistoryEntryItemProps) => {
  const actionColor = getActionColor(entry.action);

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        mb: isLast ? 0 : 2.5,
        position: 'relative',
        zIndex: 1,
      }}
    >
      {/* Timeline dot */}
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          bgcolor: actionColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          flexShrink: 0,
          boxShadow: isFirst ? `0 0 0 4px ${actionColor}33` : 'none',
          transition: 'all 0.2s',
        }}
      >
        {getActionIcon(entry.action)}
      </Box>

      {/* Content card */}
      <Paper
        elevation={isFirst ? 2 : 0}
        sx={{
          flex: 1,
          p: 2,
          bgcolor: isFirst ? 'white' : '#fff',
          border: '1px solid',
          borderColor: isFirst ? actionColor + '40' : '#e0e0e0',
          borderRadius: 2,
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: actionColor + '80',
            boxShadow: 1,
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 1,
          }}
        >
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                textTransform: 'capitalize',
                fontWeight: 600,
                color: actionColor,
              }}
            >
              {entry.action.replace('_', ' ')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatRelativeTime(entry.performedAt)}
            </Typography>
          </Box>
          {isFirst && (
            <Chip
              label="Latest"
              size="small"
              sx={{
                bgcolor: actionColor + '20',
                color: actionColor,
                fontWeight: 600,
                height: 22,
              }}
            />
          )}
        </Box>

        {/* Author */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Avatar
            sx={{
              width: 24,
              height: 24,
              fontSize: 12,
              bgcolor: '#e0e0e0',
              color: '#666',
            }}
          >
            {entry.performedBy.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="body2" color="text.secondary">
            {entry.performedBy}
          </Typography>
        </Box>

        {/* Changes */}
        {entry.action !== 'created' &&
          entry.action !== 'deleted' &&
          entry.changes &&
          Object.keys(entry.changes).length > 0 && (
            <Box
              sx={{
                bgcolor: '#f8f9fa',
                borderRadius: 1.5,
                p: 1.5,
                mt: 1,
              }}
            >
              {Object.entries(entry.changes).map(([field, change]) => (
                <Box
                  key={field}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 0.75,
                    '&:last-child': { mb: 0 },
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    sx={{ minWidth: 70, color: '#666' }}
                  >
                    {formatFieldName(field)}
                  </Typography>
                  <Chip
                    label={formatValue(field, change.from)}
                    size="small"
                    sx={{
                      bgcolor: '#ffebee',
                      color: '#c62828',
                      height: 22,
                      fontSize: 11,
                      textDecoration: 'line-through',
                    }}
                  />
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    →
                  </Typography>
                  <Chip
                    label={formatValue(field, change.to)}
                    size="small"
                    sx={{
                      bgcolor: '#e8f5e9',
                      color: '#2e7d32',
                      height: 22,
                      fontSize: 11,
                      fontWeight: 500,
                    }}
                  />
                </Box>
              ))}
            </Box>
          )}

        {/* Email notification */}
        {entry.emailSent && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              mt: 1.5,
              px: 1.5,
              py: 0.75,
              bgcolor: '#e3f2fd',
              borderRadius: 1,
              color: '#1976d2',
            }}
          >
            <EmailIcon fontSize="small" />
            <Typography variant="caption" fontWeight={500}>
              Email sent to {entry.emailTo}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default HistoryEntryItem;
