import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ChevronLeft as CollapseIcon,
  ChevronRight as ExpandIcon,
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { HEADER_HEIGHT, menuItems } from './layoutConstants';

interface SidebarContentProps {
  collapsed: boolean;
  isMobile: boolean;
  onCollapse: () => void;
  onNavigate: (path: string) => void;
}

const SidebarContent = ({
  collapsed,
  isMobile,
  onCollapse,
  onNavigate,
}: SidebarContentProps) => {
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          px: 1.5,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
          minHeight: HEADER_HEIGHT,
          maxHeight: HEADER_HEIGHT,
          boxSizing: 'border-box',
        }}
      >
        {!collapsed && (
          <Typography variant="h6" fontWeight={700} color="primary">
            Workboard
          </Typography>
        )}
        {!isMobile && (
          <IconButton size="small" onClick={onCollapse}>
            {collapsed ? <ExpandIcon /> : <CollapseIcon />}
          </IconButton>
        )}
      </Box>
      <List sx={{ flex: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <Tooltip title={collapsed ? item.text : ''} placement="right">
              <ListItemButton
                selected={location.pathname.startsWith(item.path)}
                onClick={() => onNavigate(item.path)}
                sx={{
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  px: collapsed ? 1 : 2,
                }}
              >
                <ListItemIcon
                  sx={{ minWidth: collapsed ? 0 : 40, justifyContent: 'center' }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && <ListItemText primary={item.text} />}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default SidebarContent;
