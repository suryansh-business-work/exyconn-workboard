import { Request, Response } from 'express';
import * as settingsService from './settings.services';
import { sendTestEmail } from '../email/email.services';

export async function getSMTPConfig(_req: Request, res: Response): Promise<void> {
  const config = await settingsService.getSMTPConfig();
  res.json({ ...config.toObject(), password: config.password ? '********' : '' });
}

export async function updateSMTPConfig(req: Request, res: Response): Promise<void> {
  const currentConfig = await settingsService.getSMTPConfig();
  const newConfig = {
    ...req.body,
    password:
      req.body.password === '********' ? currentConfig.password : req.body.password,
  };
  const config = await settingsService.updateSMTPConfig(newConfig);
  res.json({ ...config.toObject(), password: '********' });
}

export async function testSMTPConfig(req: Request, res: Response): Promise<void> {
  const result = await sendTestEmail(req.body.email);
  res.json(result);
}

export async function getImageKitConfig(_req: Request, res: Response): Promise<void> {
  const config = await settingsService.getImageKitConfig();
  res.json({ ...config.toObject(), privateKey: config.privateKey ? '********' : '' });
}

export async function updateImageKitConfig(req: Request, res: Response): Promise<void> {
  const currentConfig = await settingsService.getImageKitConfig();
  const newConfig = {
    ...req.body,
    privateKey:
      req.body.privateKey === '********' ? currentConfig.privateKey : req.body.privateKey,
  };
  const config = await settingsService.updateImageKitConfig(newConfig);
  res.json({ ...config.toObject(), privateKey: '********' });
}

export async function getOpenAIConfig(_req: Request, res: Response): Promise<void> {
  const config = await settingsService.getOpenAIConfig();
  res.json({
    apiKey: config.apiKey ? '********' : '',
    openAIModel: config.openAIModel,
    maxTokens: config.maxTokens,
  });
}

export async function updateOpenAIConfig(req: Request, res: Response): Promise<void> {
  const currentConfig = await settingsService.getOpenAIConfig();
  const newConfig = {
    ...req.body,
    apiKey: req.body.apiKey === '********' ? currentConfig.apiKey : req.body.apiKey,
  };
  const config = await settingsService.updateOpenAIConfig(newConfig);
  res.json({
    apiKey: '********',
    openAIModel: config.openAIModel,
    maxTokens: config.maxTokens,
  });
}

