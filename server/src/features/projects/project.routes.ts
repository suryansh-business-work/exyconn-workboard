import { Router } from 'express';
import * as projectController from './project.controllers';
import { validate } from '../../middleware/validate';
import {
  createProjectSchema,
  updateProjectSchema,
  projectIdParamSchema,
} from './project.validators';

const router = Router();

router.get('/', projectController.getAllProjects);

router.get(
  '/:id',
  validate({ params: projectIdParamSchema }),
  projectController.getProject
);

router.post(
  '/',
  validate({ body: createProjectSchema }),
  projectController.createProject
);

router.put(
  '/:id',
  validate({ params: projectIdParamSchema, body: updateProjectSchema }),
  projectController.updateProject
);

router.delete(
  '/:id',
  validate({ params: projectIdParamSchema }),
  projectController.deleteProject
);

export default router;
