import nodemailer from 'nodemailer';
import mjml2html from 'mjml';
import { ITask } from '../tasks/task.models';
import { getDeveloperByName } from '../developers/developer.services';
import { getSMTPConfig } from '../settings/settings.services';

const WORKBOARD_URL = process.env.WORKBOARD_URL || 'https://workboard.exyconn.com';

function generateTaskEmail(task: ITask, action: 'created' | 'updated'): string {
  const statusColors: Record<string, string> = {
    todo: '#9e9e9e',
    'in-progress': '#1976d2',
    'in-review': '#9c27b0',
    done: '#2e7d32',
  };

  const priorityColors: Record<string, string> = {
    P1: '#d32f2f',
    P2: '#f57c00',
    P3: '#fbc02d',
    P4: '#388e3c',
  };

  const formatStatus = (status: string) =>
    status.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  const taskUrl = `${WORKBOARD_URL}/tasks/${task._id}`;

  const mjmlTemplate = `
    <mjml>
      <mj-head>
        <mj-title>Task ${action === 'created' ? 'Created' : 'Updated'}: ${task.title}</mj-title>
        <mj-attributes>
          <mj-all font-family="Inter, Arial, sans-serif" />
          <mj-text font-size="14px" line-height="1.5" color="#333333" />
        </mj-attributes>
      </mj-head>
      <mj-body background-color="#f5f5f5">
        <mj-section background-color="#1976d2" padding="20px">
          <mj-column>
            <mj-text font-size="24px" color="#ffffff" font-weight="bold" align="center">
              Workboard
            </mj-text>
          </mj-column>
        </mj-section>
        <mj-section background-color="#ffffff" padding="30px">
          <mj-column>
            <mj-text font-size="20px" font-weight="bold">${action === 'created' ? 'New Task Created' : 'Task Updated'}</mj-text>
            <mj-text font-size="12px" color="#666666">${task.taskId}</mj-text>
            <mj-divider border-color="#e0e0e0" />
            <mj-text font-size="18px" font-weight="600">${task.title}</mj-text>
            <mj-text color="#666666">${task.description || 'No description'}</mj-text>
            <mj-divider border-color="#e0e0e0" />
            <mj-table>
              <tr>
                <td style="padding:8px 0;width:120px;color:#666;">Status:</td>
                <td style="padding:8px 0;"><span style="background:${statusColors[task.status]}22;color:${statusColors[task.status]};padding:4px 12px;border-radius:16px;font-size:12px;">${formatStatus(task.status)}</span></td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#666;">Priority:</td>
                <td style="padding:8px 0;"><span style="background:${priorityColors[task.priority] || '#fbc02d'}22;color:${priorityColors[task.priority] || '#fbc02d'};padding:4px 12px;border-radius:16px;font-size:12px;">${task.priority}</span></td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#666;">Type:</td>
                <td style="padding:8px 0;font-weight:500;">${task.taskType || 'Task'}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#666;">Assignee:</td>
                <td style="padding:8px 0;font-weight:500;">${task.assignee}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#666;">Due Date:</td>
                <td style="padding:8px 0;">${new Date(task.dueDate).toLocaleDateString()}</td>
              </tr>
            </mj-table>
            <mj-divider border-color="#e0e0e0" />
            <mj-button background-color="#1976d2" href="${taskUrl}">
              View Task in Workboard
            </mj-button>
          </mj-column>
        </mj-section>
        <mj-section padding="20px">
          <mj-column>
            <mj-text font-size="12px" color="#999999" align="center">
              Automated notification from Workboard
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `;

  return mjml2html(mjmlTemplate).html;
}

export async function sendTaskNotification(
  task: ITask,
  action: 'created' | 'updated'
): Promise<boolean> {
  try {
    const smtpConfig = await getSMTPConfig();
    if (!smtpConfig.host || !smtpConfig.user || !smtpConfig.password) {
      console.log('SMTP not configured');
      return false;
    }

    const developer = await getDeveloperByName(task.assignee);
    if (!developer) {
      console.log('Assignee not found');
      return false;
    }

    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: { user: smtpConfig.user, pass: smtpConfig.password },
    });

    await transporter.sendMail({
      from: `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>`,
      to: developer.email,
      subject: `[${task.taskId}] Task ${action}: ${task.title}`,
      html: generateTaskEmail(task, action),
    });

    console.log(`Email sent to ${developer.email}`);
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
}

