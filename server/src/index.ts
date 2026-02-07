import express from 'express';
import cors from 'cors';
import { connectDatabase } from './config/database';
import { createHealthHandler, createRootHandler, HealthConfig } from './utils/health';

import taskRoutes from './features/tasks/task.routes';
import developerRoutes from './features/developers/developer.routes';
import settingsRoutes from './features/settings/settings.routes';
import uploadRoutes from './features/upload/upload.routes';
import projectRoutes from './features/projects/project.routes';
import userRoutes from './features/users/user.routes';
import agentRoutes from './features/agents/agent.routes';
import agentComponentRoutes from './features/agent-components/agent-component.routes';
import { ensureAdminUser } from './features/users/user.services';
import { sendPasswordEmail } from './features/email/email.services';
import { startDailyReportCron } from './cron/dailyReport';

const app = express();
const PORT = process.env.PORT || 4011;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/developers', developerRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/agent-components', agentComponentRoutes);

// Standardized Health Configuration
const healthConfig: HealthConfig = {
  name: 'exyconn-workboard-server',
  version: '1.0.0',
  port: PORT,
  domain: 'workboard-api.exyconn.com',
  description: 'Exyconn Workboard Task Management API',
  uiUrl: 'https://workboard.exyconn.com',
  serverUrl: 'https://workboard-api.exyconn.com',
  criticalPackages: ['express', 'mongoose', 'cors', 'nodemailer'],
  async checkDependencies() {
    const mongoose = await import('mongoose');
    return { mongodb: mongoose.connection.readyState === 1 ? 'UP' : 'DOWN' };
  },
};

// Root endpoint
app.get(
  '/',
  createRootHandler({
    ...healthConfig,
    endpoints: {
      health: '/health',
      tasks: '/api/tasks',
      developers: '/api/developers',
      projects: '/api/projects',
      users: '/api/users',
      agents: '/api/agents',
      agentComponents: '/api/agent-components',
      settings: '/api/settings',
    },
  })
);

// Health check endpoints
app.get('/health', createHealthHandler(healthConfig));
app.get('/api/health', createHealthHandler(healthConfig));

// Error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
);

// Start server
async function start() {
  try {
    await connectDatabase();
    const adminResult = await ensureAdminUser();
    if (adminResult.created && adminResult.password) {
      // Send password email to admin
      await sendPasswordEmail('services@exyconn.com', 'Admin', adminResult.password);
      console.log('📧 Admin password email sent');
    }
    startDailyReportCron();
    app.listen(PORT, () => {
      console.log(`🚀 Workboard Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

export default app;
