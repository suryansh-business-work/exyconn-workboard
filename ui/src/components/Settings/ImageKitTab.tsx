import { useState, useEffect } from 'react';
import { Box, Button, TextField, Alert, CircularProgress, Grid } from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { ImageKitConfig } from '../../types';
import { settingsService } from '../../services';
import './SettingsTabs.scss';

const initialConfig: ImageKitConfig = {
  publicKey: '',
  privateKey: '',
  urlEndpoint: '',
};

const validationSchema = Yup.object({
  publicKey: Yup.string().required('Public key is required'),
  privateKey: Yup.string().required('Private key is required'),
  urlEndpoint: Yup.string()
    .required('URL endpoint is required')
    .url('Invalid URL format'),
});

const ImageKitTab = () => {
  const [config, setConfig] = useState<ImageKitConfig>(initialConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getImageKitConfig();
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

  const handleSave = async (values: ImageKitConfig) => {
    try {
      setError(null);
      setSuccess(null);
      await settingsService.updateImageKitConfig(values);
      setConfig(values);
      setSuccess('ImageKit configuration saved successfully!');
    } catch {
      setError('Failed to save ImageKit configuration.');
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
        <h3>ImageKit Configuration</h3>
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
        {({ errors, touched, isSubmitting }) => (
          <Form>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Field
                  as={TextField}
                  name="publicKey"
                  label="Public Key"
                  fullWidth
                  placeholder="public_xxxxxxxxxxxx"
                  error={touched.publicKey && !!errors.publicKey}
                  helperText={touched.publicKey && errors.publicKey}
                />
              </Grid>
              <Grid item xs={12}>
                <Field
                  as={TextField}
                  name="privateKey"
                  label="Private Key"
                  type="password"
                  fullWidth
                  placeholder="private_xxxxxxxxxxxx"
                  error={touched.privateKey && !!errors.privateKey}
                  helperText={touched.privateKey && errors.privateKey}
                />
              </Grid>
              <Grid item xs={12}>
                <Field
                  as={TextField}
                  name="urlEndpoint"
                  label="URL Endpoint"
                  fullWidth
                  placeholder="https://ik.imagekit.io/your_imagekit_id"
                  error={touched.urlEndpoint && !!errors.urlEndpoint}
                  helperText={touched.urlEndpoint && errors.urlEndpoint}
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
          To get your ImageKit credentials:
          <ol style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
            <li>
              Go to{' '}
              <a href="https://imagekit.io" target="_blank" rel="noopener noreferrer">
                imagekit.io
              </a>
            </li>
            <li>Sign up or log in to your account</li>
            <li>Navigate to Developer Options in your dashboard</li>
            <li>Copy your Public Key, Private Key, and URL Endpoint</li>
          </ol>
        </Alert>
      </Box>
    </Box>
  );
};

export default ImageKitTab;
