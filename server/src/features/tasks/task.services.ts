import { Task, ITask, IComment } from './task.models';
import { CreateTaskInput, UpdateTaskInput, CommentInput } from './task.validators';
import { Counter, OpenAIConfig } from '../settings/settings.models';
import { TaskHistory } from './task-history.models';
import { sendTaskNotification } from '../email/email.services';

export async function getNextTaskId(): Promise<string> {
  const counter = await Counter.findOneAndUpdate(
    { name: 'taskId' },
    { $inc: { value: 1 } },
    { upsert: true, new: true }
  );
  return `WB-${counter.value.toString().padStart(4, '0')}`;
}

export async function getAllTasks(): Promise<ITask[]> {
  return Task.find().sort({ createdAt: -1 });
}

export async function getTaskById(id: string): Promise<ITask | null> {
  return Task.findById(id);
}

export async function getTaskHistory(taskId: string) {
  return TaskHistory.find({ taskId }).sort({ performedAt: -1 });
}

export async function createTask(data: CreateTaskInput): Promise<ITask> {
  const taskId = await getNextTaskId();
  const task = new Task({ ...data, taskId });
  await task.save();

  // Log history
  const emailSent = await sendTaskNotification(task, 'created');
  await TaskHistory.create({
    taskId: task._id.toString(),
    action: 'created',
    changes: { initial: { from: null, to: data } },
    performedBy: 'System',
    emailSent,
    emailTo: task.assignee,
  });

  return task;
}

export async function updateTask(
  id: string,
  data: UpdateTaskInput
): Promise<ITask | null> {
  const oldTask = await Task.findById(id);
  if (!oldTask) return null;

  const updatedTask = await Task.findByIdAndUpdate(id, data, { new: true });
  if (!updatedTask) return null;

  // Calculate changes
  const changes: Record<string, { from: unknown; to: unknown }> = {};
  const fieldsToTrack = [
    'title',
    'description',
    'assignee',
    'status',
    'priority',
    'dueDate',
    'labels',
  ];
  const oldTaskObj = oldTask.toObject();
  for (const field of fieldsToTrack) {
    const oldVal = (oldTaskObj as unknown as Record<string, unknown>)[field];
    const newVal = (data as Record<string, unknown>)[field];
    if (newVal !== undefined && JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes[field] = { from: oldVal, to: newVal };
    }
  }

  // Log history and send email
  const emailSent = await sendTaskNotification(updatedTask, 'updated');
  await TaskHistory.create({
    taskId: id,
    action: Object.keys(changes).includes('status') ? 'status_changed' : 'updated',
    changes,
    performedBy: 'System',
    emailSent,
    emailTo: updatedTask.assignee,
  });

  return updatedTask;
}

export async function deleteTask(id: string): Promise<boolean> {
  const result = await Task.findByIdAndDelete(id);
  if (result) {
    await TaskHistory.create({
      taskId: id,
      action: 'deleted',
      changes: {},
      performedBy: 'System',
      emailSent: false,
    });
  }
  return result !== null;
}

interface AISearchResult {
  tasks: ITask[];
  explanation: string;
  matchedIds: string[];
}

export async function aiSearchTasks(query: string): Promise<AISearchResult> {
  const openaiConfig = await OpenAIConfig.findOne();
  if (!openaiConfig?.apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const allTasks = await getAllTasks();

  // Build task summary for context
  const taskSummary = allTasks
    .map(
      (t) =>
        `[ID:${t._id}][${t.taskId}] ${t.title} | Status: ${t.status} | Priority: ${t.priority} | Labels: ${t.labels?.join(', ') || 'none'} | Assignee: ${t.assignee || 'unassigned'} | Due: ${t.dueDate || 'not set'} | Desc: ${t.description?.substring(0, 100) || 'none'}`
    )
    .join('\n');

  const messages = [
    {
      role: 'system',
      content: `You are a task search assistant. Based on the user's natural language query, find matching tasks from the list below.

Available Tasks:
${taskSummary}

Return a JSON object with:
- matchedIds: string[] (array of MongoDB IDs that match the query - use the ID from [ID:xxx] part)
- explanation: string (brief explanation of why these tasks match)

Consider semantic meaning, not just keyword matching. If the query is about urgency, consider priority and due dates. If about a topic, consider title, description and labels.`,
    },
    {
      role: 'user',
      content: query,
    },
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openaiConfig.apiKey}`,
    },
    body: JSON.stringify({
      model: openaiConfig.openAIModel || 'gpt-4o-mini',
      max_tokens: openaiConfig.maxTokens || 1000,
      messages,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorData = (await response.json()) as { error?: { message?: string } };
    throw new Error(errorData.error?.message || 'OpenAI API error');
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  const result = JSON.parse(data.choices[0].message.content);

  // Filter tasks by matched IDs
  const matchedTasks = allTasks.filter((t) =>
    result.matchedIds.includes(t._id.toString())
  );

  return {
    tasks: matchedTasks,
    explanation: result.explanation,
    matchedIds: result.matchedIds,
  };
}

// Comment service functions
export async function getComments(taskId: string): Promise<IComment[] | null> {
  const task = await Task.findById(taskId);
  if (!task) return null;
  return task.comments || [];
}

export async function addComment(
  taskId: string,
  data: CommentInput
): Promise<IComment | null> {
  const task = await Task.findById(taskId);
  if (!task) return null;

  const comment = {
    text: data.text,
    author: data.author,
    authorEmail: data.authorEmail,
  };

  task.comments.push(comment as IComment);
  await task.save();

  // Return the newly added comment
  return task.comments[task.comments.length - 1];
}

export async function updateComment(
  taskId: string,
  commentId: string,
  data: CommentInput
): Promise<IComment | null> {
  const task = await Task.findById(taskId);
  if (!task) return null;

  const comment = task.comments.find((c) => c._id.toString() === commentId);
  if (!comment) return null;

  comment.text = data.text;
  await task.save();

  return comment;
}

export async function deleteComment(taskId: string, commentId: string): Promise<boolean> {
  const task = await Task.findById(taskId);
  if (!task) return false;

  const commentIndex = task.comments.findIndex((c) => c._id.toString() === commentId);
  if (commentIndex === -1) return false;

  task.comments.splice(commentIndex, 1);
  await task.save();

  return true;
}
