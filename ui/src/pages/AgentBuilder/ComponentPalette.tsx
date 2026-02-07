import { useState, useMemo } from 'react';
import { Box, Typography, Paper, Chip, Divider, TextField, InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { AgentComponent, AgentComponentCategory } from '../../types';

interface Props {
  components: AgentComponent[];
  onDragStart: (component: AgentComponent) => void;
}

const CATEGORY_ORDER: AgentComponentCategory[] = [
  'event',
  'data-scrapper',
  'communication',
  'ai',
  'action',
  'logic',
  'custom',
];

const CATEGORY_LABELS: Record<AgentComponentCategory, string> = {
  event: 'Events',
  'data-scrapper': 'Data Scrapper',
  communication: 'Communications',
  ai: 'AI',
  action: 'Actions',
  logic: 'Logic',
  custom: 'Custom',
};

const ComponentPalette = ({ components, onDragStart }: Props) => {
  const [search, setSearch] = useState('');

  const filteredComponents = useMemo(
    () =>
      search.trim()
        ? components.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
        : components,
    [components, search]
  );

  const grouped = CATEGORY_ORDER.reduce<Record<string, AgentComponent[]>>((acc, cat) => {
    const items = filteredComponents.filter((c) => c.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  return (
    <Paper
      variant="outlined"
      sx={{
        width: 200,
        minWidth: 200,
        height: '100%',
        overflow: 'auto',
        p: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography variant="caption" sx={{ mb: 0.5, fontWeight: 700, fontSize: 12 }}>
        Components
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, fontSize: 10 }}>
        Drag onto canvas
      </Typography>
      <TextField
        size="small"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 14 }} /></InputAdornment> } }}
        sx={{ mb: 1, '& .MuiInputBase-root': { fontSize: 11, height: 28 } }}
        fullWidth
      />
      {Object.entries(grouped).map(([category, items]) => (
        <Box key={category} sx={{ mb: 1 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              textTransform: 'uppercase',
              color: 'text.secondary',
              fontSize: 9,
            }}
          >
            {CATEGORY_LABELS[category as AgentComponentCategory] || category}
          </Typography>
          <Divider sx={{ my: 0.5 }} />
          {items.map((comp) => (
            <Box
              key={comp.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData(
                  'application/agentComponent',
                  JSON.stringify(comp)
                );
                e.dataTransfer.effectAllowed = 'move';
                onDragStart(comp);
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 0.75,
                py: 0.5,
                mb: 0.5,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                cursor: 'grab',
                '&:hover': { backgroundColor: 'action.hover', borderColor: comp.color },
                '&:active': { cursor: 'grabbing' },
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: comp.color,
                  flexShrink: 0,
                }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 500, lineHeight: 1.2, fontSize: 11 }}
                  noWrap
                >
                  {comp.name}
                </Typography>
              </Box>
              <Chip
                label={comp.configSchema.length}
                size="small"
                sx={{ height: 20, fontSize: 10 }}
              />
            </Box>
          ))}
        </Box>
      ))}
      {Object.keys(grouped).length === 0 && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: 'center', mt: 4 }}
        >
          No active components. Create some in Agent Components.
        </Typography>
      )}
    </Paper>
  );
};

export default ComponentPalette;
