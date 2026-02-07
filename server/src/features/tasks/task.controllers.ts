import { Request, Response } from 'express';
import * as taskService from './task.services';

export async function getTasks(_req: Request, res: Response): Promise<void> {
  const tasks = await taskService.getAllTasks();
  res.json(tasks);
}

export async function getTask(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const task = await taskService.getTaskById(id);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  res.json(task);
}

export async function getTaskHistory(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const history = await taskService.getTaskHistory(id);
  res.json(history);
}

export async function createTask(req: Request, res: Response): Promise<void> {
  const task = await taskService.createTask(req.body);
  res.status(201).json(task);
}

export async function updateTask(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const task = await taskService.updateTask(id, req.body);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  res.json(task);
}

export async function deleteTask(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const success = await taskService.deleteTask(id);
  if (!success) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  res.status(204).send();
}

export async function aiSearchTasks(req: Request, res: Response): Promise<void> {
  try {
    const { query } = req.body;
    const result = await taskService.aiSearchTasks(query);
    res.json(result);
  } catch (error) {
    console.error('AI search error:', error);
    const message = error instanceof Error ? error.message : 'Failed to search tasks';
    res.status(500).json({ error: message });
  }
}

// Comment controllers
export async function getComments(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const comments = await taskService.getComments(id);
  if (!comments) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  res.json(comments);
}

export async function addComment(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const comment = await taskService.addComment(id, req.body);
  if (!comment) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  res.status(201).json(comment);
}

export async function updateComment(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const commentId = req.params.commentId as string;
  const comment = await taskService.updateComment(id, commentId, req.body);
  if (!comment) {
    res.status(404).json({ error: 'Task or comment not found' });
    return;
  }
  res.json(comment);
}

export async function deleteComment(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const commentId = req.params.commentId as string;
  const success = await taskService.deleteComment(id, commentId);
  if (!success) {
    res.status(404).json({ error: 'Task or comment not found' });
    return;
  }
  res.status(204).send();
}

// Agent execution controllers
export async function logAgentExecution(req: Request, res: Response): Promise<void> {
  const taskId = req.params.id as string;
  try {
    const log = await taskService.createAgentExecution(taskId, req.body);
    res.status(201).json(log);
  } catch (error) {
    console.error('Agent execution log error:', error);
    res.status(500).json({ error: 'Failed to log agent execution' });
  }
}

export async function getAgentExecutionLogs(req: Request, res: Response): Promise<void> {
  const taskId = req.params.id as string;
  try {
    const logs = await taskService.getAgentExecutions(taskId);
    res.json(logs);
  } catch (error) {
    console.error('Get agent logs error:', error);
    res.status(500).json({ error: 'Failed to get agent execution logs' });
  }
}