export async function parseTaskFromChat(req: Request, res: Response): Promise<void> {
  try {
    const openaiConfig = await settingsService.getOpenAIConfig();
    if (!openaiConfig.apiKey) {
      res.status(400).json({ error: 'OpenAI API key not configured' });
      return;
    }

    const { message, history } = req.body;

    // Build messages array with history for context
    const messages: Array<{ role: string; content: string }> = [
      {
        role: 'system',
        content: `You are a task parser. Parse the user's message and extract task details. If the user is refining or updating a previous task description, incorporate those changes. Return a JSON object with these fields:
- title: string (required, concise task title)
- description: string (MUST be valid HTML rich text using tags like <p>, <strong>, <em>, <ul>, <ol>, <li>, <h3>, <blockquote>, <code>, <a>. Format the description nicely with proper paragraphs, bullet points where appropriate, and emphasis on key terms. Do NOT use markdown, only HTML tags.)
- priority: "low" | "medium" | "high" (infer from urgency)
- labels: string[] (relevant labels like "bug", "feature", "enhancement", "documentation", "urgent")
- estimatedDueDate: number (days from now, default 7)

Only return valid JSON, no markdown or explanation.`,
      },
    ];

    // Add chat history for context if provided
    if (history && Array.isArray(history)) {
      messages.push(
        ...history.map((h: { role: string; content: string }) => ({
          role: h.role === 'user' ? 'user' : 'assistant',
          content: h.content,
        }))
      );
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message,
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiConfig.apiKey}`,
      },
      body: JSON.stringify({
        model: openaiConfig.openAIModel || 'gpt-4o-mini',
        max_tokens: openaiConfig.maxTokens || 1000,
        messages,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as { error?: { message?: string } };
      res.status(500).json({ error: errorData.error?.message || 'OpenAI API error' });
      return;
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const parsed = JSON.parse(data.choices[0].message.content);
    res.json(parsed);
  } catch (error) {
    console.error('Parse task error:', error);
    res.status(500).json({ error: 'Failed to parse task' });
  }
}

interface TaskForAnalysis {
  id: string;
  taskId: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  labels?: string[];
  assignee?: string;
  dueDate?: string;
}

export async function analyzeTasksWithAI(req: Request, res: Response): Promise<void> {
  try {
    const openaiConfig = await settingsService.getOpenAIConfig();
    if (!openaiConfig.apiKey) {
      res.status(400).json({ error: 'OpenAI API key not configured' });
      return;
    }

    const { message, tasks, history } = req.body as {
      message: string;
      tasks: TaskForAnalysis[];
      history?: { role: string; content: string }[];
    };

    // Build task summary for context
    const taskSummary = tasks
      .map(
        (t: TaskForAnalysis) =>
          `[${t.taskId}] ${t.title} | Status: ${t.status} | Priority: ${t.priority} | Labels: ${t.labels?.join(', ') || 'none'} | Assignee: ${t.assignee || 'unassigned'} | Due: ${t.dueDate || 'not set'}`
      )
      .join('\n');

    const messages: Array<{ role: string; content: string }> = [
      {
        role: 'system',
        content: `You are a smart task management assistant. You have access to the user's task list and can help analyze, prioritize, and suggest which tasks to focus on.

Current Tasks:
${taskSummary}

Based on user queries, provide helpful analysis and recommendations. Return a JSON object with:
- response: string (your helpful response text)
- suggestedTaskIds: string[] (array of task IDs to highlight/filter, if applicable)
- action: string | null (optional action like "filter", "sort", "highlight")

Be concise but helpful. If suggesting tasks, explain why.`,
      },
    ];

    // Add chat history for context if provided
    if (history && Array.isArray(history)) {
      messages.push(
        ...history.map((h: { role: string; content: string }) => ({
          role: h.role === 'user' ? 'user' : 'assistant',
          content: h.content,
        }))
      );
    }

    messages.push({
      role: 'user',
      content: message,
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiConfig.apiKey}`,
      },
      body: JSON.stringify({
        model: openaiConfig.openAIModel || 'gpt-4o-mini',
        max_tokens: openaiConfig.maxTokens || 1000,
        messages,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as { error?: { message?: string } };
      res.status(500).json({ error: errorData.error?.message || 'OpenAI API error' });
      return;
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const result = JSON.parse(data.choices[0].message.content);
    res.json(result);
  } catch (error) {
    console.error('Analyze tasks error:', error);
    res.status(500).json({ error: 'Failed to analyze tasks' });
  }
}

export async function rewriteWithAI(req: Request, res: Response): Promise<void> {
  try {
    const openaiConfig = await settingsService.getOpenAIConfig();
    if (!openaiConfig.apiKey) {
      res.status(400).json({ error: 'OpenAI API key not configured' });
      return;
    }

    const { text, context } = req.body as { text: string; context?: string };

    const baseInstructions = `Improve the English grammar and vocabulary. Make it short, more descriptive and informative. Keep the technical accuracy intact.
    
IMPORTANT: Return the response as valid HTML rich text using tags like <p>, <strong>, <em>, <ul>, <ol>, <li>, <h3>, <blockquote>, <code>, <a>. Format nicely with proper paragraphs, bullet points where appropriate, and emphasis on key terms. Do NOT use markdown syntax like ** or -, only use HTML tags. Do NOT wrap in code blocks.`;

    const systemPrompt = context
      ? `You are a professional technical writer. ${baseInstructions} Context: ${context}. Return only the rewritten HTML content, no explanations.`
      : `You are a professional technical writer. ${baseInstructions} Return only the rewritten HTML content, no explanations.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiConfig.apiKey}`,
      },
      body: JSON.stringify({
        model: openaiConfig.openAIModel || 'gpt-4o-mini',
        max_tokens: openaiConfig.maxTokens || 1000,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as { error?: { message?: string } };
      res.status(500).json({ error: errorData.error?.message || 'OpenAI API error' });
      return;
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    res.json({ rewrittenText: data.choices[0].message.content });
  } catch (error) {
    console.error('Rewrite error:', error);
    res.status(500).json({ error: 'Failed to rewrite text' });
  }
}

export async function getDailyReportSettings(
  _req: Request,
  res: Response
): Promise<void> {
  const config = await settingsService.getDailyReportSettings();
  res.json(config);
}

export async function updateDailyReportSettings(
  req: Request,
  res: Response
): Promise<void> {
  const config = await settingsService.updateDailyReportSettings(req.body);
  res.json(config);
}

export async function sendStatusToAllResources(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const sentCount = await settingsService.sendStatusToAllResources();
    res.json({ sentCount });
  } catch (error) {
    console.error('Send status to all resources error:', error);
    res.status(500).json({ error: 'Failed to send status report' });
  }
}

export async function generateCode(req: Request, res: Response): Promise<void> {
  try {
    const openaiConfig = await settingsService.getOpenAIConfig();
    if (!openaiConfig.apiKey) {
      res.status(400).json({ error: 'OpenAI API key not configured' });
      return;
    }
    const { prompt, currentCode } = req.body as { prompt: string; currentCode?: string };
    const systemPrompt = `You are a JavaScript code generator for an agent workflow builder. Generate ONLY valid JavaScript code — no explanations, no markdown, no code fences.\nThe code runs inside a function with these available variables:\n- context.config: node config object\n- context.nodeId: current node id\n- context.nodeName: node name\n- context.category: node category\n- context.inputs: object with outputs from connected parent nodes\n- console.log/warn/error: for logging\n- Return a value to pass output to downstream nodes.\nCurrent code:\n${currentCode || '// empty'}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiConfig.apiKey}`,
      },
      body: JSON.stringify({
        model: openaiConfig.openAIModel || 'gpt-4o-mini',
        max_tokens: openaiConfig.maxTokens || 1500,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
      }),
    });
    if (!response.ok) {
      const errorData = (await response.json()) as { error?: { message?: string } };
      res.status(500).json({ error: errorData.error?.message || 'OpenAI API error' });
      return;
    }
    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const raw = data.choices?.[0]?.message?.content || '';
    const code = raw
      .replace(/^```[\w]*\n?/gm, '')
      .replace(/```$/gm, '')
      .trim();
    res.json({ code });
  } catch (error) {
    console.error('Generate code error:', error);
    res.status(500).json({ error: 'Failed to generate code' });
  }
}

