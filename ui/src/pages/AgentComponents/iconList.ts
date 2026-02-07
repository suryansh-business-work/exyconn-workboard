import { AgentComponentCategory } from '../../types';

export const MUI_ICON_NAMES = [
  'Event', 'Schedule', 'Notifications', 'Alarm', 'CalendarToday', 'Timer',
  'Storage', 'CloudDownload', 'FindInPage', 'TravelExplore', 'Search', 'FilterAlt',
  'Email', 'Chat', 'Forum', 'Message', 'Phone', 'Share', 'Send',
  'SmartToy', 'Psychology', 'AutoAwesome', 'Memory', 'Hub', 'ModelTraining',
  'PlayArrow', 'Build', 'Api', 'Terminal', 'Webhook', 'Sync',
  'AccountTree', 'CallSplit', 'Loop', 'Rule', 'Code', 'Functions',
  'Extension', 'Widgets', 'Settings', 'Tune', 'Dashboard', 'Bolt',
  'Cloud', 'DataObject', 'Description', 'Folder', 'Upload', 'Download',
  'Security', 'VpnKey', 'Lock', 'Shield', 'Verified',
  'Analytics', 'BarChart', 'PieChart', 'TrendingUp', 'Insights',
] as const;

export type MuiIconName = typeof MUI_ICON_NAMES[number];

export const CATEGORY_DEFAULT_ICONS: Record<AgentComponentCategory, MuiIconName> = {
  event: 'Event',
  'data-scrapper': 'TravelExplore',
  communication: 'Email',
  ai: 'SmartToy',
  action: 'PlayArrow',
  logic: 'AccountTree',
  custom: 'Extension',
};
