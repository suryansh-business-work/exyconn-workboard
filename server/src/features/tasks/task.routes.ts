import { Router } from 'express';
import * as taskController from './task.controllers';
import { validate } from '../../middleware/validate';
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdParamSchema,
  aiSearchSchema,
  commentSchema,
  commentIdParamSchema,
} from './task.validators';

const router = Router();

router.get('/', taskController.getTasks);

router.get('/:id', validate({ params: taskIdParamSchema }), taskController.getTask);

router.get(
  '/:id/history',
  validate({ params: taskIdParamSchema }),
  taskController.getTaskHistory
);

// Comment routes
router.get(
  '/:id/comments',
  validate({ params: taskIdParamSchema }),
  taskController.getComments
);

router.post(
  '/:id/comments',
  validate({ params: taskIdParamSchema, body: commentSchema }),
  taskController.addComment
);

router.put(
  '/:id/comments/:commentId',
  validate({ params: commentIdParamSchema, body: commentSchema }),
  taskController.updateComment
);

router.delete(
  '/:id/comments/:commentId',
  validate({ params: commentIdParamSchema }),
  taskController.deleteComment
);

router.post('/', validate({ body: createTaskSchema }), taskController.createTask);

router.post(
  '/ai-search',
  validate({ body: aiSearchSchema }),
  taskController.aiSearchTasks
);

router.put(
  '/:id',
  validate({ params: taskIdParamSchema, body: updateTaskSchema }),
  taskController.updateTask
);

router.delete('/:id', validate({ params: taskIdParamSchema }), taskController.deleteTask);

export default router;
