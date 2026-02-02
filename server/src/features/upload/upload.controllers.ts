import { Request, Response } from 'express';
import * as uploadService from './upload.services';

export async function uploadImage(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    res.status(400).json({ error: 'No image file provided' });
    return;
  }

  try {
    const result = await uploadService.uploadImage(
      req.file.buffer,
      req.file.originalname
    );
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload image';
    res.status(500).json({ error: message });
  }
}

export async function deleteImage(req: Request, res: Response): Promise<void> {
  const fileId = req.params.fileId as string;
  try {
    await uploadService.deleteImage(fileId);
    res.status(204).send();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete image';
    res.status(500).json({ error: message });
  }
}
