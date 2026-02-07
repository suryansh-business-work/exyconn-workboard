import { Router } from 'express';
import * as settingsController from './settings.controllers';
import { validate } from '../../middleware/validate';
import {
  smtpConfigSchema,
  imageKitConfigSchema,
  openAIConfigSchema,
  testEmailSchema,
  parseTaskSchema,
  analyzeTasksSchema,
  rewriteTextSchema,
  generateCodeSchema,
  generateComponentSchema,
  buildAgentSchema,
} from './settings.validators';

const router = Router();

// SMTP
router.get('/smtp', settingsController.getSMTPConfig);
router.put(
  '/smtp',
  validate({ body: smtpConfigSchema }),
  settingsController.updateSMTPConfig
);
router.post(
  '/smtp/test',
  validate({ body: testEmailSchema }),
  settingsController.testSMTPConfig
);

// ImageKit
router.get('/imagekit', settingsController.getImageKitConfig);
router.put(
  '/imagekit',
  validate({ body: imageKitConfigSchema }),
  settingsController.updateImageKitConfig
);

// OpenAI
router.get('/openai', settingsController.getOpenAIConfig);
router.put(
  '/openai',
  validate({ body: openAIConfigSchema }),
  settingsController.updateOpenAIConfig
);
router.post(
  '/openai/parse-task',
  validate({ body: parseTaskSchema }),
  settingsController.parseTaskFromChat
);
router.post(
  '/openai/analyze-tasks',
  validate({ body: analyzeTasksSchema }),
  settingsController.analyzeTasksWithAI
);
router.post(
  '/openai/rewrite',
  validate({ body: rewriteTextSchema }),
  settingsController.rewriteWithAI
);

router.post(
  '/openai/generate-code',
  validate({ body: generateCodeSchema }),
  settingsController.generateCode
);
router.post(
  '/openai/generate-component',
  validate({ body: generateComponentSchema }),
  settingsController.generateComponent
);
router.post(
  '/openai/build-agent',
  validate({ body: buildAgentSchema }),
  settingsController.buildAgent
);

// Daily Report
router.get('/daily-report', settingsController.getDailyReportSettings);
router.put('/daily-report', settingsController.updateDailyReportSettings);
router.post('/daily-report/send-to-all', settingsController.sendStatusToAllResources);

export default router;
