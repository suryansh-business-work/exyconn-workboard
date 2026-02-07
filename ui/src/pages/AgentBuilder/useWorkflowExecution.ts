import { useState, useCallback, useRef } from 'react';
import { Node } from '@xyflow/react';
import type { AgentNodeData } from './useAgentBuilder';
import { executeCode, ExecutionResult } from './codeExecutor';
import { AgentComponent } from '../../types';

interface UseWorkflowExecutionParams {
  nodes: Node<AgentNodeData>[];
  edges: { source: string; target: string }[];
  setNodes: React.Dispatch<React.SetStateAction<Node<AgentNodeData>[]>>;
  components: AgentComponent[];
}

export const useWorkflowExecution = ({
  nodes,
  edges,
  setNodes,
  components,
}: UseWorkflowExecutionParams) => {
  const [executing, setExecuting] = useState(false);
  const [lastResults, setLastResults] = useState<Record<string, ExecutionResult>>({});
  const abortRef = useRef(false);

  const getTopologicalOrder = useCallback((): string[] => {
    const inDegree: Record<string, number> = {};
    const adj: Record<string, string[]> = {};
    nodes.forEach((n) => { inDegree[n.id] = 0; adj[n.id] = []; });
    edges.forEach((e) => {
      adj[e.source]?.push(e.target);
      inDegree[e.target] = (inDegree[e.target] || 0) + 1;
    });
    const queue = Object.keys(inDegree).filter((k) => inDegree[k] === 0);
    const order: string[] = [];
    while (queue.length > 0) {
      const node = queue.shift()!;
      order.push(node);
      for (const nb of adj[node] || []) { inDegree[nb]--; if (inDegree[nb] === 0) queue.push(nb); }
    }
    return order;
  }, [nodes, edges]);

  const setNodeExecStatus = useCallback(
    (nodeId: string, execStatus: AgentNodeData['execStatus']) => {
      setNodes((ns) =>
        ns.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, execStatus } } : n))
      );
    },
    [setNodes]
  );

  const executeNodeCode = useCallback(
    async (node: Node<AgentNodeData>): Promise<ExecutionResult> => {
      const config = node.data?.config ?? {};
      const code = config._code || '';
      const comp = components.find((c) => c.id === node.data.componentId);
      const finalCode = code || comp?.defaultCode || '';
      if (!finalCode.trim()) {
        return { success: true, logs: ['No code to execute — skipped'], duration: 0 };
      }
      return executeCode(finalCode, {
        config,
        nodeId: node.id,
        nodeName: node.data.componentName,
        category: node.data.category,
      });
    },
    [components]
  );

  const executeWorkflow = useCallback(async () => {
    abortRef.current = false;
    setExecuting(true);
    setLastResults({});
    setNodes((ns) => ns.map((n) => ({ ...n, data: { ...n.data, execStatus: undefined } })));
    const order = getTopologicalOrder();
    const results: Record<string, ExecutionResult> = {};
    for (const nodeId of order) {
      if (abortRef.current) break;
      setNodeExecStatus(nodeId, 'running');
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) { setNodeExecStatus(nodeId, 'error'); continue; }
      const cat = node.data?.category;
      const hasCode = cat === 'logic' || cat === 'custom';
      if (hasCode) {
        const result = await executeNodeCode(node);
        results[nodeId] = result;
        setNodeExecStatus(nodeId, result.success ? 'success' : 'error');
      } else {
        await new Promise((r) => setTimeout(r, 500));
        results[nodeId] = { success: true, logs: [`${cat} node processed`], duration: 0 };
        setNodeExecStatus(nodeId, 'success');
      }
      if (abortRef.current) { setNodeExecStatus(nodeId, 'error'); break; }
    }
    setLastResults(results);
    setExecuting(false);
  }, [getTopologicalOrder, setNodeExecStatus, setNodes, nodes, executeNodeCode]);

  const triggerFromNode = useCallback(
    async (startNodeId: string) => {
      abortRef.current = false;
      setExecuting(true);
      setNodes((ns) => ns.map((n) => ({ ...n, data: { ...n.data, execStatus: undefined } })));
      const order = getTopologicalOrder();
      const startIdx = order.indexOf(startNodeId);
      const subOrder = startIdx >= 0 ? order.slice(startIdx) : [startNodeId];
      const results: Record<string, ExecutionResult> = {};
      for (const nodeId of subOrder) {
        if (abortRef.current) break;
        setNodeExecStatus(nodeId, 'running');
        const node = nodes.find((n) => n.id === nodeId);
        if (!node) { setNodeExecStatus(nodeId, 'error'); continue; }
        const cat = node.data?.category;
        if (cat === 'logic' || cat === 'custom') {
          const result = await executeNodeCode(node);
          results[nodeId] = result;
          setNodeExecStatus(nodeId, result.success ? 'success' : 'error');
        } else {
          await new Promise((r) => setTimeout(r, 400));
          results[nodeId] = { success: true, logs: [`${cat} triggered`], duration: 0 };
          setNodeExecStatus(nodeId, 'success');
        }
      }
      setLastResults(results);
      setExecuting(false);
    },
    [getTopologicalOrder, setNodeExecStatus, setNodes, nodes, executeNodeCode]
  );

  const stopExecution = useCallback(() => {
    abortRef.current = true;
    setExecuting(false);
  }, []);

  return { executing, executeWorkflow, stopExecution, triggerFromNode, lastResults };
};
