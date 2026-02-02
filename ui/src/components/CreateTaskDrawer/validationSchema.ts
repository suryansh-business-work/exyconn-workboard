import * as Yup from 'yup';

export const validationSchema = Yup.object({
  title: Yup.string().required('Title is required').max(200, 'Max 200 characters'),
  description: Yup.string().max(5000),
  assignee: Yup.string().required('Assignee is required'),
  projectId: Yup.string(),
  status: Yup.string().oneOf(['todo', 'in-progress', 'in-review', 'done']).required(),
  priority: Yup.string().oneOf(['P1', 'P2', 'P3', 'P4']).required(),
  taskType: Yup.string()
    .oneOf(['task', 'bug', 'incident', 'feature', 'improvement', 'other'])
    .required(),
  dueDate: Yup.date().required('Due date is required'),
  labels: Yup.array().of(Yup.string()),
  images: Yup.array().of(Yup.string().url()),
  links: Yup.array().of(
    Yup.object({
      title: Yup.string().required('Title is required'),
      url: Yup.string().url('Invalid URL').required('URL is required'),
    })
  ),
});

export default validationSchema;
