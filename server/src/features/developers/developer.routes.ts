import { Router } from 'express';
import * as developerController from './developer.controllers';
import { validate } from '../../middleware/validate';
import {
  createDeveloperSchema,
  updateDeveloperSchema,
  developerIdParamSchema,
} from './developer.validators';

const router = Router();

router.get('/', developerController.getDevelopers);

router.get(
  '/:id',
  validate({ params: developerIdParamSchema }),
  developerController.getDeveloper
);

router.post(
  '/',
  validate({ body: createDeveloperSchema }),
  developerController.createDeveloper
);

router.put(
  '/:id',
  validate({ params: developerIdParamSchema, body: updateDeveloperSchema }),
  developerController.updateDeveloper
);

router.delete(
  '/:id',
  validate({ params: developerIdParamSchema }),
  developerController.deleteDeveloper
);

export default router;