export async function generateComponent(req: Request, res: Response): Promise<void> {
  try {
    const openaiConfig = await settingsService.getOpenAIConfig();
    if (!openaiConfig.apiKey) {
      res.status(400).json({ error: 'OpenAI API key not configured' });
      return;
    }
    const { prompt } = req.body as { prompt: string };
    const systemPrompt = `You are an agent component generator. Given a user description, generate a complete agent component definition as JSON with these fields:
- name: string (short descriptive name, max 50 chars)
- category: one of "event" | "data-scrapper" | "communication" | "ai" | "action" | "logic" | "custom"
- description: string (1-2 sentence description)
- color: hex color code from: #1976d2, #f57c00, #2e7d32, #9c27b0, #d32f2f, #00796b, #616161, #e91e63
- configSchema: array of config fields, each with { key: string, label: string, type: "text"|"number"|"textarea"|"select"|"password", required: boolean, defaultValue: string, placeholder: string, options: { label: string, value: string }[] }
- defaultCode: string (JavaScript code that implements the component logic. The code runs in a sandboxed function with context.config, context.inputs, context.nodeId, context.nodeName, console.log available. Return a value to output.)

Generate realistic, working code. Only return valid JSON, no markdown.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiConfig.apiKey}`,
      },
      body: JSON.stringify({
        model: openaiConfig.openAIModel || 'gpt-4o-mini',
        max_tokens: openaiConfig.maxTokens || 2000,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      }),
    });
    if (!response.ok) {
      const errorData = (await response.json()) as { error?: { message?: string } };
      res.status(500).json({ error: errorData.error?.message || 'OpenAI API error' });
      return;
    }
    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const parsed = JSON.parse(data.choices[0].message.content);
    res.json(parsed);
  } catch (error) {
    console.error('Generate component error:', error);
    res.status(500).json({ error: 'Failed to generate component' });
  }
}

