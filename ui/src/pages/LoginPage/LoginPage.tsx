import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Link,
  Divider,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const isLocalDev = window.location.hostname === 'localhost';
const API_BASE_URL = isLocalDev
  ? 'http://localhost:4011/api'
  : 'https://workboard-api.exyconn.com/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoggedIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingAdmin, setSendingAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (isLoggedIn) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password');
      return;
    }
    setLoading(true);
    setError(null);
    const result = await login(email, password);
    setLoading(false);
    if (result) {
      navigate('/dashboard', { replace: true });
    } else {
      setError('Invalid email or password');
    }
  };

  const handleSendAdminPassword = async () => {
    setSendingAdmin(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${API_BASE_URL}/users/send-admin-password`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Admin credentials sent to admin email');
      } else {
        setError(data.error || 'Failed to send admin credentials');
      }
    } catch {
      setError('Failed to send admin credentials');
    } finally {
      setSendingAdmin(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#fafafa',
        p: 2,
      }}
    >
      <Paper sx={{ maxWidth: 400, width: '100%', p: 4, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            component="img"
            src="https://ik.imagekit.io/esdata1/exyconn/logo/exyconn.svg"
            alt="Exyconn"
            sx={{ height: 40, mb: 2 }}
          />
          <Typography variant="h5" fontWeight={600}>
            Workboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to your account
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            size="small"
            autoFocus
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            size="small"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 2, py: 1.2 }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
          </Button>
        </form>

        <Divider sx={{ my: 3 }} />

        <Button
          fullWidth
          variant="outlined"
          size="small"
          onClick={handleSendAdminPassword}
          disabled={sendingAdmin}
        >
          {sendingAdmin ? 'Sending...' : 'Send Admin Credentials to Email'}
        </Button>

        <Box
          sx={{
            mt: 3,
            p: 2,
            bgcolor: '#fff3e0',
            borderRadius: 1,
            border: '1px solid #ffe0b2',
          }}
        >
          <Typography variant="caption" color="text.secondary" display="block">
            <strong>⚠️ Security Notice</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            This is Exyconn&apos;s internal AI Task Management Portal. Unauthorized access
            attempts are logged and monitored.
          </Typography>
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          textAlign="center"
          sx={{ mt: 3 }}
        >
          © {new Date().getFullYear()}{' '}
          <Link href="https://exyconn.com" target="_blank" underline="hover">
            Exyconn
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default LoginPage;
