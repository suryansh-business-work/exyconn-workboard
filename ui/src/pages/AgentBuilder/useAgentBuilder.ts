import { useState, useCallback, useEffect } from 'react';
import {
  Node, Edge, Connection, addEdge, applyNodeChanges, applyEdgeChanges,
  NodeChange, EdgeChange,
} from '@xyflow/react';
import { agentService, agentComponentService } from '../../services';
import { Agent, AgentComponent, WorkflowNode, WorkflowEdge } from '../../types';
import { useWorkflowExecution } from './useWorkflowExecution';

export interface AgentNodeData {
  componentId: string;
  componentName: string;
  category: string;
  color: string;
  config: Record<string, string>;
  execStatus?: 'running' | 'success' | 'error';
  [key: string]: unknown;
}

const toReactFlowNodes = (nodes: WorkflowNode[]): Node<AgentNodeData>[] =>
  nodes.map((n) => ({
    id: n.nodeId,
    type: 'agentNode',
    position: n.position,
    data: {
      componentId: n.componentId,
      componentName: n.componentName,
      category: n.category,
      color: n.color,
      config: n.config,
    },
  }));

const toReactFlowEdges = (edges: WorkflowEdge[]): Edge[] =>
  edges.map((e) => ({
    id: e.edgeId,
    source: e.source,
    target: e.target,
    animated: true,
    style: { stroke: '#1976d2', strokeWidth: 2 },
  }));

const toWorkflowNodes = (nodes: Node<AgentNodeData>[]): WorkflowNode[] =>
  nodes.map((n) => ({
    nodeId: n.id,
    componentId: n.data.componentId,
    componentName: n.data.componentName,
    category: n.data.category,
    color: n.data.color,
    position: n.position,
    config: n.data.config,
  }));

const toWorkflowEdges = (edges: Edge[]): WorkflowEdge[] =>
  edges.map((e) => ({ edgeId: e.id, source: e.source, target: e.target }));

export const useAgentBuilder = (agentId: string) => {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [components, setComponents] = useState<AgentComponent[]>([]);
  const [nodes, setNodes] = useState<Node<AgentNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node<AgentNodeData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [a, c] = await Promise.all([
          agentService.getById(agentId),
          agentComponentService.getAll(),
        ]);
        setAgent(a);
        setComponents(c.filter((comp) => comp.status === 'active'));
        setNodes(toReactFlowNodes(a.nodes || []));
        setEdges(toReactFlowEdges(a.edges || []));
      } catch {
        setError('Failed to load agent data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [agentId]);

  const onNodesChange = useCallback(
    (changes: NodeChange<Node<AgentNodeData>>[]) => setNodes((ns) => applyNodeChanges(changes, ns)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((es) => applyEdgeChanges(changes, es)),
    []
  );

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((es) =>
        addEdge({ ...connection, animated: true, style: { stroke: '#1976d2', strokeWidth: 2 } }, es)
      ),
    []
  );

  const addNode = useCallback(
    (component: AgentComponent, position: { x: number; y: number }) => {
      const id = `node_${Date.now()}`;
      const newNode: Node<AgentNodeData> = {
        id,
        type: 'agentNode',
        position,
        data: {
          componentId: component.id,
          componentName: component.name,
          category: component.category,
          color: component.color,
          config: {},
        },
      };
      setNodes((ns) => [...ns, newNode]);
    },
    []
  );

  const updateNodeConfig = useCallback(
    (nodeId: string, config: Record<string, string>) => {
      setNodes((ns) =>
        ns.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, config } } : n))
      );
      setSelectedNode((prev) => (prev?.id === nodeId ? { ...prev, data: { ...prev.data, config } } : prev));
    },
    []
  );

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((ns) => ns.filter((n) => n.id !== nodeId));
    setEdges((es) => es.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
  }, []);

  const { executing, executeWorkflow, stopExecution } = useWorkflowExecution({
    nodes, edges, setNodes,
  });

  const save = useCallback(async () => {
    if (!agent) return;
    try {
      setSaving(true);
      await agentService.update(agent.id, {
        nodes: toWorkflowNodes(nodes),
        edges: toWorkflowEdges(edges),
      });
      setError('');
    } catch {
      setError('Failed to save workflow');
    } finally {
      setSaving(false);
    }
  }, [agent, nodes, edges]);

  return {
    agent, components, nodes, edges, selectedNode, loading, saving, error,
    executing,
    setSelectedNode, onNodesChange, onEdgesChange, onConnect,
    addNode, updateNodeConfig, deleteNode, save, setError,
    executeWorkflow, stopExecution,
  };
};
