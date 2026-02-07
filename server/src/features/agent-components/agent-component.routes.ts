import { Router } from 'express';
import * as controller from './agent-component.controllers';
import { validate } from '../../middleware/validate';
import {
  createAgentComponentSchema,
  updateAgentComponentSchema,
  agentComponentIdParamSchema,
} from './agent-component.validators';

const router = Router();

router.get('/', controller.getComponents);

router.get(
  '/:id',
  validate({ params: agentComponentIdParamSchema }),
  controller.getComponent
);

router.post(
  '/',
  validate({ body: createAgentComponentSchema }),
  controller.createComponent
);

router.put(
  '/:id',
  validate({ params: agentComponentIdParamSchema, body: updateAgentComponentSchema }),
  controller.updateComponent
);

router.delete(
  '/:id',
  validate({ params: agentComponentIdParamSchema }),
  controller.deleteComponent
);

export default router;
