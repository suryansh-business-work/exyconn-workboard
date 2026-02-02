import { Box, Chip } from '@mui/material';
import { QuickAction } from './types';

interface AIChatQuickActionsProps {
  actions: QuickAction[];
  onActionClick: (prompt: string) => void;
}

const AIChatQuickActions = ({ actions, onActionClick }: AIChatQuickActionsProps) => {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {actions.map((action) => (
        <Chip
          key={action.label}
          icon={action.icon as React.ReactElement}
          label={action.label}
          onClick={() => onActionClick(action.prompt)}
          clickable
          variant="outlined"
          size="small"
          sx={{
            '&:hover': {
              bgcolor: 'primary.light',
              borderColor: 'primary.main',
            },
          }}
        />
      ))}
    </Box>
  );
};

export default AIChatQuickActions;
