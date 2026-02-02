import { Router } from 'express';
import multer from 'multer';
import * as uploadController from './upload.controllers';
import { validate } from '../../middleware/validate';
import { deleteImageParamSchema } from './upload.validators';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('image'), uploadController.uploadImage);
router.delete(
  '/:fileId',
  validate({ params: deleteImageParamSchema }),
  uploadController.deleteImage
);

export default router;
