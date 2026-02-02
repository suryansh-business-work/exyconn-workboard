import { Router } from 'express';
import * as userController from './user.controllers';
import { validate } from '../../middleware/validate';
import { loginSchema, resendPasswordSchema, userIdParamSchema } from './user.validators';

const router = Router();

router.get('/', userController.getAllUsers);
router.get('/:id', validate({ params: userIdParamSchema }), userController.getUser);
router.post('/login', validate({ body: loginSchema }), userController.login);
router.post('/send-admin-password', userController.sendAdminPassword);
router.post(
  '/resend-password',
  validate({ body: resendPasswordSchema }),
  userController.resendPassword
);
router.delete('/:id', validate({ params: userIdParamSchema }), userController.deleteUser);

export default router;
