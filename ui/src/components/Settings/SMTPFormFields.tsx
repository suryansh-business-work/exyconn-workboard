import { TextField, Grid, FormControlLabel, Switch } from '@mui/material';
import { SMTPConfig } from '../../types';

interface SMTPFormFieldsProps {
  config: SMTPConfig;
  onChange: (config: SMTPConfig) => void;
}

const SMTPFormFields = ({ config, onChange }: SMTPFormFieldsProps) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <TextField
          label="SMTP Host"
          fullWidth
          value={config.host}
          onChange={(e) => onChange({ ...config, host: e.target.value })}
          placeholder="smtp.gmail.com"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          label="SMTP Port"
          type="number"
          fullWidth
          value={config.port}
          onChange={(e) => onChange({ ...config, port: parseInt(e.target.value) })}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={config.secure}
              onChange={(e) => onChange({ ...config, secure: e.target.checked })}
            />
          }
          label="Use SSL/TLS"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          label="Username"
          fullWidth
          value={config.user}
          onChange={(e) => onChange({ ...config, user: e.target.value })}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          label="Password"
          type="password"
          fullWidth
          value={config.password}
          onChange={(e) => onChange({ ...config, password: e.target.value })}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          label="From Email"
          type="email"
          fullWidth
          value={config.fromEmail}
          onChange={(e) => onChange({ ...config, fromEmail: e.target.value })}
          placeholder="noreply@example.com"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          label="From Name"
          fullWidth
          value={config.fromName}
          onChange={(e) => onChange({ ...config, fromName: e.target.value })}
          placeholder="Workboard"
        />
      </Grid>
    </Grid>
  );
};

export default SMTPFormFields;
