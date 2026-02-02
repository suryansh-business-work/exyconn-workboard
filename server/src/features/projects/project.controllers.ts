import { Request, Response } from 'express';
import * as projectService from './project.services';

export async function getAllProjects(_req: Request, res: Response): Promise<void> {
  const projects = await projectService.getAllProjects();
  res.json(projects);
}

export async function getProject(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const project = await projectService.getProjectById(id);
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  res.json(project);
}

export async function createProject(req: Request, res: Response): Promise<void> {
  const project = await projectService.createProject(req.body);
  res.status(201).json(project);
}

export async function updateProject(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const project = await projectService.updateProject(id, req.body);
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  res.json(project);
}

export async function deleteProject(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const project = await projectService.deleteProject(id);
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  res.status(204).send();
}