export async function buildAgent(req: Request, res: Response): Promise<void> {
  try {
    const openaiConfig = await settingsService.getOpenAIConfig();
    if (!openaiConfig.apiKey) {
      res.status(400).json({ error: 'OpenAI API key not configured' });
      return;
    }
    const { message, components, currentNodes, history } = req.body as {
      message: string;
      components: { id: string; name: string; category: string; description: string }[];
      currentNodes: { componentName: string; category: string }[];
      history?: { role: string; content: string }[];
    };

    const compList = components
      .map((c) => `- ${c.name} [${c.category}]: ${c.description}`)
      .join('\n');
    const nodeList =
      currentNodes.length > 0
        ? currentNodes.map((n) => `- ${n.componentName} (${n.category})`).join('\n')
        : 'Empty workflow';

    const systemPrompt = `You are an AI agent workflow builder assistant. Help users design agent workflows.

Available Components:
${compList || 'No components available yet.'}

Current Workflow Nodes:
${nodeList}

When the user asks to build an agent:
1. Check if all needed components exist in the available list
2. If components are missing, list them in missingComponents with details
3. If all components exist, provide a workflow with nodes and edges

Return JSON:
{
  "message": "HTML response explaining your plan. Use <p>, <strong>, <ul>, <li> tags. Be concise.",
  "missingComponents": [
    { "name": "Component Name", "category": "logic|event|ai|action|communication|data-scrapper|custom", "description": "What it does", "suggestedPrompt": "Detailed prompt to generate this component via AI" }
  ],
  "workflow": null or {
    "nodes": [
      { "componentName": "Existing Component Name", "category": "its category", "position": { "x": 250, "y": 50 }, "config": {} }
    ],
    "edges": [{ "sourceIndex": 0, "targetIndex": 1 }]
  }
}

Rules:
- Only include components in workflow.nodes that exist in the available list (exact name match)
- Every workflow MUST start with an event trigger node as the very first node (index 0). If no event component exists, add it to missingComponents.
- Position nodes in a nice vertical layout, 200px apart vertically
- Keep messages short and helpful. Use HTML formatting.
- If user asks general questions (not building), just answer in message field with empty missingComponents and null workflow`;

    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];
    if (history && Array.isArray(history)) {
      messages.push(
        ...history.map((h: { role: string; content: string }) => ({
          role: h.role === 'user' ? 'user' : 'assistant',
          content: h.content,
        }))
      );
    }
    messages.push({ role: 'user', content: message });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiConfig.apiKey}`,
      },
      body: JSON.stringify({
        model: openaiConfig.openAIModel || 'gpt-4o-mini',
        max_tokens: openaiConfig.maxTokens || 2000,
        messages,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as { error?: { message?: string } };
      res.status(500).json({ error: errorData.error?.message || 'OpenAI API error' });
      return;
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const parsed = JSON.parse(data.choices[0].message.content);
    res.json(parsed);
  } catch (error) {
    console.error('Build agent error:', error);
    res.status(500).json({ error: 'Failed to build agent' });
  }
}
