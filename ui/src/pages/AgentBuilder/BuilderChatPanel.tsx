import { useState, useCallback } from 'react';
import { Box, Typography, IconButton, Collapse } from '@mui/material';
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  ExpandMore as ExpandIcon,
} from '@mui/icons-material';
import AIChatInput from '../../components/AIChat/AIChatInput';
import AIChatMessageItem from '../../components/AIChat/AIChatMessageItem';
import AIChatLoading from '../../components/AIChat/AIChatLoading';
import { useAIChat } from '../../components/AIChat/useAIChat';
import { settingsService } from '../../services';
import type { WorkflowNode, WorkflowEdge } from '../../types';

interface Props {
  agentName: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

const BuilderChatPanel = ({ agentName, nodes, edges }: Props) => {
  const [expanded, setExpanded] = useState(false);

  const handleSendMessage = useCallback(
    async (message: string, _history: { role: string; content: string }[]) => {
      const contextInfo = `Agent: "${agentName}". ${nodes.length} nodes, ${edges.length} connections. Nodes: ${JSON.stringify(nodes.map((n) => ({ name: n.componentName, category: n.category })))}`;
      const fullMessage = `[Workflow Context: ${contextInfo}]\n\nUser: ${message}`;
      try {
        const result = await settingsService.rewriteWithAI(
          fullMessage,
          'agent-workflow-assistant'
        );
        return { content: result.rewrittenText || 'No response' };
      } catch {
        return { content: 'Failed to get response. Check OpenAI settings.' };
      }
    },
    [agentName, nodes, edges]
  );

  const { messages, input, setInput, loading, send, containerRef } = useAIChat({
    onSendMessage: handleSendMessage,
  });

  return (
    <Box
      sx={{
        borderTop: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 0.5,
          cursor: 'pointer',
          '&:hover': { backgroundColor: 'action.hover' },
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <ChatIcon sx={{ fontSize: 18, mr: 1, color: 'primary.main' }} />
        <Typography variant="subtitle2" sx={{ flex: 1, fontWeight: 600 }}>
          Agent Assistant
        </Typography>
        <IconButton size="small">
          {expanded ? <CloseIcon fontSize="small" /> : <ExpandIcon fontSize="small" />}
        </IconButton>
      </Box>
      <Collapse in={expanded}>
        <Box
          ref={containerRef}
          sx={{
            height: 240,
            overflow: 'auto',
            px: 2,
            py: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          {messages.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: 'center', mt: 4 }}
            >
              Ask about your agent workflow — optimization, debugging, or ideas.
            </Typography>
          )}
          {messages.map((msg) => (
            <AIChatMessageItem key={msg.id} message={msg} />
          ))}
          {loading && <AIChatLoading text="Thinking..." />}
        </Box>
        <AIChatInput
          value={input}
          onChange={setInput}
          onSend={() => send()}
          disabled={loading}
          placeholder="Ask about your agent workflow..."
        />
      </Collapse>
    </Box>
  );
};

export default BuilderChatPanel;
