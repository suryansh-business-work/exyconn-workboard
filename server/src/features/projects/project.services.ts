import { Project, IProject } from './project.models';
import { CreateProjectInput, UpdateProjectInput } from './project.validators';

export async function getAllProjects(): Promise<IProject[]> {
  return Project.find().sort({ createdAt: -1 });
}

export async function getProjectById(id: string): Promise<IProject | null> {
  return Project.findById(id);
}

export async function createProject(data: CreateProjectInput): Promise<IProject> {
  const project = new Project(data);
  return project.save();
}

export async function updateProject(
  id: string,
  data: UpdateProjectInput
): Promise<IProject | null> {
  return Project.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteProject(id: string): Promise<IProject | null> {
  return Project.findByIdAndDelete(id);
}
