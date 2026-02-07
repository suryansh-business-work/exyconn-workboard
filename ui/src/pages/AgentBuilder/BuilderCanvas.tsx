import { useCallback, useRef, useMemo } from 'react';
import { Box } from '@mui/material';
import {
  ReactFlow, Background, Controls, MiniMap,
  Node, Edge, Connection, NodeChange, EdgeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import AgentNode from './AgentNode';
import { AgentComponent } from '../../types';
import type { AgentNodeData } from './useAgentBuilder';

interface Props {
  nodes: Node<AgentNodeData>[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange<Node<AgentNodeData>>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onNodeClick: (node: Node<AgentNodeData>) => void;
  onPaneClick: () => void;
  onAddNode: (component: AgentComponent, position: { x: number; y: number }) => void;
}

const BuilderCanvas = ({
  nodes, edges, onNodesChange, onEdgesChange,
  onConnect, onNodeClick, onPaneClick, onAddNode,
}: Props) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const nodeTypes = useMemo(() => ({ agentNode: AgentNode }), []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const raw = event.dataTransfer.getData('application/agentComponent');
      if (!raw) return;
      const component: AgentComponent = JSON.parse(raw);
      const bounds = wrapperRef.current?.getBoundingClientRect();
      if (!bounds) return;
      onAddNode(component, {
        x: event.clientX - bounds.left - 90,
        y: event.clientY - bounds.top - 30,
      });
    },
    [onAddNode]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <Box ref={wrapperRef} sx={{ flex: 1, height: '100%' }} onDrop={onDrop} onDragOver={onDragOver}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => onNodeClick(node)}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        deleteKeyCode="Delete"
      >
        <Background />
        <Controls />
        <MiniMap nodeStrokeWidth={3} />
      </ReactFlow>
    </Box>
  );
};

export default BuilderCanvas;
