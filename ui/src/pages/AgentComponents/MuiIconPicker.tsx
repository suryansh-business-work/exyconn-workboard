import { useState, useMemo, createElement } from 'react';
import {
  Box, TextField, Typography, Popover, IconButton, Tooltip, InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import * as Icons from '@mui/icons-material';
import { MUI_ICON_NAMES, MuiIconName } from './iconList';

interface Props {
  value: string;
  onChange: (iconName: string) => void;
}

const iconsMap = Icons as Record<string, React.ElementType>;

const renderIcon = (name: string, props?: Record<string, unknown>) => {
  const comp = iconsMap[name];
  return comp ? createElement(comp, props) : null;
};

const MuiIconPicker = ({ value, onChange }: Props) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return MUI_ICON_NAMES as unknown as MuiIconName[];
    const q = search.toLowerCase();
    return (MUI_ICON_NAMES as unknown as MuiIconName[]).filter((n) =>
      n.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <Box>
      <Typography variant="caption" sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
        Icon
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 1,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          cursor: 'pointer',
          '&:hover': { borderColor: 'primary.main' },
        }}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        {value && renderIcon(value, { sx: { fontSize: 20 } })}
        <Typography variant="body2" sx={{ flex: 1 }}>
          {value || 'Select icon...'}
        </Typography>
      </Box>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => { setAnchorEl(null); setSearch(''); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { width: 320, maxHeight: 360, p: 1.5 } } }}
      >
        <TextField
          size="small"
          placeholder="Search icons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          autoFocus
          sx={{ mb: 1 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxHeight: 260, overflow: 'auto' }}>
          {filtered.map((name) => {
            if (!iconsMap[name]) return null;
            return (
              <Tooltip key={name} title={name}>
                <IconButton
                  size="small"
                  onClick={() => { onChange(name); setAnchorEl(null); setSearch(''); }}
                  sx={{
                    border: value === name ? '2px solid' : '1px solid',
                    borderColor: value === name ? 'primary.main' : 'divider',
                    borderRadius: 1,
                    width: 36,
                    height: 36,
                  }}
                >
                  {renderIcon(name, { sx: { fontSize: 18 } })}
                </IconButton>
              </Tooltip>
            );
          })}
          {filtered.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center', width: '100%' }}>
              No icons found
            </Typography>
          )}
        </Box>
      </Popover>
    </Box>
  );
};

export default MuiIconPicker;
