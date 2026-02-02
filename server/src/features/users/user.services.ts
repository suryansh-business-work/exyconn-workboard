import crypto from 'crypto';
import { User, IUser } from './user.models';
import { CreateUserInput } from './user.validators';

const ADMIN_EMAIL = 'services@exyconn.com';

export async function getAllUsers(): Promise<IUser[]> {
  return User.find().select('-password').sort({ createdAt: -1 });
}

export async function getUserById(id: string): Promise<IUser | null> {
  return User.findById(id).select('-password');
}

export async function getUserByEmail(email: string): Promise<IUser | null> {
  return User.findOne({ email: email.toLowerCase() });
}

export async function getAdminUser(): Promise<IUser | null> {
  return User.findOne({ email: ADMIN_EMAIL });
}

export async function createUser(data: CreateUserInput): Promise<IUser> {
  const user = new User(data);
  return user.save();
}

export async function createUserWithRandomPassword(
  email: string,
  name: string,
  developerId: string
): Promise<{ user: IUser; password: string }> {
  const password = generateRandomPassword();
  const user = new User({
    email: email.toLowerCase(),
    password,
    name,
    role: 'resource',
    developerId,
  });
  await user.save();
  return { user, password };
}

export async function updateUserPassword(
  userId: string,
  newPassword: string
): Promise<IUser | null> {
  const user = await User.findById(userId);
  if (!user) return null;
  user.password = newPassword;
  return user.save();
}

export async function resetUserPassword(
  userId: string
): Promise<{ user: IUser; password: string } | null> {
  const user = await User.findById(userId);
  if (!user) return null;
  const password = generateRandomPassword();
  user.password = password;
  await user.save();
  return { user, password };
}

export async function deleteUser(id: string): Promise<IUser | null> {
  const user = await User.findById(id);
  if (!user) return null;
  // Prevent deletion of admin user
  if (user.email === ADMIN_EMAIL) {
    throw new Error('Cannot delete admin user');
  }
  return User.findByIdAndDelete(id);
}

export async function validateLogin(
  email: string,
  password: string
): Promise<IUser | null> {
  const user = await User.findOne({ email: email.toLowerCase(), isActive: true });
  if (!user) return null;
  const isMatch = await user.comparePassword(password);
  if (!isMatch) return null;
  user.lastLogin = new Date();
  await user.save();
  return user;
}

export async function ensureAdminUser(): Promise<{
  created: boolean;
  password?: string;
}> {
  const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
  if (existingAdmin) {
    return { created: false };
  }

  const password = generateRandomPassword();
  const admin = new User({
    email: ADMIN_EMAIL,
    password,
    name: 'Admin',
    role: 'admin',
    isActive: true,
  });
  await admin.save();
  console.log(`✅ Admin user created: ${ADMIN_EMAIL}`);
  return { created: true, password };
}

export function generateRandomPassword(length: number = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$%';
  let password = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += chars[randomBytes[i] % chars.length];
  }
  return password;
}
