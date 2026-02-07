import { Router } from 'express';
import * as agentController from './agent.controllers';
import { validate } from '../../middleware/validate';
import {
  createAgentSchema,
  updateAgentSchema,
  agentIdParamSchema,
} from './agent.validators';

const router = Router();

router.get('/', agentController.getAgents);

router.get(
  '/:id',
  validate({ params: agentIdParamSchema }),
  agentController.getAgent
);

router.post(
  '/',
  validate({ body: createAgentSchema }),
  agentController.createAgent
);

router.put(
  '/:id',
  validate({ params: agentIdParamSchema, body: updateAgentSchema }),
  agentController.updateAgent
);

router.delete(
  '/:id',
  validate({ params: agentIdParamSchema }),
  agentController.deleteAgent
);

export default router;