export async function sendTestEmail(
  email: string
): Promise<{ success: boolean; message: string }> {
  try {
    const smtpConfig = await getSMTPConfig();
    if (!smtpConfig.host || !smtpConfig.user || !smtpConfig.password) {
      return { success: false, message: 'SMTP not configured' };
    }

    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: { user: smtpConfig.user, pass: smtpConfig.password },
    });

    const mjmlTemplate = `
      <mjml>
        <mj-body background-color="#f5f5f5">
          <mj-section background-color="#1976d2" padding="20px">
            <mj-column>
              <mj-text font-size="24px" color="#ffffff" font-weight="bold" align="center">Workboard</mj-text>
            </mj-column>
          </mj-section>
          <mj-section background-color="#ffffff" padding="30px">
            <mj-column>
              <mj-text font-size="20px" font-weight="bold">Test Email</mj-text>
              <mj-text>Your SMTP configuration is working correctly!</mj-text>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `;

    await transporter.sendMail({
      from: `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>`,
      to: email,
      subject: 'Test Email from Workboard',
      html: mjml2html(mjmlTemplate).html,
    });

    return { success: true, message: 'Test email sent' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function sendPasswordEmail(
  email: string,
  name: string,
  password: string
): Promise<boolean> {
  try {
    const smtpConfig = await getSMTPConfig();
    if (!smtpConfig.host || !smtpConfig.user || !smtpConfig.password) {
      console.log('SMTP not configured');
      return false;
    }

    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: { user: smtpConfig.user, pass: smtpConfig.password },
    });

    const mjmlTemplate = `
      <mjml>
        <mj-head>
          <mj-title>Your Workboard Account</mj-title>
          <mj-attributes>
            <mj-all font-family="Inter, Arial, sans-serif" />
            <mj-text font-size="14px" line-height="1.5" color="#333333" />
          </mj-attributes>
        </mj-head>
        <mj-body background-color="#f5f5f5">
          <mj-section background-color="#1976d2" padding="20px">
            <mj-column>
              <mj-text font-size="24px" color="#ffffff" font-weight="bold" align="center">
                Workboard
              </mj-text>
            </mj-column>
          </mj-section>
          <mj-section background-color="#ffffff" padding="30px">
            <mj-column>
              <mj-text font-size="20px" font-weight="bold">Welcome to Workboard!</mj-text>
              <mj-text>Hello ${name},</mj-text>
              <mj-text>Your account has been created. Here are your login credentials:</mj-text>
              <mj-divider border-color="#e0e0e0" />
              <mj-table>
                <tr>
                  <td style="padding:8px 0;width:100px;color:#666;">Email:</td>
                  <td style="padding:8px 0;font-weight:500;">${email}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#666;">Password:</td>
                  <td style="padding:8px 0;font-weight:500;font-family:monospace;background:#f5f5f5;padding:4px 8px;">${password}</td>
                </tr>
              </mj-table>
              <mj-divider border-color="#e0e0e0" />
              <mj-button background-color="#1976d2" href="${WORKBOARD_URL}">
                Open Workboard
              </mj-button>
              <mj-text color="#999999" font-size="12px">
                Please change your password after your first login for security.
              </mj-text>
            </mj-column>
          </mj-section>
          <mj-section padding="20px">
            <mj-column>
              <mj-text font-size="12px" color="#999999" align="center">
                Automated notification from Workboard
              </mj-text>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `;

    await transporter.sendMail({
      from: `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>`,
      to: email,
      subject: 'Welcome to Workboard - Your Login Credentials',
      html: mjml2html(mjmlTemplate).html,
    });

    console.log(`Password email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Password email error:', error);
    return false;
  }
}

interface DailyReportData {
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  inReviewTasks: number;
  doneTasks: number;
  overdueTasks: number;
  dueTodayTasks: number;
  p1Tasks: number;
  p2Tasks: number;
  date: string;
}

export async function sendDailyReportEmail(
  email: string,
  report: DailyReportData
): Promise<boolean> {
  try {
    const smtpConfig = await getSMTPConfig();
    if (!smtpConfig.host || !smtpConfig.user || !smtpConfig.password) {
      console.log('SMTP not configured for daily report');
      return false;
    }

    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: { user: smtpConfig.user, pass: smtpConfig.password },
    });

    const mjmlTemplate = `
      <mjml>
        <mj-head>
          <mj-title>Daily Task Report - ${report.date}</mj-title>
          <mj-attributes>
            <mj-all font-family="Inter, Arial, sans-serif" />
            <mj-text font-size="14px" line-height="1.5" color="#333333" />
          </mj-attributes>
        </mj-head>
        <mj-body background-color="#f5f5f5">
          <mj-section background-color="#1976d2" padding="20px">
            <mj-column>
              <mj-text font-size="24px" color="#ffffff" font-weight="bold" align="center">
                Workboard
              </mj-text>
            </mj-column>
          </mj-section>
          <mj-section background-color="#ffffff" padding="30px">
            <mj-column>
              <mj-text font-size="20px" font-weight="bold">📊 Daily Task Status Report</mj-text>
              <mj-text color="#666666">${report.date}</mj-text>
              <mj-divider border-color="#e0e0e0" />
              
              <mj-text font-size="16px" font-weight="600" padding-top="10px">Task Overview</mj-text>
              <mj-table>
                <tr style="background:#f5f5f5;">
                  <td style="padding:12px;font-weight:bold;">Total Tasks</td>
                  <td style="padding:12px;font-size:18px;font-weight:bold;text-align:right;">${report.totalTasks}</td>
                </tr>
              </mj-table>
              
              <mj-text font-size="16px" font-weight="600" padding-top="20px">Status Breakdown</mj-text>
              <mj-table>
                <tr>
                  <td style="padding:8px 0;color:#666;">📋 To Do:</td>
                  <td style="padding:8px 0;text-align:right;font-weight:500;">${report.todoTasks}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#1976d2;">🔄 In Progress:</td>
                  <td style="padding:8px 0;text-align:right;font-weight:500;color:#1976d2;">${report.inProgressTasks}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#9c27b0;">👀 In Review:</td>
                  <td style="padding:8px 0;text-align:right;font-weight:500;color:#9c27b0;">${report.inReviewTasks}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#2e7d32;">✅ Done:</td>
                  <td style="padding:8px 0;text-align:right;font-weight:500;color:#2e7d32;">${report.doneTasks}</td>
                </tr>
              </mj-table>
              
              <mj-divider border-color="#e0e0e0" />
              
              <mj-text font-size="16px" font-weight="600">Attention Required</mj-text>
              <mj-table>
                <tr style="background:${report.overdueTasks > 0 ? '#ffebee' : '#fff'};">
                  <td style="padding:8px 0;color:#d32f2f;">⚠️ Overdue:</td>
                  <td style="padding:8px 0;text-align:right;font-weight:bold;color:#d32f2f;">${report.overdueTasks}</td>
                </tr>
                <tr style="background:${report.dueTodayTasks > 0 ? '#fff3e0' : '#fff'};">
                  <td style="padding:8px 0;color:#f57c00;">📅 Due Today:</td>
                  <td style="padding:8px 0;text-align:right;font-weight:bold;color:#f57c00;">${report.dueTodayTasks}</td>
                </tr>
              </mj-table>
              
              <mj-divider border-color="#e0e0e0" />
              
              <mj-text font-size="16px" font-weight="600">Priority Tasks (Pending)</mj-text>
              <mj-table>
                <tr>
                  <td style="padding:8px 0;"><span style="background:#d32f2f;color:#fff;padding:2px 8px;border-radius:4px;font-size:12px;">P1</span> Critical:</td>
                  <td style="padding:8px 0;text-align:right;font-weight:bold;">${report.p1Tasks}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;"><span style="background:#f57c00;color:#fff;padding:2px 8px;border-radius:4px;font-size:12px;">P2</span> High:</td>
                  <td style="padding:8px 0;text-align:right;font-weight:bold;">${report.p2Tasks}</td>
                </tr>
              </mj-table>
              
              <mj-divider border-color="#e0e0e0" />
              <mj-button background-color="#1976d2" href="${WORKBOARD_URL}">
                Open Workboard
              </mj-button>
            </mj-column>
          </mj-section>
          <mj-section padding="20px">
            <mj-column>
              <mj-text font-size="12px" color="#999999" align="center">
                Automated daily report from Workboard • Sent every 8 hours
              </mj-text>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `;

    await transporter.sendMail({
      from: `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>`,
      to: email,
      subject: `📊 Daily Task Report - ${report.date}`,
      html: mjml2html(mjmlTemplate).html,
    });

    console.log(`Daily report email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Daily report email error:', error);
    return false;
  }
}
