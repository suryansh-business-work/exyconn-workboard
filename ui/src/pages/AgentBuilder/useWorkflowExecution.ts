import { useState, useCallback, useRef } from 'react';
import { Node } from '@xyflow/react';
import type { AgentNodeData } from './useAgentBuilder';

interface UseWorkflowExecutionParams {
  nodes: Node<AgentNodeData>[];
  edges: { source: string; target: string }[];
  setNodes: React.Dispatch<React.SetStateAction<Node<AgentNodeData>[]>>;
}

export const useWorkflowExecution = ({ nodes, edges, setNodes }: UseWorkflowExecutionParams) => {
  const [executing, setExecuting] = useState(false);
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
      for (const neighbor of adj[node] || []) {
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) queue.push(neighbor);
      }
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

  const executeWorkflow = useCallback(async () => {
    abortRef.current = false;
    setExecuting(true);
    setNodes((ns) => ns.map((n) => ({ ...n, data: { ...n.data, execStatus: undefined } })));
    const order = getTopologicalOrder();
    for (const nodeId of order) {
      if (abortRef.current) break;
      setNodeExecStatus(nodeId, 'running');
      await new Promise((r) => setTimeout(r, 1200));
      if (abortRef.current) {
        setNodeExecStatus(nodeId, 'error');
        break;
      }
      setNodeExecStatus(nodeId, 'success');
    }
    setExecuting(false);
  }, [getTopologicalOrder, setNodeExecStatus, setNodes]);

  const stopExecution = useCallback(() => {
    abortRef.current = true;
    setExecuting(false);
  }, []);

  return { executing, executeWorkflow, stopExecution };
};
