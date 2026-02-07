import { Box, Typography, Paper, Chip, Divider } from '@mui/material';
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
  const grouped = CATEGORY_ORDER.reduce<Record<string, AgentComponent[]>>((acc, cat) => {
    const items = components.filter((c) => c.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  return (
    <Paper
      variant="outlined"
      sx={{
        width: 240,
        minWidth: 240,
        height: '100%',
        overflow: 'auto',
        p: 1.5,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
        Components
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5 }}>
        Drag components onto the canvas
      </Typography>
      {Object.entries(grouped).map(([category, items]) => (
        <Box key={category} sx={{ mb: 1.5 }}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, textTransform: 'uppercase', color: 'text.secondary' }}
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
                gap: 1,
                p: 1,
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
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: comp.color,
                  flexShrink: 0,
                }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500, lineHeight: 1.2 }}
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
