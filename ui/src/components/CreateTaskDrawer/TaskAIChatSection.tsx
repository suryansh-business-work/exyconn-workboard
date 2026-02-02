import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Paper,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as AIIcon,
  Person as PersonIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { ChatMessage, TaskAIChatSectionProps } from './types';
import { ParsedTask } from '../../types';

interface Props extends Omit<TaskAIChatSectionProps, 'chatMessages'> {
  chatMessages: ChatMessage[];
  chatContainerRef: React.RefObject<HTMLDivElement | null>;
}

const TaskAIChatSection = ({
  chatMessages,
  chatInput,
  parsing,
  onInputChange,
  onSend,
  onApplyParsedTask,
  chatContainerRef,
}: Props) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <Box
      sx={{
        width: 400,
        borderRight: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f8f9fa',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <AIIcon color="primary" />
        <Typography variant="subtitle1" fontWeight={600}>
          AI Assistant
        </Typography>
      </Box>

      {/* Messages Container */}
      <Box
        ref={chatContainerRef}
        sx={{
          flex: 1,
          p: 2,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        {/* Empty State */}
        {chatMessages.length === 0 && (
          <Paper
            sx={{
              p: 2,
              bgcolor: 'white',
              borderRadius: 2,
            }}
            elevation={0}
          >
            <Typography variant="body2" color="text.secondary">
              Describe your task in natural language. I&apos;ll parse it and fill the form
              automatically.
            </Typography>
          </Paper>
        )}

        {/* Chat Messages */}
        {chatMessages.map((msg) => (
          <ChatMessageItem
            key={msg.id}
            message={msg}
            onApplyParsedTask={onApplyParsedTask}
          />
        ))}

        {/* Loading State */}
        {parsing && <ChatLoadingIndicator />}
      </Box>

      {/* Input */}
      <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
        <TextField
          fullWidth
          multiline
          minRows={2}
          maxRows={5}
          size="small"
          placeholder="Type your task description... (Shift+Enter for new line)"
          value={chatInput}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{
            '& .MuiOutlinedInput-root': {
              alignItems: 'flex-end',
            },
          }}
          InputProps={{
            endAdornment: (
              <IconButton
                size="small"
                onClick={onSend}
                disabled={parsing || !chatInput.trim()}
                color="primary"
                sx={{ mb: 0.5 }}
              >
                <SendIcon fontSize="small" />
              </IconButton>
            ),
          }}
        />
      </Box>
    </Box>
  );
};

// ============ Sub-components ============

interface ChatMessageItemProps {
  message: ChatMessage;
  onApplyParsedTask: (parsed: ParsedTask) => void;
}

const ChatMessageItem = ({ message, onApplyParsedTask }: ChatMessageItemProps) => {
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
          bgcolor: isUser ? '#1976d2' : '#9c27b0',
        }}
      >
        {isUser ? <PersonIcon sx={{ fontSize: 16 }} /> : <AIIcon sx={{ fontSize: 16 }} />}
      </Avatar>
      <Paper
        sx={{
          p: 1.5,
          maxWidth: '85%',
          bgcolor: isUser ? '#1976d2' : 'white',
          color: isUser ? 'white' : 'text.primary',
          borderRadius: 2,
          borderTopLeftRadius: !isUser ? 0 : 2,
          borderTopRightRadius: isUser ? 0 : 2,
        }}
        elevation={1}
      >
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
          {message.content}
        </Typography>
        {message.parsedTask && (
          <Button
            size="small"
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => onApplyParsedTask(message.parsedTask!)}
            sx={{ mt: 1, textTransform: 'none' }}
          >
            Fill to Form
          </Button>
        )}
      </Paper>
    </Box>
  );
};

const ChatLoadingIndicator = () => (
  <Box sx={{ display: 'flex', gap: 1 }}>
    <Avatar sx={{ width: 28, height: 28, bgcolor: '#9c27b0' }}>
      <AIIcon sx={{ fontSize: 16 }} />
    </Avatar>
    <Paper
      sx={{
        p: 1.5,
        bgcolor: 'white',
        borderRadius: 2,
        borderTopLeftRadius: 0,
      }}
      elevation={1}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={14} />
        <Typography variant="body2">Parsing your request...</Typography>
      </Box>
    </Paper>
  </Box>
);

export default TaskAIChatSection;
