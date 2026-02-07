import { Box, Avatar, Paper, Typography } from '@mui/material';
import { SmartToy as AIIcon, Person as PersonIcon } from '@mui/icons-material';
import { AIChatMessage } from './types';
import { ReactNode } from 'react';

interface AIChatMessageItemProps<TMetadata> {
  message: AIChatMessage<TMetadata>;
  renderAction?: (message: AIChatMessage<TMetadata>) => ReactNode;
}

function AIChatMessageItem<TMetadata>({
  message,
  renderAction,
}: AIChatMessageItemProps<TMetadata>) {
  const isUser = message.type === 'user';

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        flexDirection: isUser ? 'row-reverse' : 'row',
      }}
    >
      <Avatar
        sx={{
          width: 28,
          height: 28,
          bgcolor: isUser ? 'primary.main' : 'secondary.main',
        }}
      >
        {isUser ? <PersonIcon sx={{ fontSize: 16 }} /> : <AIIcon sx={{ fontSize: 16 }} />}
      </Avatar>
      <Paper
        sx={{
          p: 1.5,
          maxWidth: '85%',
          bgcolor: isUser ? 'primary.main' : 'background.paper',
          color: isUser ? 'primary.contrastText' : 'text.primary',
          borderRadius: 2,
          borderTopLeftRadius: !isUser ? 0 : 2,
          borderTopRightRadius: isUser ? 0 : 2,
        }}
        elevation={1}
      >
        {!isUser && message.content.includes('<') ? (
          <Box
            sx={{
              '& p': { m: 0, mb: 0.5 },
              '& ul, & ol': { m: 0, pl: 2 },
              '& li': { mb: 0.25 },
              '& strong': { fontWeight: 600 },
              '& code': {
                bgcolor: 'action.hover',
                px: 0.5,
                borderRadius: 0.5,
                fontSize: '0.85em',
              },
              fontSize: '0.875rem',
              lineHeight: 1.5,
            }}
            dangerouslySetInnerHTML={{ __html: message.content }}
          />
        ) : (
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
            {message.content}
          </Typography>
        )}
        {renderAction && renderAction(message)}
      </Paper>
    </Box>
  );
}

export default AIChatMessageItem;
