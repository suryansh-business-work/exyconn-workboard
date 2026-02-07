import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Chip,
  Paper,
  CircularProgress,
} from '@mui/material';
import { CheckCircle as SuccessIcon, Error as ErrorIcon } from '@mui/icons-material';
import { agentService, agentComponentService } from '../../services';
import { taskService } from '../../services';
import { executeCode } from '../AgentBuilder/codeExecutor';
import { AgentExecutionLog, AgentExecutionNodeResult } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface Props {
  taskId: string;
  agentId: string;
  agentName: string;
  onComplete: (log: AgentExecutionLog) => void;
  onLoadingChange: (loading: boolean) => void;
}

const AgentExecutionPanel = ({
  taskId,
  agentId,
  agentName,
  onComplete,
  onLoadingChange,
}: Props) => {
  const { user } = useAuth();
  const [nodeStatuses, setNodeStatuses] = useState<
    Record<string, 'pending' | 'running' | 'success' | 'error'>
  >({});
  const [nodeNames, setNodeNames] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'loading' | 'running' | 'done'>('loading');
  const ranRef = useRef(false);

  const runWorkflow = useCallback(async () => {
    if (ranRef.current) return;
    ranRef.current = true;
    const start = performance.now();
    onLoadingChange(true);

    try {
      const [agent, allComponents] = await Promise.all([
        agentService.getById(agentId),
        agentComponentService.getAll(),
      ]);

      const nodes = agent.nodes || [];
      const edges = agent.edges || [];
      const components = allComponents.filter((c) => c.status === 'active');

      // Build name map and initial statuses
      const names: Record<string, string> = {};
      const statuses: Record<string, 'pending' | 'running' | 'success' | 'error'> = {};
      nodes.forEach((n) => {
        names[n.nodeId] = n.componentName;
        statuses[n.nodeId] = 'pending';
      });
      setNodeNames(names);
      setNodeStatuses(statuses);
      setStatus('running');

      // Topological sort
      const inDeg: Record<string, number> = {};
      const adj: Record<string, string[]> = {};
      nodes.forEach((n) => {
        inDeg[n.nodeId] = 0;
        adj[n.nodeId] = [];
      });
      edges.forEach((e) => {
        adj[e.source]?.push(e.target);
        inDeg[e.target] = (inDeg[e.target] || 0) + 1;
      });
      const queue = Object.keys(inDeg).filter((k) => inDeg[k] === 0);
      const order: string[] = [];
      while (queue.length) {
        const nid = queue.shift()!;
        order.push(nid);
        for (const nb of adj[nid] || []) {
          inDeg[nb]--;
          if (inDeg[nb] === 0) queue.push(nb);
        }
      }

      // Execute nodes
      const results: Record<
        string,
        {
          success: boolean;
          result?: unknown;
          logs: string[];
          error?: string;
          duration: number;
        }
      > = {};
      const nodeResults: AgentExecutionNodeResult[] = [];

      for (let i = 0; i < order.length; i++) {
        const nodeId = order[i];
        const node = nodes.find((n) => n.nodeId === nodeId);
        if (!node) continue;

        setNodeStatuses((prev) => ({ ...prev, [nodeId]: 'running' }));

        // Collect inputs from parents
        const inputs: Record<string, unknown> = {};
        edges.forEach((e) => {
          if (e.target === nodeId && results[e.source]) {
            const srcName = names[e.source] || e.source;
            inputs[srcName] = results[e.source].result;
          }
        });

        const comp = components.find((c) => c.id === node.componentId);
        const code = node.config?._code || comp?.defaultCode || '';

        let res: {
          success: boolean;
          result?: unknown;
          logs: string[];
          error?: string;
          duration: number;
        };
        if (code.trim()) {
          res = await executeCode(code, {
            config: node.config || {},
            nodeId: node.nodeId,
            nodeName: node.componentName,
            category: node.category,
            inputs,
          });
        } else {
          res = {
            success: true,
            result: inputs,
            logs: [`${node.category} node processed`],
            duration: 0,
          };
        }

        results[nodeId] = res;
        nodeResults.push({
          nodeId,
          nodeName: node.componentName,
          category: node.category,
          success: res.success,
          result: res.result,
          error: res.error,
          logs: res.logs,
          duration: res.duration,
        });

        setNodeStatuses((prev) => ({
          ...prev,
          [nodeId]: res.success ? 'success' : 'error',
        }));
        setProgress(((i + 1) / order.length) * 100);
      }

      const totalDuration = performance.now() - start;
      const allSuccess = nodeResults.every((r) => r.success);

      // Save execution log
      const log = await taskService.logAgentExecution(taskId, {
        agentId,
        agentName,
        status: allSuccess ? 'success' : 'error',
        nodeResults,
        totalDuration,
        triggeredBy: user?.name || 'Unknown',
      });

      setStatus('done');
      onComplete(log);
    } catch {
      setStatus('done');
      const duration = performance.now() - start;
      const log = await taskService.logAgentExecution(taskId, {
        agentId,
        agentName,
        status: 'error',
        nodeResults: [],
        totalDuration: duration,
        triggeredBy: user?.name || 'Unknown',
      });
      onComplete(log);
    } finally {
      onLoadingChange(false);
    }
  }, [agentId, agentName, taskId, user, onComplete, onLoadingChange]);

  useEffect(() => {
    runWorkflow();
  }, [runWorkflow]);

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
        {status === 'loading'
          ? 'Loading agent...'
          : status === 'running'
            ? `Executing ${agentName}...`
            : 'Execution Complete'}
      </Typography>
      {status !== 'done' && (
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ mb: 1, borderRadius: 1 }}
        />
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {Object.entries(nodeStatuses).map(([nodeId, st]) => (
          <Box key={nodeId} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {st === 'running' && <CircularProgress size={14} />}
            {st === 'success' && (
              <SuccessIcon sx={{ fontSize: 14, color: 'success.main' }} />
            )}
            {st === 'error' && <ErrorIcon sx={{ fontSize: 14, color: 'error.main' }} />}
            {st === 'pending' && (
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  border: '2px solid',
                  borderColor: 'divider',
                }}
              />
            )}
            <Typography variant="caption">{nodeNames[nodeId] || nodeId}</Typography>
            <Chip
              label={st}
              size="small"
              sx={{ height: 18, fontSize: 9 }}
              color={
                st === 'success'
                  ? 'success'
                  : st === 'error'
                    ? 'error'
                    : st === 'running'
                      ? 'warning'
                      : 'default'
              }
            />
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default AgentExecutionPanel;
