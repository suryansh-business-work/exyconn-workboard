import { Task } from '../features/tasks/task.models';
import { getDailyReportSettings } from '../features/settings/settings.services';
import { sendDailyReportEmail } from '../features/email/email.services';

const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;

async function sendDailyReport(): Promise<void> {
  try {
    const settings = await getDailyReportSettings();
    if (!settings.enabled || !settings.recipientEmail) {
      console.log('📧 Daily report disabled or no recipient');
      return;
    }

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

    const p1Tasks = tasks.filter(
      (t) => t.priority === 'P1' && t.status !== 'done'
    ).length;
    const p2Tasks = tasks.filter(
      (t) => t.priority === 'P2' && t.status !== 'done'
    ).length;

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

    await sendDailyReportEmail(settings.recipientEmail, report);
    console.log(`📧 Daily report sent to ${settings.recipientEmail}`);
  } catch (error) {
    console.error('Failed to send daily report:', error);
  }
}

export function startDailyReportCron(): void {
  console.log('⏰ Daily report cron started (every 8 hours)');
  // Send immediately on start if enabled
  sendDailyReport();
  // Then every 8 hours
  setInterval(sendDailyReport, EIGHT_HOURS_MS);
}
