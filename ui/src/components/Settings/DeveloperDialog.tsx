import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

interface DeveloperDialogProps {
  open: boolean;
  isEdit: boolean;
  initialValues: { name: string; email: string };
  onClose: () => void;
  onSave: (values: { name: string; email: string }) => Promise<void>;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required').max(100, 'Max 100 characters'),
  email: Yup.string().required('Email is required').email('Invalid email format'),
});

const DeveloperDialog = ({
  open,
  isEdit,
  initialValues,
  onClose,
  onSave,
}: DeveloperDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          await onSave(values);
          setSubmitting(false);
        }}
        enableReinitialize
      >
        {({ errors, touched, isSubmitting }) => (
          <Form>
            <DialogTitle>{isEdit ? 'Edit Developer' : 'Add Developer'}</DialogTitle>
            <DialogContent>
              <Box
                className="settings-tab__form"
                sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}
              >
                <Field
                  as={TextField}
                  name="name"
                  label="Name"
                  fullWidth
                  error={touched.name && !!errors.name}
                  helperText={touched.name && errors.name}
                />
                <Field
                  as={TextField}
                  name="email"
                  label="Email"
                  type="email"
                  fullWidth
                  error={touched.email && !!errors.email}
                  helperText={touched.email && errors.email}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default DeveloperDialog;
