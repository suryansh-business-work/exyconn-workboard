import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import { Menu as MenuIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HEADER_HEIGHT, menuItems } from './layoutConstants';

interface AppBarHeaderProps {
  drawerWidth: number;
  onMenuToggle: () => void;
}

const AppBarHeader = ({ drawerWidth, onMenuToggle }: AppBarHeaderProps) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleLogout = () => {
    logout();
    setAnchorEl(null);
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        bgcolor: '#fafafa',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
      }}
    >
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          minHeight: `${HEADER_HEIGHT}px !important`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            edge="start"
            onClick={onMenuToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            {menuItems.find((item) => location.pathname.startsWith(item.path))?.text ||
              'Workboard'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {user && (
            <>
              <Box
                sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right', mr: 1 }}
              >
                <Typography variant="body2" fontWeight={600} lineHeight={1.2}>
                  {user.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
              <Tooltip title="Account">
                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppBarHeader;
