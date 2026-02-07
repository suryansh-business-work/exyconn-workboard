import { AgentComponent, IAgentComponent } from './agent-component.models';
import {
  CreateAgentComponentInput,
  UpdateAgentComponentInput,
} from './agent-component.validators';

export async function getAllComponents(): Promise<IAgentComponent[]> {
  return AgentComponent.find().sort({ category: 1, name: 1 });
}

export async function getComponentById(id: string): Promise<IAgentComponent | null> {
  return AgentComponent.findById(id);
}

export async function createComponent(
  data: CreateAgentComponentInput
): Promise<IAgentComponent> {
  const component = new AgentComponent(data);
  await component.save();
  return component;
}

export async function updateComponent(
  id: string,
  data: UpdateAgentComponentInput
): Promise<IAgentComponent | null> {
  return AgentComponent.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteComponent(id: string): Promise<boolean> {
  const result = await AgentComponent.findByIdAndDelete(id);
  return result !== null;
}
