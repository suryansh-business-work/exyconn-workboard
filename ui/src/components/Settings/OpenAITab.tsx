import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { OpenAIConfig } from '../../types';
import { settingsService } from '../../services';
import './SettingsTabs.scss';

const initialConfig: OpenAIConfig = {
  apiKey: '',
  openAIModel: 'gpt-4o-mini',
  maxTokens: 1000,
};

const modelOptions = [
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Recommended)' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
];

const validationSchema = Yup.object({
  apiKey: Yup.string().required('API key is required'),
  openAIModel: Yup.string().required('Model is required'),
  maxTokens: Yup.number()
    .required('Max tokens is required')
    .min(100, 'Minimum 100 tokens')
    .max(4000, 'Maximum 4000 tokens'),
});

const OpenAITab = () => {
  const [config, setConfig] = useState<OpenAIConfig>(initialConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getOpenAIConfig();
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

  const handleSave = async (values: OpenAIConfig) => {
    try {
      setError(null);
      setSuccess(null);
      await settingsService.updateOpenAIConfig(values);
      setConfig(values);
      setSuccess('OpenAI configuration saved successfully!');
    } catch {
      setError('Failed to save OpenAI configuration.');
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
        <h3>OpenAI Configuration</h3>
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
              <Grid item xs={12}>
                <Field
                  as={TextField}
                  name="apiKey"
                  label="API Key"
                  type="password"
                  fullWidth
                  placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                  error={touched.apiKey && !!errors.apiKey}
                  helperText={touched.apiKey && errors.apiKey}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Model</InputLabel>
                  <Select
                    value={values.openAIModel}
                    label="Model"
                    onChange={(e) => setFieldValue('openAIModel', e.target.value)}
                  >
                    {modelOptions.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  name="maxTokens"
                  label="Max Tokens"
                  type="number"
                  fullWidth
                  error={touched.maxTokens && !!errors.maxTokens}
                  helperText={touched.maxTokens && errors.maxTokens}
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
        <Alert severity="info">
          This API key is used for the AI Chat feature in Task Creation. To get your
          OpenAI API key:
          <ol style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
            <li>
              Go to{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
              >
                platform.openai.com/api-keys
              </a>
            </li>
            <li>Sign in to your OpenAI account</li>
            <li>Create a new API key</li>
            <li>Copy and paste the key here</li>
          </ol>
        </Alert>
      </Box>
    </Box>
  );
};

export default OpenAITab;
