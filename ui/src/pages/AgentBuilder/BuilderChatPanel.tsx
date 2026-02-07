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
import BuilderChatActions from './BuilderChatActions';
import { settingsService } from '../../services';
import type {
  WorkflowNode,
  WorkflowEdge,
  AgentComponent,
  BuildAgentResponse,
  SuggestedWorkflow,
} from '../../types';

interface BuildMeta {
  missingComponents: BuildAgentResponse['missingComponents'];
  workflow: BuildAgentResponse['workflow'];
}

interface Props {
  agentName: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  components: AgentComponent[];
  onComponentCreated: (comp: AgentComponent) => void;
  onBuildWorkflow: (workflow: SuggestedWorkflow) => void;
}

const BuilderChatPanel = ({
  nodes,
  edges,
  components,
  onComponentCreated,
  onBuildWorkflow,
}: Props) => {
  const [expanded, setExpanded] = useState(false);

  const handleSendMessage = useCallback(
    async (message: string, history: { role: string; content: string }[]) => {
      try {
        const result = await settingsService.buildAgent({
          message,
          components: components.map((c) => ({
            id: c.id,
            name: c.name,
            category: c.category,
            description: c.description,
          })),
          currentNodes: nodes.map((n) => ({
            componentName: n.componentName,
            category: n.category,
          })),
          history: history.slice(-10),
        });
        return {
          content: result.message,
          metadata: {
            missingComponents: result.missingComponents || [],
            workflow: result.workflow || null,
          } as BuildMeta,
        };
      } catch {
        return { content: 'Failed to get response. Check OpenAI settings.' };
      }
    },
    [components, nodes]
  );

  const { messages, input, setInput, loading, send, containerRef } =
    useAIChat<BuildMeta>({ onSendMessage: handleSendMessage });

  const renderAction = useCallback(
    (msg: { metadata?: BuildMeta }) => {
      if (!msg.metadata) return null;
      const { missingComponents, workflow } = msg.metadata;
      if ((!missingComponents || !missingComponents.length) && !workflow) return null;
      return (
        <BuilderChatActions
          missingComponents={missingComponents || []}
          workflow={workflow || null}
          components={components}
          onComponentCreated={onComponentCreated}
          onBuildWorkflow={onBuildWorkflow}
        />
      );
    },
    [components, onComponentCreated, onBuildWorkflow]
  );

  return (
    <Box sx={{ borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 0.5,
          cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover' },
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <ChatIcon sx={{ fontSize: 18, mr: 1, color: 'primary.main' }} />
        <Typography variant="subtitle2" sx={{ flex: 1, fontWeight: 600 }}>
          Agent Assistant&nbsp;
          <Typography component="span" variant="caption" color="text.secondary">
            ({nodes.length} nodes, {edges.length} edges)
          </Typography>
        </Typography>
        <IconButton size="small">
          {expanded ? <CloseIcon fontSize="small" /> : <ExpandIcon fontSize="small" />}
        </IconButton>
      </Box>
      <Collapse in={expanded}>
        <Box
          ref={containerRef}
          sx={{
            height: 260,
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
              Describe the agent you want to build. I&apos;ll suggest components and
              create the workflow automatically.
            </Typography>
          )}
          {messages.map((msg) => (
            <AIChatMessageItem key={msg.id} message={msg} renderAction={renderAction} />
          ))}
          {loading && <AIChatLoading text="Analyzing components..." />}
        </Box>
        <AIChatInput
          value={input}
          onChange={setInput}
          onSend={() => send()}
          disabled={loading}
          placeholder="Describe the agent you want to build..."
        />
      </Collapse>
    </Box>
  );
};

export default BuilderChatPanel;
