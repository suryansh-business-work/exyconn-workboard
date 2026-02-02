import { Request, Response } from 'express';
import * as userService from './user.services';
import * as settingsService from '../settings/settings.services';
import { sendPasswordEmail } from '../email/email.services';
import { generateToken, JwtPayload } from '../../middleware/auth';

// Default SMTP config values
const DEFAULT_SMTP_CONFIG = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  user: 'suryansh@exyconn.com',
  password: 'ylip muer ugqn xvym',
  fromEmail: 'suryansh@exyconn.com',
  fromName: 'Workboard',
};

export async function getAllUsers(_req: Request, res: Response): Promise<void> {
  const users = await userService.getAllUsers();
  res.json(users);
}

export async function getUser(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const user = await userService.getUserById(id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(user);
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  const user = await userService.validateLogin(email, password);
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const payload: JwtPayload = {
    id: String(user._id),
    email: user.email,
    name: user.name,
    role: user.role,
  };

  const token = generateToken(payload);

  res.json({
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    developerId: user.developerId,
    token,
  });
}

export async function resendPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body;
  const user = await userService.getUserByEmail(email);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  const result = await userService.resetUserPassword(String(user._id));
  if (!result) {
    res.status(500).json({ error: 'Failed to reset password' });
    return;
  }
  const emailSent = await sendPasswordEmail(
    result.user.email,
    result.user.name,
    result.password
  );
  res.json({
    success: true,
    emailSent,
    message: emailSent
      ? 'Password reset and email sent'
      : 'Password reset but email failed',
  });
}

export async function sendAdminPassword(_req: Request, res: Response): Promise<void> {
  // Ensure SMTP config exists with defaults
  const smtpConfig = await settingsService.getSMTPConfig();
  if (!smtpConfig.user) {
    await settingsService.updateSMTPConfig(DEFAULT_SMTP_CONFIG);
  }

  // Ensure admin user exists
  let admin = await userService.getAdminUser();
  let password: string;

  if (!admin) {
    const adminResult = await userService.ensureAdminUser();
    admin = await userService.getAdminUser();
    if (!admin) {
      res.status(500).json({ error: 'Failed to create admin user' });
      return;
    }
    password = adminResult.password!;
  } else {
    const result = await userService.resetUserPassword(String(admin._id));
    if (!result) {
      res.status(500).json({ error: 'Failed to reset admin password' });
      return;
    }
    password = result.password;
  }

  const emailSent = await sendPasswordEmail(admin.email, admin.name, password);
  res.json({
    success: true,
    emailSent,
    message: emailSent
      ? 'Admin credentials sent to admin email'
      : 'Password reset but email failed - check SMTP settings',
  });
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  try {
    const user = await userService.deleteUser(id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete user';
    res.status(400).json({ error: message });
  }
}
