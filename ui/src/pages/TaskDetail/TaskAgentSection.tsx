import { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  SmartToy as AgentIcon,
  ExpandMore as ExpandIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Schedule as TimeIcon,
} from '@mui/icons-material';
import { TaskAgent, AgentExecutionLog } from '../../types';
import { taskService } from '../../services';
import AgentExecutionPanel from './AgentExecutionPanel';

interface Props {
  taskId: string;
  agents: TaskAgent[];
}

const TaskAgentSection = ({ taskId, agents }: Props) => {
  const [logs, setLogs] = useState<AgentExecutionLog[]>([]);
  const [runningAgent, setRunningAgent] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    taskService
      .getAgentExecutionLogs(taskId)
      .then((data) => {
        if (!cancelled) setLogs(data);
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      cancelled = true;
    };
  }, [taskId]);

  const handleExecutionComplete = useCallback((log: AgentExecutionLog) => {
    setLogs((prev) => [log, ...prev]);
    setRunningAgent(null);
  }, []);

  if (agents.length === 0) return null;

  const agentLogCounts = agents.map((a) => ({
    ...a,
    execCount: logs.filter((l) => l.agentId === a.agentId).length,
    lastRun: logs.find((l) => l.agentId === a.agentId),
  }));

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Assigned Agents
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
        {agentLogCounts.map((agent) => (
          <Box
            key={agent.agentId}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
            }}
          >
            <AgentIcon color="primary" fontSize="small" />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600}>
                {agent.agentName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {agent.execCount > 0
                  ? `Executed ${agent.execCount} time(s)`
                  : 'Never executed'}
                {agent.lastRun &&
                  ` — Last: ${new Date(agent.lastRun.startedAt).toLocaleString()}`}
              </Typography>
            </Box>
            {runningAgent === agent.agentId ? (
              <CircularProgress size={20} />
            ) : (
              <Tooltip title="Execute Agent">
                <IconButton
                  color="success"
                  size="small"
                  onClick={() => {
                    setRunningAgent(agent.agentId);
                  }}
                  sx={{ border: '1px solid', borderColor: 'success.main' }}
                >
                  <PlayIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ))}
      </Box>

      {runningAgent && (
        <AgentExecutionPanel
          taskId={taskId}
          agentId={runningAgent}
          agentName={agents.find((a) => a.agentId === runningAgent)?.agentName || ''}
          onComplete={handleExecutionComplete}
          onLoadingChange={() => {
            /* handled by runningAgent state */
          }}
        />
      )}

      {logs.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Execution History
          </Typography>
          {logs.slice(0, 10).map((log) => (
            <Accordion
              key={log._id}
              variant="outlined"
              disableGutters
              sx={{ mb: 0.5, '&:before': { display: 'none' } }}
            >
              <AccordionSummary
                expandIcon={<ExpandIcon />}
                sx={{
                  minHeight: 40,
                  '& .MuiAccordionSummary-content': {
                    my: 0.5,
                    alignItems: 'center',
                    gap: 1,
                  },
                }}
              >
                {log.status === 'success' ? (
                  <SuccessIcon color="success" sx={{ fontSize: 18 }} />
                ) : (
                  <ErrorIcon color="error" sx={{ fontSize: 18 }} />
                )}
                <Typography variant="body2" fontWeight={500}>
                  {log.agentName}
                </Typography>
                <Chip
                  label={log.status}
                  size="small"
                  color={log.status === 'success' ? 'success' : 'error'}
                  sx={{ height: 20, fontSize: 10 }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
                  <TimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(log.startedAt).toLocaleString()}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Divider sx={{ mb: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Duration: {log.totalDuration.toFixed(0)}ms — {log.nodeResults.length}{' '}
                  node(s)
                </Typography>
                {log.nodeResults.map((nr, i) => (
                  <Box
                    key={i}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, pl: 1 }}
                  >
                    {nr.success ? (
                      <SuccessIcon sx={{ fontSize: 14, color: 'success.main' }} />
                    ) : (
                      <ErrorIcon sx={{ fontSize: 14, color: 'error.main' }} />
                    )}
                    <Typography variant="caption">{nr.nodeName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {nr.duration.toFixed(0)}ms
                    </Typography>
                    {nr.error && (
                      <Typography variant="caption" color="error">
                        {nr.error}
                      </Typography>
                    )}
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default TaskAgentSection;
