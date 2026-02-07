import { Request, Response } from 'express';
import * as agentService from './agent.services';

export async function getAgents(_req: Request, res: Response): Promise<void> {
  const agents = await agentService.getAllAgents();
  res.json(agents);
}

export async function getAgent(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const agent = await agentService.getAgentById(id);
  if (!agent) {
    res.status(404).json({ error: 'Agent not found' });
    return;
  }
  res.json(agent);
}

export async function createAgent(req: Request, res: Response): Promise<void> {
  const agent = await agentService.createAgent(req.body);
  res.status(201).json(agent);
}

export async function updateAgent(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const agent = await agentService.updateAgent(id, req.body);
  if (!agent) {
    res.status(404).json({ error: 'Agent not found' });
    return;
  }
  res.json(agent);
}

export async function deleteAgent(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const success = await agentService.deleteAgent(id);
  if (!success) {
    res.status(404).json({ error: 'Agent not found' });
    return;
  }
  res.status(204).send();
}
