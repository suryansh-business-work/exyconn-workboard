import { useState } from 'react';
import { Box, Tabs, Tab, Paper, Typography, Divider } from '@mui/material';
import {
  People as PeopleIcon,
  Email as EmailIcon,
  Image as ImageIcon,
  Folder as FolderIcon,
  SmartToy as AIIcon,
  Settings as SettingsIcon,
  Key as KeyIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import DevelopersTab from '../../components/Settings/DevelopersTab';
import SMTPTab from '../../components/Settings/SMTPTab';
import ImageKitTab from '../../components/Settings/ImageKitTab';
import ProjectsTab from '../../components/Settings/ProjectsTab';
import OpenAITab from '../../components/Settings/OpenAITab';
import DailyReportTab from '../../components/Settings/DailyReportTab';
import PageHeader from '../../components/PageHeader';
import './Settings.scss';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => {
  return (
    <div role="tabpanel" hidden={value !== index} className="settings__tab-panel">
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

// Tab categories configuration
const generalTabs = [
  { icon: <FolderIcon />, label: 'Projects', component: <ProjectsTab /> },
  { icon: <PeopleIcon />, label: 'Resources', component: <DevelopersTab /> },
  { icon: <ScheduleIcon />, label: 'Daily Report', component: <DailyReportTab /> },
];

const envKeysTabs = [
  { icon: <AIIcon />, label: 'OpenAI', component: <OpenAITab /> },
  { icon: <EmailIcon />, label: 'SMTP', component: <SMTPTab /> },
  { icon: <ImageIcon />, label: 'ImageKit', component: <ImageKitTab /> },
];

const Settings = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Total tabs for rendering
  const allTabs = [...generalTabs, ...envKeysTabs];

  return (
    <Box className="settings">
      <PageHeader title="Settings" breadcrumbs={[{ label: 'Settings' }]} />

      <Paper className="settings__container">
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              px: 2,
              py: 1,
              bgcolor: 'grey.50',
            }}
          >
            <SettingsIcon fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              GENERAL
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Divider orientation="vertical" flexItem />
            <KeyIcon fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              ENV KEYS / INTEGRATIONS
            </Typography>
          </Box>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minHeight: 56,
              },
            }}
          >
            {/* General Tabs */}
            {generalTabs.map((tab, index) => (
              <Tab
                key={tab.label}
                icon={tab.icon}
                label={tab.label}
                iconPosition="start"
                sx={{
                  borderRight: index === generalTabs.length - 1 ? '2px solid' : 'none',
                  borderColor: 'divider',
                }}
              />
            ))}
            {/* Env Keys / Integrations Tabs */}
            {envKeysTabs.map((tab) => (
              <Tab
                key={tab.label}
                icon={tab.icon}
                label={tab.label}
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Box>

        {/* Render all tab panels */}
        {allTabs.map((tab, index) => (
          <TabPanel key={tab.label} value={tabValue} index={index}>
            {tab.component}
          </TabPanel>
        ))}
      </Paper>
    </Box>
  );
};

export default Settings;
