import { useState, useEffect, useRef } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  Paper,
  Avatar,
  CircularProgress,
  Chip,
  Button,
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as AIIcon,
  Person as PersonIcon,
  TrendingUp as ProfitIcon,
  Speed as UrgentIcon,
  DesignServices as UXIcon,
  BugReport as BugIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { Task } from '../../types';
import { settingsService } from '../../services';
import './TaskAIAssistant.scss';

interface TaskAIAssistantProps {
  open: boolean;
  onClose: () => void;
  tasks: Task[];
  onFilterTasks: (taskIds: string[]) => void;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  suggestedTaskIds?: string[];
}

const quickActions = [
  {
    label: 'Business Priorities',
    icon: <ProfitIcon fontSize="small" />,
    prompt:
      'Analyze all tasks and suggest which ones should be prioritized to make the business more profitable. Consider impact and effort.',
  },
  {
    label: 'UX Improvements',
    icon: <UXIcon fontSize="small" />,
    prompt:
      'Which tasks would improve the user experience the most? Prioritize them based on impact.',
  },
  {
    label: 'Critical Bugs',
    icon: <BugIcon fontSize="small" />,
    prompt: 'Find all bug-related tasks and prioritize them by severity and impact.',
  },
  {
    label: 'Overdue & Urgent',
    icon: <UrgentIcon fontSize="small" />,
    prompt:
      'Show me tasks that are overdue or need immediate attention based on their due dates and priority.',
  },
];

const TaskAIAssistant = ({
  open,
  onClose,
  tasks,
  onFilterTasks,
}: TaskAIAssistantProps) => {
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setChatInput('');
      setChatMessages([]);
    }
  }, [open]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = async (message?: string) => {
    const msgToSend = message || chatInput.trim();
    if (!msgToSend) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: msgToSend,
    };
    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setChatInput('');
    setLoading(true);

    try {
      const history = updatedMessages.map((m) => ({
        role: m.type === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

      const tasksForAnalysis = tasks.map((t) => ({
        id: t.id,
        taskId: t.taskId,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        labels: t.labels,
        assignee: t.assignee,
        dueDate: t.dueDate,
      }));

      const result = await settingsService.analyzeTasksWithAI(
        msgToSend,
        tasksForAnalysis,
        history
      );

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: result.response,
        suggestedTaskIds: result.suggestedTaskIds,
      };
      setChatMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('AI analysis error:', err);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content:
          'Sorry, I encountered an error. Please make sure OpenAI is configured in Settings.',
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = (taskIds: string[]) => {
    onFilterTasks(taskIds);
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 400 } } }}
    >
      <Box
        className="task-ai-assistant"
        sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: '#f5f5f5',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AIIcon color="primary" />
            <Typography variant="h6">AI Task Assistant</Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Quick Actions */}
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 1, display: 'block' }}
          >
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {quickActions.map((action) => (
              <Chip
                key={action.label}
                icon={action.icon}
                label={action.label}
                onClick={() => handleSendMessage(action.prompt)}
                clickable
                variant="outlined"
                size="small"
                sx={{
                  '&:hover': {
                    bgcolor: 'primary.main',
                    color: '#1976d2',
                    '& .MuiChip-icon': { color: '#1976d2' },
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Chat Messages */}
        <Box
          ref={chatContainerRef}
          sx={{
            flex: 1,
            p: 2,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            bgcolor: '#fafafa',
          }}
        >
          {chatMessages.length === 0 && (
            <Paper sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }} elevation={0}>
              <Typography variant="body2" color="text.secondary">
                Ask me anything about your tasks! I can help you:
              </Typography>
              <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                <li>
                  <Typography variant="body2" color="text.secondary">
                    Prioritize tasks for business impact
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" color="text.secondary">
                    Find urgent or overdue tasks
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" color="text.secondary">
                    Suggest which tasks to tackle first
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" color="text.secondary">
                    Analyze task distribution
                  </Typography>
                </li>
              </ul>
            </Paper>
          )}

          {chatMessages.map((msg) => (
            <Box
              key={msg.id}
              sx={{
                display: 'flex',
                gap: 1,
                flexDirection: msg.type === 'user' ? 'row-reverse' : 'row',
              }}
            >
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  bgcolor: msg.type === 'user' ? '#1976d2' : '#9c27b0',
                }}
              >
                {msg.type === 'user' ? (
                  <PersonIcon sx={{ fontSize: 16 }} />
                ) : (
                  <AIIcon sx={{ fontSize: 16 }} />
                )}
              </Avatar>
              <Paper
                sx={{
                  p: 1.5,
                  maxWidth: '85%',
                  bgcolor: msg.type === 'user' ? '#1976d2' : 'white',
                  color: msg.type === 'user' ? 'white' : 'text.primary',
                  borderRadius: 2,
                  borderTopLeftRadius: msg.type === 'assistant' ? 0 : 2,
                  borderTopRightRadius: msg.type === 'user' ? 0 : 2,
                }}
                elevation={1}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {msg.content}
                </Typography>
                {msg.suggestedTaskIds && msg.suggestedTaskIds.length > 0 && (
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<FilterIcon />}
                    onClick={() => handleApplyFilter(msg.suggestedTaskIds!)}
                    sx={{ mt: 1, textTransform: 'none' }}
                  >
                    Apply Filter ({msg.suggestedTaskIds.length} tasks)
                  </Button>
                )}
              </Paper>
            </Box>
          ))}

          {loading && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Avatar sx={{ width: 28, height: 28, bgcolor: '#9c27b0' }}>
                <AIIcon sx={{ fontSize: 16 }} />
              </Avatar>
              <Paper
                sx={{ p: 1.5, bgcolor: 'white', borderRadius: 2, borderTopLeftRadius: 0 }}
                elevation={1}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={14} />
                  <Typography variant="body2">Analyzing your tasks...</Typography>
                </Box>
              </Paper>
            </Box>
          )}
        </Box>

        {/* Input */}
        <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
          <TextField
            fullWidth
            size="small"
            multiline
            maxRows={4}
            placeholder="Ask about your tasks... (Shift+Enter for new line)"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            InputProps={{
              endAdornment: (
                <IconButton
                  size="small"
                  onClick={() => handleSendMessage()}
                  disabled={loading || !chatInput.trim()}
                  color="primary"
                >
                  <SendIcon fontSize="small" />
                </IconButton>
              ),
            }}
          />
        </Box>
      </Box>
    </Drawer>
  );
};

export default TaskAIAssistant;
