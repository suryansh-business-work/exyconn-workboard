import { Task } from '../../types';

const formatStatus = (status: string) =>
  status.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase());

export const downloadAsPDF = (task: Task) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `<!DOCTYPE html>
<html><head>
  <title>${task.taskId} - ${task.title}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { border-bottom: 2px solid #1976d2; padding-bottom: 20px; margin-bottom: 20px; }
    .task-id { color: #666; font-size: 14px; }
    .title { font-size: 24px; margin: 10px 0; }
    .badges { display: flex; gap: 10px; margin-top: 10px; }
    .badge { padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: bold; }
    .status { background: #e3f2fd; color: #1976d2; }
    .priority-high { background: #ffebee; color: #d32f2f; }
    .priority-medium { background: #fff3e0; color: #f57c00; }
    .priority-low { background: #e8f5e9; color: #388e3c; }
    .section { margin: 20px 0; }
    .section-title { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 10px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .info-label { font-size: 12px; color: #666; }
    .info-value { font-size: 14px; color: #333; }
    .description { background: #f5f5f5; padding: 15px; border-radius: 8px; white-space: pre-wrap; }
    .labels { display: flex; gap: 8px; flex-wrap: wrap; }
    .label { background: #e0e0e0; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; }
    @media print { body { padding: 20px; } }
  </style>
</head><body>
  <div class="header">
    <div class="task-id">${task.taskId}</div>
    <div class="title">${task.title}</div>
    <div class="badges">
      <span class="badge status">${formatStatus(task.status)}</span>
      <span class="badge priority-${task.priority}">${task.priority.toUpperCase()}</span>
    </div>
  </div>
  <div class="section">
    <div class="section-title">Details</div>
    <div class="info-grid">
      <div><div class="info-label">Assignee</div><div class="info-value">${task.assignee}</div></div>
      <div><div class="info-label">Due Date</div><div class="info-value">${new Date(task.dueDate).toLocaleDateString()}</div></div>
      <div><div class="info-label">Project</div><div class="info-value">${task.projectName || 'None'}</div></div>
      <div><div class="info-label">Created</div><div class="info-value">${new Date(task.createdAt).toLocaleDateString()}</div></div>
    </div>
  </div>
  ${task.labels.length > 0 ? `<div class="section"><div class="section-title">Labels</div><div class="labels">${task.labels.map((l) => `<span class="label">${l}</span>`).join('')}</div></div>` : ''}
  <div class="section">
    <div class="section-title">Description</div>
    <div class="description">${task.description || 'No description provided.'}</div>
  </div>
  <div class="footer">Generated from Workboard on ${new Date().toLocaleString()}</div>
</body></html>`;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.print();
  };
};
