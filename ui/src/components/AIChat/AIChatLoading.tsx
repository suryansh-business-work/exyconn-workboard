import { Box, Avatar, Paper, Typography, CircularProgress } from '@mui/material';
import { SmartToy as AIIcon } from '@mui/icons-material';

interface AIChatLoadingProps {
  text?: string;
}

const AIChatLoading = ({ text = 'Thinking...' }: AIChatLoadingProps) => {
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Avatar sx={{ width: 28, height: 28, bgcolor: 'secondary.main' }}>
        <AIIcon sx={{ fontSize: 16 }} />
      </Avatar>
      <Paper
        sx={{
          p: 1.5,
          bgcolor: 'background.paper',
          borderRadius: 2,
          borderTopLeftRadius: 0,
        }}
        elevation={1}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={14} />
          <Typography variant="body2">{text}</Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default AIChatLoading;
