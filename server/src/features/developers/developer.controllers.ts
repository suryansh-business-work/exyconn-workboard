import { Request, Response } from 'express';
import * as developerService from './developer.services';

export async function getDevelopers(_req: Request, res: Response): Promise<void> {
  const developers = await developerService.getAllDevelopers();
  res.json(developers);
}

export async function getDeveloper(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const developer = await developerService.getDeveloperById(id);
  if (!developer) {
    res.status(404).json({ error: 'Developer not found' });
    return;
  }
  res.json(developer);
}

export async function createDeveloper(req: Request, res: Response): Promise<void> {
  const { developer, emailSent } = await developerService.createDeveloper(req.body);
  res.status(201).json({ ...developer.toObject(), emailSent });
}

export async function updateDeveloper(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const developer = await developerService.updateDeveloper(id, req.body);
  if (!developer) {
    res.status(404).json({ error: 'Developer not found' });
    return;
  }
  res.json(developer);
}

export async function deleteDeveloper(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const success = await developerService.deleteDeveloper(id);
  if (!success) {
    res.status(404).json({ error: 'Developer not found' });
    return;
  }
  res.status(204).send();
}
