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
    async (message: string, history: { role: string; content: string }[]) => {
      const contextPrompt = `You are an AI agent builder assistant. The user is building an agent called "${agentName}". Current workflow has ${nodes.length} nodes and ${edges.length} connections. Nodes: ${JSON.stringify(nodes.map((n) => ({ name: n.componentName, category: n.category })))}. Help them optimize, debug, or extend the workflow.`;

      const config = await settingsService.getOpenAIConfig();
      const apiKey = config?.apiKey;
      if (!apiKey)
        return { content: 'OpenAI API key is not configured. Go to Settings to add it.' };

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: config.openAIModel || 'gpt-4o-mini',
          max_tokens: config.maxTokens || 1000,
          messages: [
            { role: 'system', content: contextPrompt },
            ...history.map((h) => ({ role: h.role, content: h.content })),
            { role: 'user', content: message },
          ],
        }),
      });
      const data = await res.json();
      return { content: data.choices?.[0]?.message?.content || 'No response' };
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
