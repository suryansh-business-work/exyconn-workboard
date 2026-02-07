import { Agent, IAgent } from './agent.models';
import { CreateAgentInput, UpdateAgentInput } from './agent.validators';

export async function getAllAgents(): Promise<IAgent[]> {
  return Agent.find().sort({ createdAt: -1 });
}

export async function getAgentById(id: string): Promise<IAgent | null> {
  return Agent.findById(id);
}

export async function createAgent(data: CreateAgentInput): Promise<IAgent> {
  const agent = new Agent(data);
  await agent.save();
  return agent;
}

export async function updateAgent(
  id: string,
  data: UpdateAgentInput
): Promise<IAgent | null> {
  return Agent.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteAgent(id: string): Promise<boolean> {
  const result = await Agent.findByIdAndDelete(id);
  return result !== null;
}
