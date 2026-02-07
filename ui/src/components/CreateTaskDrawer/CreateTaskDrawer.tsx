import { Drawer, Box, Typography, IconButton, Button, CircularProgress } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import TaskAIChatSection from './TaskAIChatSection';
import TaskFormFields from './TaskFormFields';
import { useTaskDrawer, validationSchema } from './useTaskDrawer';
import { CreateTaskDrawerProps } from './types';
import './CreateTaskDrawer.scss';

const CreateTaskDrawer = ({ open, onClose, task }: CreateTaskDrawerProps) => {
  const {
    developers,
    projects,
    loading,
    formikRef,
    initialValues,
    chatInput,
    chatMessages,
    parsing,
    setChatInput,
    rewriting,
    handleSubmit,
    handleParseChat,
    handleApplyParsedTask,
    handleRewriteDescription,
    isEditMode,
    chatContainerRef,
  } = useTaskDrawer({ open, task, onClose });

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => onClose()}
      PaperProps={{ sx: { width: { xs: '100%', sm: isEditMode ? 600 : 1080 } } }}
    >
      <Box className="create-task-drawer" sx={{ display: 'flex', height: '100%' }}>
        {/* AI Chat Panel - Only for new tasks */}
        {!isEditMode && (
          <TaskAIChatSection
            chatMessages={chatMessages}
            chatInput={chatInput}
            parsing={parsing}
            onInputChange={setChatInput}
            onSend={handleParseChat}
            onApplyParsedTask={handleApplyParsedTask}
            chatContainerRef={chatContainerRef}
          />
        )}

        {/* Form Panel */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box
            className="create-task-drawer__header"
            sx={{
              maxHeight: 55,
              minHeight: 55,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
            }}
          >
            <Typography variant="h6">{task ? 'Edit Task' : 'Create Task'}</Typography>
            <IconButton onClick={() => onClose()}>
              <CloseIcon />
            </IconButton>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
              <CircularProgress />
            </Box>
          ) : (
          <Formik
            key={task?.id || 'new'}
            innerRef={formikRef}
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ errors, touched, values, setFieldValue, isSubmitting }) => (
              <Form className="create-task-drawer__form">
                <TaskFormFields
                  values={values}
                  errors={errors as Record<string, string>}
                  touched={touched as Record<string, boolean>}
                  setFieldValue={setFieldValue}
                  developers={developers}
                  projects={projects}
                  rewriting={rewriting}
                  onRewriteDescription={() =>
                    handleRewriteDescription(
                      values.description,
                      values.title,
                      setFieldValue
                    )
                  }
                />

                <Box className="create-task-drawer__actions">
                  <Button onClick={() => onClose()}>Cancel</Button>
                  <Button type="submit" variant="contained" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : task ? 'Update' : 'Create'}
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default CreateTaskDrawer;
