import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Drawer, Toolbar, useTheme, useMediaQuery } from '@mui/material';
import SidebarContent from './SidebarContent';
import { HEADER_HEIGHT, DRAWER_WIDTH, DRAWER_COLLAPSED_WIDTH } from './layoutConstants';
import AppBarHeader from './AppBarHeader';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const currentDrawerWidth = collapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH;
  const isBuilderRoute =
    location.pathname.includes('/agents/') && location.pathname.includes('/builder');

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBarHeader
        drawerWidth={currentDrawerWidth}
        onMenuToggle={() => setMobileOpen(!mobileOpen)}
      />

      <Box
        component="nav"
        sx={{ width: { md: currentDrawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          <SidebarContent
            collapsed={false}
            isMobile={isMobile}
            onCollapse={() => setCollapsed(!collapsed)}
            onNavigate={handleNavigation}
          />
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: currentDrawerWidth,
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
          open
        >
          <SidebarContent
            collapsed={collapsed}
            isMobile={isMobile}
            onCollapse={() => setCollapsed(!collapsed)}
            onNavigate={handleNavigation}
          />
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: isBuilderRoute ? 0 : 3,
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: '#f5f5f5',
        }}
      >
        <Toolbar sx={{ minHeight: `${HEADER_HEIGHT}px !important` }} />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
