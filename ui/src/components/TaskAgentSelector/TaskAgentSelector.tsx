import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Autocomplete,
  TextField,
  Chip,
} from '@mui/material';
import { SmartToy as AgentIcon } from '@mui/icons-material';
import { Agent, TaskAgent } from '../../types';
import { agentService } from '../../services';

interface TaskAgentSelectorProps {
  selectedAgents: TaskAgent[];
  onChange: (agents: TaskAgent[]) => void;
}

const TaskAgentSelector = ({ selectedAgents, onChange }: TaskAgentSelectorProps) => {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    agentService
      .getAll()
      .then((data) => setAgents(data.filter((a) => a.status === 'active')))
      .catch(console.error);
  }, []);

  const selectedIds = selectedAgents.map((a) => a.agentId);
  const selectedAgentObjects = agents.filter((a) => selectedIds.includes(a.id));

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        Assign Agents
      </Typography>
      <Autocomplete
        multiple
        options={agents}
        value={selectedAgentObjects}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        onChange={(_, newValue) => {
          onChange(
            newValue.map((a) => ({ agentId: a.id, agentName: a.name }))
          );
        }}
        renderInput={(params) => (
          <TextField {...params} placeholder="Select agents..." size="small" />
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => {
            const { key, ...tagProps } = getTagProps({ index });
            return (
              <Chip
                key={key}
                icon={<AgentIcon />}
                label={option.name}
                size="small"
                color="primary"
                variant="outlined"
                {...tagProps}
              />
            );
          })
        }
        renderOption={(props, option) => {
          const { key, ...restProps } = props;
          return (
            <li key={key} {...restProps}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AgentIcon fontSize="small" color="primary" />
                <Box>
                  <Typography variant="body2">{option.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.role}
                  </Typography>
                </Box>
              </Box>
            </li>
          );
        }}
      />
    </Box>
  );
};

export default TaskAgentSelector;
