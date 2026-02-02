import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  Typography,
} from '@mui/material';
import {
  Save as SaveIcon,
  Schedule as ScheduleIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { settingsService } from '../../services';
import './SettingsTabs.scss';

interface DailyReportConfig {
  enabled: boolean;
  recipientEmail: string;
}

const initialConfig: DailyReportConfig = {
  enabled: true,
  recipientEmail: 'Suryansh@exyconn.com',
};

const validationSchema = Yup.object({
  recipientEmail: Yup.string()
    .email('Invalid email address')
    .required('Recipient email is required'),
});

const DailyReportTab = () => {
  const [config, setConfig] = useState<DailyReportConfig>(initialConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sendingToAll, setSendingToAll] = useState(false);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getDailyReportSettings();
      setConfig(data);
    } catch {
      // Config might not exist yet
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (values: DailyReportConfig) => {
    try {
      setError(null);
      setSuccess(null);
      await settingsService.updateDailyReportSettings(values);
      setConfig(values);
      setSuccess('Daily report settings saved successfully!');
    } catch {
      setError('Failed to save daily report settings.');
    }
  };

  const handleSendToAllResources = async () => {
    try {
      setSendingToAll(true);
      setError(null);
      setSuccess(null);
      const result = await settingsService.sendStatusToAllResources();
      setSuccess(`Status report sent to ${result.sentCount} resources!`);
    } catch {
      setError('Failed to send status report to resources.');
    } finally {
      setSendingToAll(false);
    }
  };

  if (loading) {
    return (
      <Box className="settings-tab__loading">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="settings-tab">
      <Box className="settings-tab__header">
        <h3>Daily Status Report</h3>
      </Box>

      <Box
        sx={{
          mb: 3,
          p: 2,
          bgcolor: 'info.50',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'info.200',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <ScheduleIcon color="info" fontSize="small" />
          <Typography variant="subtitle2" color="info.main">
            Automatic Status Reports
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          When enabled, a comprehensive task status report will be automatically sent to
          the configured email address every 8 hours. The report includes task counts by
          status, overdue tasks, due today, and priority breakdown.
        </Typography>
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
        {({ errors, touched, values, setFieldValue, isSubmitting }) => (
          <Form>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={values.enabled}
                    onChange={(e) => setFieldValue('enabled', e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">Enable Daily Reports</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {values.enabled
                        ? 'Reports will be sent every 8 hours'
                        : 'Reports are currently disabled'}
                    </Typography>
                  </Box>
                }
              />

              <Field
                as={TextField}
                name="recipientEmail"
                label="Recipient Email"
                fullWidth
                disabled={!values.enabled}
                error={touched.recipientEmail && Boolean(errors.recipientEmail)}
                helperText={
                  (touched.recipientEmail && errors.recipientEmail) ||
                  'Email address to receive daily status reports'
                }
              />

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={isSubmitting}
                >
                  Save Settings
                </Button>
                <Button
                  variant="text"
                  startIcon={sendingToAll ? <CircularProgress size={20} /> : <SendIcon />}
                  disabled={sendingToAll}
                  onClick={handleSendToAllResources}
                >
                  Send Status Mail to All Resources
                </Button>
              </Box>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default DailyReportTab;
