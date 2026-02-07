import { Box, Paper, Typography, Divider, Alert } from '@mui/material';
import PageHeader from '../../components/PageHeader';

const codeBlock = (code: string) => (
  <Box
    component="pre"
    sx={{
      bgcolor: '#1e1e1e',
      color: '#d4d4d4',
      p: 2,
      borderRadius: 1,
      fontSize: 13,
      fontFamily: 'monospace',
      overflow: 'auto',
      my: 1,
    }}
  >
    {code}
  </Box>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
      {title}
    </Typography>
    {children}
    <Divider sx={{ mt: 2 }} />
  </Box>
);

const AgentDocs = () => (
  <Box>
    <PageHeader
      title="Agent Documentation"
      breadcrumbs={[{ label: 'Agents', path: '/agents' }, { label: 'Docs' }]}
    />
    <Paper sx={{ p: 3 }}>
      <Alert severity="info" sx={{ mb: 3 }}>
        This guide explains how agent workflows work — node inputs, outputs, data flow,
        and the code execution context.
      </Alert>

      <Section title="1. Context Object">
        <Typography variant="body2" sx={{ mb: 1 }}>
          Every code node receives a <strong>context</strong> object with these
          properties:
        </Typography>
        {codeBlock(`// Available in every code node:
context.config    // Record<string, string> — node config field values
context.nodeId    // string — unique node ID
context.nodeName  // string — component name
context.category  // string — component category
context.inputs    // Record<string, unknown> — outputs from parent nodes`)}
      </Section>

      <Section title="2. Input / Output Between Nodes">
        <Typography variant="body2" sx={{ mb: 1 }}>
          Data flows through edges. A node&apos;s <strong>return value</strong> becomes
          the <strong>input</strong> for connected downstream nodes.
        </Typography>
        {codeBlock(`// Node A (upstream) — returns data
const data = { users: ['Alice', 'Bob'] };
console.log('Fetched users');
return data;

// Node B (downstream) — receives Node A's output
const nodeAOutput = context.inputs['Node A'];  // key = upstream component name
console.log('Received:', nodeAOutput);
return { processed: nodeAOutput.users.length };`)}
        <Typography variant="body2" color="text.secondary">
          <strong>Key:</strong> The <code>context.inputs</code> object is keyed by the
          upstream node&apos;s <strong>component name</strong>. If multiple nodes connect,
          each key corresponds to a different parent.
        </Typography>
      </Section>

      <Section title="3. Non-Code Nodes (Passthrough)">
        <Typography variant="body2">
          Nodes without code (events, actions, communications) automatically pass through
          the data they receive as inputs. Their output equals their combined inputs.
        </Typography>
      </Section>

      <Section title="4. Console Logging">
        <Typography variant="body2" sx={{ mb: 1 }}>
          Use <code>console.log</code>, <code>console.warn</code>,{' '}
          <code>console.error</code>, and <code>console.info</code> for debugging. Output
          appears in the execution result panel.
        </Typography>
        {codeBlock(`console.log('Processing started');
console.warn('Low memory');
console.error('Something went wrong');
console.info('Info message');`)}
      </Section>

      <Section title="5. Async & External Modules">
        <Typography variant="body2" sx={{ mb: 1 }}>
          Code runs as an <strong>async function</strong>. You can use <code>await</code>{' '}
          and <code>require()</code> to load external npm packages from CDN.
        </Typography>
        {codeBlock(`// Load an npm package (fetched from esm.sh CDN)
const _ = await require('lodash');
const result = _.groupBy(context.inputs['Data Source']?.items, 'category');
return result;`)}
        <Typography variant="body2" sx={{ mb: 1 }}>
          Use <code>fetch()</code> for HTTP requests:
        </Typography>
        {codeBlock(`const response = await fetch('https://api.example.com/data');
const json = await response.json();
console.log('Fetched', json.length, 'items');
return json;`)}
      </Section>

      <Section title="6. Execution Order">
        <Typography variant="body2">
          Nodes execute in <strong>topological order</strong> — parent nodes always run
          before their children. If a node has no incoming edges, it runs first (like
          event triggers). Execution stops at the first error unless you handle errors
          with try/catch.
        </Typography>
      </Section>

      <Section title="7. Example: Complete Workflow">
        {codeBlock(`// Event Node (Trigger) → no code, starts the chain

// Data Fetcher (logic node)
const res = await fetch(context.config.apiUrl || 'https://jsonplaceholder.typicode.com/posts');
const posts = await res.json();
console.log('Fetched', posts.length, 'posts');
return { posts, count: posts.length };

// Processor (logic node) — receives Data Fetcher output
const { posts } = context.inputs['Data Fetcher'];
const filtered = posts.filter(p => p.userId === 1);
console.log('Filtered to', filtered.length, 'posts');
return { filtered, summary: \`Found \${filtered.length} posts by user 1\` };`)}
      </Section>
    </Paper>
  </Box>
);

export default AgentDocs;
