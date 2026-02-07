import {
  Dashboard as DashboardIcon,
  Assignment as TaskIcon,
  SmartToy as AgentIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

export const HEADER_HEIGHT = 55;
export const DRAWER_WIDTH = 220;
export const DRAWER_COLLAPSED_WIDTH = 56;

export const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Tasks', icon: <TaskIcon />, path: '/tasks' },
  { text: 'Agents', icon: <AgentIcon />, path: '/agents' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];
