import { Developer, IDeveloper } from './developer.models';
import { CreateDeveloperInput, UpdateDeveloperInput } from './developer.validators';
import * as userService from '../users/user.services';
import { sendPasswordEmail } from '../email/email.services';

export async function getAllDevelopers(): Promise<IDeveloper[]> {
  return Developer.find().sort({ name: 1 });
}

export async function getDeveloperById(id: string): Promise<IDeveloper | null> {
  return Developer.findById(id);
}

export async function getDeveloperByName(name: string): Promise<IDeveloper | null> {
  return Developer.findOne({ name });
}

export async function createDeveloper(
  data: CreateDeveloperInput
): Promise<{ developer: IDeveloper; emailSent: boolean }> {
  const developer = new Developer(data);
  await developer.save();

  // Create user account for this developer
  let emailSent = false;
  try {
    const existingUser = await userService.getUserByEmail(data.email);
    if (!existingUser) {
      const { password } = await userService.createUserWithRandomPassword(
        data.email,
        data.name,
        developer._id.toString()
      );
      emailSent = await sendPasswordEmail(data.email, data.name, password);
    }
  } catch (error) {
    console.error('Failed to create user for developer:', error);
  }

  return { developer, emailSent };
}

export async function updateDeveloper(
  id: string,
  data: UpdateDeveloperInput
): Promise<IDeveloper | null> {
  return Developer.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteDeveloper(id: string): Promise<boolean> {
  const result = await Developer.findByIdAndDelete(id);
  return result !== null;
}
