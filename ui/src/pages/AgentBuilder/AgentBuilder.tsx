import { useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Box, CircularProgress, Alert } from '@mui/material';
import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import BuilderToolbar from './BuilderToolbar';
import BuilderCanvas from './BuilderCanvas';
import BuilderChatPanel from './BuilderChatPanel';
import ComponentPalette from './ComponentPalette';
import NodeConfigPanel from './NodeConfigPanel';
import { useAgentBuilder } from './useAgentBuilder';

const AgentBuilderInner = () => {
  const { id } = useParams<{ id: string }>();

  const {
    agent,
    components,
    nodes,
    edges,
    selectedNode,
    loading,
    saving,
    error,
    executing,
    setSelectedNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    updateNodeConfig,
    deleteNode,
    save,
    setError,
    executeWorkflow,
    stopExecution,
    triggerFromNode,
    lastResults,
    refreshComponents,
    buildWorkflow,
  } = useAgentBuilder(id!);

  const nodesWithTrigger = useMemo(
    () =>
      nodes.map((n) =>
        n.data.category === 'event'
          ? { ...n, data: { ...n.data, onTrigger: triggerFromNode } }
          : n
      ),
    [nodes, triggerFromNode]
  );

  const handleDownload = useCallback(() => {
    const workflowData = {
      agent: { name: agent?.name, description: agent?.description },
      nodes: nodes.map((n) => ({
        nodeId: n.id,
        componentId: n.data.componentId,
        componentName: n.data.componentName,
        category: n.data.category,
        position: n.position,
        config: n.data.config ?? {},
      })),
      edges: edges.map((e) => ({ source: e.source, target: e.target })),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(workflowData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${agent?.name || 'workflow'}-export.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [agent, nodes, edges]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!agent) {
    return <Alert severity="error">Agent not found</Alert>;
  }

  const workflowNodes = nodes.map((n) => ({
    nodeId: n.id,
    componentId: n.data.componentId,
    componentName: n.data.componentName,
    category: n.data.category,
    color: n.data.color,
    position: n.position,
    config: n.data.config ?? {},
  }));
  const workflowEdges = edges.map((e) => ({
    edgeId: e.id,
    source: e.source,
    target: e.target,
  }));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 55px)' }}>
      <BuilderToolbar
        agentName={agent.name}
        saving={saving}
        executing={executing}
        nodeCount={nodes.length}
        onSave={save}
        onExecute={executeWorkflow}
        onStop={stopExecution}
        onDownload={handleDownload}
      />
      {error && (
        <Alert severity="error" sx={{ mx: 1, mt: 0.5 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <ComponentPalette components={components} onDragStart={() => {}} />
        <Box
          sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <BuilderCanvas
              nodes={nodesWithTrigger}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={(node) => setSelectedNode(node)}
              onPaneClick={() => setSelectedNode(null)}
              onAddNode={addNode}
            />
          </Box>
          <BuilderChatPanel
            agentName={agent.name}
            nodes={workflowNodes}
            edges={workflowEdges}
            components={components}
            onComponentCreated={async () => { await refreshComponents(); }}
            onBuildWorkflow={buildWorkflow}
          />
        </Box>
        {selectedNode && (
          <NodeConfigPanel
            node={selectedNode}
            components={components}
            onUpdateConfig={updateNodeConfig}
            onDelete={deleteNode}
            onClose={() => setSelectedNode(null)}
            lastResults={lastResults}
          />
        )}
      </Box>
    </Box>
  );
};

const AgentBuilder = () => (
  <ReactFlowProvider>
    <AgentBuilderInner />
  </ReactFlowProvider>
);

export default AgentBuilder;
