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
    nodes.forEach((n) => {
      inDegree[n.id] = 0;
      adj[n.id] = [];
    });
    edges.forEach((e) => {
      adj[e.source]?.push(e.target);
      inDegree[e.target] = (inDegree[e.target] || 0) + 1;
    });
    const queue = Object.keys(inDegree).filter((k) => inDegree[k] === 0);
    const order: string[] = [];
    while (queue.length > 0) {
      const node = queue.shift()!;
      order.push(node);
      for (const nb of adj[node] || []) {
        inDegree[nb]--;
        if (inDegree[nb] === 0) queue.push(nb);
      }
    }
    return order;
  }, [nodes, edges]);

  // Collect outputs from parent nodes connected to this node
  const getNodeInputs = useCallback(
    (
      nodeId: string,
      results: Record<string, ExecutionResult>
    ): Record<string, unknown> => {
      const inputs: Record<string, unknown> = {};
      edges.forEach((e) => {
        if (e.target === nodeId && results[e.source]) {
          const srcNode = nodes.find((n) => n.id === e.source);
          const key = srcNode?.data?.componentName || e.source;
          inputs[key] = results[e.source].result;
        }
      });
      return inputs;
    },
    [edges, nodes]
  );

  const setNodeExecStatus = useCallback(
    (nodeId: string, execStatus: AgentNodeData['execStatus']) => {
      setNodes((ns) =>
        ns.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, execStatus } } : n))
      );
    },
    [setNodes]
  );

  const executeNodeCode = useCallback(
    async (
      node: Node<AgentNodeData>,
      inputs: Record<string, unknown>
    ): Promise<ExecutionResult> => {
      const config = node.data?.config ?? {};
      const code = config._code || '';
      const comp = components.find((c) => c.id === node.data.componentId);
      const finalCode = code || comp?.defaultCode || '';
      if (!finalCode.trim()) {
        return { success: true, logs: ['No code — skipped'], duration: 0 };
      }
      return executeCode(finalCode, {
        config,
        nodeId: node.id,
        nodeName: node.data.componentName,
        category: node.data.category,
        inputs,
      });
    },
    [components]
  );

  const runNodeSequence = useCallback(
    async (order: string[]) => {
      const results: Record<string, ExecutionResult> = {};
      for (const nodeId of order) {
        if (abortRef.current) break;
        setNodeExecStatus(nodeId, 'running');
        const node = nodes.find((n) => n.id === nodeId);
        if (!node) {
          setNodeExecStatus(nodeId, 'error');
          continue;
        }
        const cat = node.data?.category;
        const inputs = getNodeInputs(nodeId, results);
        const hasCode = cat === 'logic' || cat === 'custom' || !!node.data?.config?._code;
        if (hasCode) {
          const result = await executeNodeCode(node, inputs);
          // Attach input info to result logs
          if (Object.keys(inputs).length > 0) {
            result.logs.unshift(`[Inputs] ${JSON.stringify(inputs)}`);
          }
          results[nodeId] = result;
          setNodeExecStatus(nodeId, result.success ? 'success' : 'error');
        } else {
          await new Promise((r) => setTimeout(r, 300));
          const passthrough = Object.keys(inputs).length > 0 ? inputs : undefined;
          results[nodeId] = {
            success: true,
            result: passthrough,
            logs: [`${cat} node processed${passthrough ? ' — data passed through' : ''}`],
            duration: 0,
          };
          setNodeExecStatus(nodeId, 'success');
        }
        if (abortRef.current) {
          setNodeExecStatus(nodeId, 'error');
          break;
        }
      }
      return results;
    },
    [nodes, setNodeExecStatus, executeNodeCode, getNodeInputs]
  );

  const executeWorkflow = useCallback(async () => {
    abortRef.current = false;
    setExecuting(true);
    setLastResults({});
    setNodes((ns) =>
      ns.map((n) => ({ ...n, data: { ...n.data, execStatus: undefined } }))
    );
    const results = await runNodeSequence(getTopologicalOrder());
    setLastResults(results);
    setExecuting(false);
  }, [getTopologicalOrder, setNodes, runNodeSequence]);

  const triggerFromNode = useCallback(
    async (startNodeId: string) => {
      abortRef.current = false;
      setExecuting(true);
      setNodes((ns) =>
        ns.map((n) => ({ ...n, data: { ...n.data, execStatus: undefined } }))
      );
      const order = getTopologicalOrder();
      const startIdx = order.indexOf(startNodeId);
      const subOrder = startIdx >= 0 ? order.slice(startIdx) : [startNodeId];
      const results = await runNodeSequence(subOrder);
      setLastResults(results);
      setExecuting(false);
    },
    [getTopologicalOrder, setNodes, runNodeSequence]
  );

  const stopExecution = useCallback(() => {
    abortRef.current = true;
    setExecuting(false);
  }, []);

  return { executing, executeWorkflow, stopExecution, triggerFromNode, lastResults };
};
