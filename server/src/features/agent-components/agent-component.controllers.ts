import { Request, Response } from 'express';
import * as componentService from './agent-component.services';

export async function getComponents(
  _req: Request,
  res: Response
): Promise<void> {
  const components = await componentService.getAllComponents();
  res.json(components);
}

export async function getComponent(
  req: Request,
  res: Response
): Promise<void> {
  const id = req.params.id as string;
  const component = await componentService.getComponentById(id);
  if (!component) {
    res.status(404).json({ error: 'Component not found' });
    return;
  }
  res.json(component);
}

export async function createComponent(
  req: Request,
  res: Response
): Promise<void> {
  const component = await componentService.createComponent(req.body);
  res.status(201).json(component);
}

export async function updateComponent(
  req: Request,
  res: Response
): Promise<void> {
  const id = req.params.id as string;
  const component = await componentService.updateComponent(id, req.body);
  if (!component) {
    res.status(404).json({ error: 'Component not found' });
    return;
  }
  res.json(component);
}

export async function deleteComponent(
  req: Request,
  res: Response
): Promise<void> {
  const id = req.params.id as string;
  const success = await componentService.deleteComponent(id);
  if (!success) {
    res.status(404).json({ error: 'Component not found' });
    return;
  }
  res.status(204).send();
}
