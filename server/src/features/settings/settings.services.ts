import {
  SMTPConfig,
  ImageKitConfig,
  OpenAIConfig,
  DailyReportConfig,
  ISMTPConfig,
  IImageKitConfig,
  IOpenAIConfig,
  IDailyReportConfig,
} from './settings.models';
import {
  SMTPConfigInput,
  ImageKitConfigInput,
  OpenAIConfigInput,
} from './settings.validators';
import { Developer } from '../developers/developer.models';
import { Task } from '../tasks/task.models';
import { sendDailyReportEmail } from '../email/email.services';

const SETTINGS_ID = 'default';

export async function getSMTPConfig(): Promise<ISMTPConfig> {
  let config = await SMTPConfig.findOne();
  if (!config) {
    config = await SMTPConfig.create({});
  }
  return config;
}

export async function updateSMTPConfig(data: SMTPConfigInput): Promise<ISMTPConfig> {
  const config = await SMTPConfig.findOneAndUpdate({}, data, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });
  return config!;
}

export async function getImageKitConfig(): Promise<IImageKitConfig> {
  let config = await ImageKitConfig.findOne();
  if (!config) {
    config = await ImageKitConfig.create({});
  }
  return config;
}

export async function updateImageKitConfig(
  data: ImageKitConfigInput
): Promise<IImageKitConfig> {
  const config = await ImageKitConfig.findOneAndUpdate({}, data, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });
  return config!;
}

export async function getOpenAIConfig(): Promise<IOpenAIConfig> {
  let config = await OpenAIConfig.findOne();
  if (!config) {
    config = await OpenAIConfig.create({});
  }
  return config;
}

export async function updateOpenAIConfig(
  data: OpenAIConfigInput
): Promise<IOpenAIConfig> {
  const config = await OpenAIConfig.findOneAndUpdate({}, data, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });
  return config!;
}

export async function getDailyReportSettings(): Promise<IDailyReportConfig> {
  let config = await DailyReportConfig.findOne();
  if (!config) {
    config = await DailyReportConfig.create({});
  }
  return config;
}

export async function updateDailyReportSettings(data: {
  enabled?: boolean;
  recipientEmail?: string;
}): Promise<IDailyReportConfig> {
  const config = await DailyReportConfig.findOneAndUpdate({}, data, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });
  return config!;
}

export async function sendStatusToAllResources(): Promise<number> {
  const developers = await Developer.find();
  if (!developers.length) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tasks = await Task.find();
  const totalTasks = tasks.length;
  const todoTasks = tasks.filter((t) => t.status === 'todo').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').length;
  const inReviewTasks = tasks.filter((t) => t.status === 'in-review').length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;

  const overdueTasks = tasks.filter((t) => {
    if (t.status === 'done') return false;
    const due = new Date(t.dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  }).length;

  const dueTodayTasks = tasks.filter((t) => {
    const due = new Date(t.dueDate);
    return (
      due.getFullYear() === today.getFullYear() &&
      due.getMonth() === today.getMonth() &&
      due.getDate() === today.getDate()
    );
  }).length;

  const p1Tasks = tasks.filter((t) => t.priority === 'P1' && t.status !== 'done').length;
  const p2Tasks = tasks.filter((t) => t.priority === 'P2' && t.status !== 'done').length;

  const report = {
    totalTasks,
    todoTasks,
    inProgressTasks,
    inReviewTasks,
    doneTasks,
    overdueTasks,
    dueTodayTasks,
    p1Tasks,
    p2Tasks,
    date: new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  };

  let sentCount = 0;
  for (const dev of developers) {
    if (dev.email) {
      const sent = await sendDailyReportEmail(dev.email, report);
      if (sent) sentCount++;
    }
  }

  return sentCount;
}
