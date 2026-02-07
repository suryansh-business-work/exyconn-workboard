import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Grid,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Save as SaveIcon, Send as SendIcon } from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { SMTPConfig } from '../../types';
import { settingsService } from '../../services';
import './SettingsTabs.scss';

const initialConfig: SMTPConfig = {
  host: '',
  port: 587,
  secure: false,
  user: '',
  password: '',
  fromEmail: '',
  fromName: '',
};

const validationSchema = Yup.object({
  host: Yup.string().required('SMTP host is required'),
  port: Yup.number().required('Port is required').min(1).max(65535),
  secure: Yup.boolean(),
  user: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
  fromEmail: Yup.string().required('From email is required').email('Invalid email'),
  fromName: Yup.string().required('From name is required'),
});

const SMTPTab = () => {
  const [config, setConfig] = useState<SMTPConfig>(initialConfig);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    setLoading(true);
    settingsService
      .getSMTPConfig()
      .then(setConfig)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (values: SMTPConfig) => {
    setError(null);
    setSuccess(null);
    try {
      await settingsService.updateSMTPConfig(values);
      setConfig(values);
      setSuccess('SMTP configuration saved successfully!');
    } catch {
      setError('Failed to save SMTP configuration.');
    }
  };

  const handleTest = async () => {
    if (!testEmail) {
      setError('Please enter an email address for testing.');
      return;
    }
    setTesting(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await settingsService.testSMTPConfig(testEmail);
      if (result.success) {
        setSuccess('Test email sent successfully!');
      } else {
        setError(result.message);
      }
    } catch {
      setError('Failed to send test email.');
    } finally {
      setTesting(false);
    }
  };

  if (loading)
    return (
      <Box className="settings-tab__loading">
        <CircularProgress />
      </Box>
    );

  return (
    <Box className="settings-tab">
      <Box className="settings-tab__header">
        <h3>SMTP Configuration</h3>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Formik
        initialValues={config}
        validationSchema={validationSchema}
        onSubmit={handleSave}
        enableReinitialize
      >
        {({ errors, touched, isSubmitting, values, setFieldValue }) => (
          <Form>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  name="host"
                  label="SMTP Host"
                  fullWidth
                  placeholder="smtp.gmail.com"
                  error={touched.host && !!errors.host}
                  helperText={touched.host && errors.host}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  name="port"
                  label="SMTP Port"
                  type="number"
                  fullWidth
                  error={touched.port && !!errors.port}
                  helperText={touched.port && errors.port}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={values.secure}
                      onChange={(e) => setFieldValue('secure', e.target.checked)}
                    />
                  }
                  label="Use SSL/TLS"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  name="user"
                  label="Username"
                  fullWidth
                  error={touched.user && !!errors.user}
                  helperText={touched.user && errors.user}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  name="password"
                  label="Password"
                  type="password"
                  fullWidth
                  error={touched.password && !!errors.password}
                  helperText={touched.password && errors.password}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  name="fromEmail"
                  label="From Email"
                  type="email"
                  fullWidth
                  placeholder="noreply@example.com"
                  error={touched.fromEmail && !!errors.fromEmail}
                  helperText={touched.fromEmail && errors.fromEmail}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  name="fromName"
                  label="From Name"
                  fullWidth
                  placeholder="Workboard"
                  error={touched.fromName && !!errors.fromName}
                  helperText={touched.fromName && errors.fromName}
                />
              </Grid>
            </Grid>

            <Box className="settings-tab__actions" sx={{ mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Configuration'}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>

      <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e0e0e0' }}>
        <h4>Test SMTP Configuration</h4>
        <Box sx={{ display: 'flex', gap: 2, mt: 2, alignItems: 'center' }}>
          <TextField
            label="Test Email Address"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="test@example.com"
            size="small"
            sx={{ width: 300 }}
          />
          <Button
            variant="outlined"
            startIcon={<SendIcon />}
            onClick={handleTest}
            disabled={testing}
          >
            {testing ? 'Sending...' : 'Send Test Email'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default SMTPTab;
