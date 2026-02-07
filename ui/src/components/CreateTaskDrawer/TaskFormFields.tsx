import { Box, Typography, TextField, Button, CircularProgress } from '@mui/material';
import { SmartToy as AIIcon } from '@mui/icons-material';
import { Field, FieldArray } from 'formik';
import QuillEditor from '../QuillEditor';
import FileUploader from '../FileUploader';
import LinksSection from '../LinksSection';
import TaskLabelsField from './TaskLabelsField';
import TaskBasicFields from './TaskBasicFields';
import TaskStatusSelects from './TaskStatusSelects';
import TaskAgentSelector from '../TaskAgentSelector/TaskAgentSelector';
import { TaskFormFieldsProps } from './types';

const TaskFormFields = ({
  values,
  errors,
  touched,
  setFieldValue,
  developers,
  agents,
  projects,
  rewriting,
  onRewriteDescription,
}: TaskFormFieldsProps) => {
  // Convert images to file format for FileUploader
  const fileUploaderFiles = values.images.map((url, idx) => ({
    url,
    name: `Image ${idx + 1}`,
    type: 'image' as const,
  }));

  return (
    <>
      {/* Title */}
      <Field
        as={TextField}
        name="title"
        label="Title *"
        fullWidth
        error={touched.title && !!errors.title}
        helperText={touched.title && errors.title}
      />

      {/* Description */}
      <Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 0.5,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Description
          </Typography>
          <Button
            size="small"
            startIcon={rewriting ? <CircularProgress size={14} /> : <AIIcon />}
            onClick={onRewriteDescription}
            disabled={!values.description.trim() || rewriting}
            sx={{ textTransform: 'none', fontSize: '0.75rem' }}
          >
            {rewriting ? 'Rewriting...' : 'Rewrite with AI'}
          </Button>
        </Box>
        <QuillEditor
          value={values.description}
          onChange={(val) => setFieldValue('description', val)}
          placeholder="Enter task description..."
          minHeight={120}
        />
      </Box>

      {/* Assignee, Project, Due Date */}
      <TaskBasicFields
        values={values}
        errors={errors}
        touched={touched}
        setFieldValue={setFieldValue}
        developers={developers}
        agents={agents}
        projects={projects}
      />

      {/* Status, Priority, Type */}
      <TaskStatusSelects
        status={values.status}
        priority={values.priority}
        taskType={values.taskType}
        setFieldValue={setFieldValue}
      />

      {/* Labels */}
      <FieldArray name="labels">
        {({ push, remove }) => (
          <TaskLabelsField labels={values.labels} onAdd={push} onRemove={remove} />
        )}
      </FieldArray>

      {/* File Uploader */}
      <FileUploader
        files={fileUploaderFiles}
        onChange={(files) =>
          setFieldValue(
            'images',
            files.map((f) => f.url)
          )
        }
        accept="image/*"
        label="Upload Images"
      />

      {/* Links Section */}
      <LinksSection
        links={values.links}
        onChange={(links) => setFieldValue('links', links)}
        htmlContent={values.description}
      />

      {/* Agents */}
      <TaskAgentSelector
        selectedAgents={values.agents || []}
        onChange={(agents) => setFieldValue('agents', agents)}
      />
    </>
  );
};

export default TaskFormFields;
