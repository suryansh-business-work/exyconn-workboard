import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Assignment as TaskIcon,
  CheckCircle as DoneIcon,
  Pending as PendingIcon,
  Warning as OverdueIcon,
  TrendingUp as TrendingIcon,
  Person as PersonIcon,
  Folder as ProjectIcon,
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Task, TaskStatus, TaskPriority } from '../../types';
import { taskService, projectService, developerService } from '../../services';
import PageHeader from '../../components/PageHeader';
import './Dashboard.scss';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

interface DashboardStats {
  totalTasks: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  overdue: number;
  dueThisWeek: number;
  completedThisWeek: number;
  topAssignees: { name: string; count: number }[];
  recentTasks: Task[];
}

const statusLabels: Record<TaskStatus, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  'in-review': 'In Review',
  done: 'Done',
};

const statusColors: Record<TaskStatus, string> = {
  todo: '#9e9e9e',
  'in-progress': '#2196f3',
  'in-review': '#ff9800',
  done: '#4caf50',
};

const priorityColors: Record<TaskPriority, string> = {
  P1: '#d32f2f',
  P2: '#f57c00',
  P3: '#fbc02d',
  P4: '#388e3c',
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projectCount, setProjectCount] = useState(0);
  const [developerCount, setDeveloperCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasks, projects, developers] = await Promise.all([
          taskService.getAll(),
          projectService.getAll(),
          developerService.getAll(),
        ]);

        setProjectCount(projects.length);
        setDeveloperCount(developers.length);

        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const byStatus: Record<TaskStatus, number> = {
          todo: 0,
          'in-progress': 0,
          'in-review': 0,
          done: 0,
        };

        const byPriority: Record<TaskPriority, number> = {
          P1: 0,
          P2: 0,
          P3: 0,
          P4: 0,
        };

        const assigneeCounts: Record<string, number> = {};
        let overdue = 0;
        let dueThisWeek = 0;
        let completedThisWeek = 0;

        tasks.forEach((task) => {
          byStatus[task.status]++;
          byPriority[task.priority]++;

          const dueDate = new Date(task.dueDate);
          if (task.status !== 'done' && dueDate < now) {
            overdue++;
          }
          if (dueDate >= now && dueDate <= weekFromNow) {
            dueThisWeek++;
          }

          if (task.status === 'done') {
            const updatedAt = new Date(task.updatedAt);
            if (updatedAt >= weekAgo) {
              completedThisWeek++;
            }
          }

          if (task.assignee) {
            assigneeCounts[task.assignee] = (assigneeCounts[task.assignee] || 0) + 1;
          }
        });

        const topAssignees = Object.entries(assigneeCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        const recentTasks = [...tasks]
          .sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 5);

        setStats({
          totalTasks: tasks.length,
          byStatus,
          byPriority,
          overdue,
          dueThisWeek,
          completedThisWeek,
          topAssignees,
          recentTasks,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box className="dashboard__loading">
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box className="dashboard">
        <Typography color="error">Failed to load dashboard data</Typography>
      </Box>
    );
  }

  const completionRate =
    stats.totalTasks > 0 ? Math.round((stats.byStatus.done / stats.totalTasks) * 100) : 0;

  return (
    <Box className="dashboard">
      <PageHeader title="Dashboard" breadcrumbs={[{ label: 'Dashboard' }]} />

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard__card dashboard__card--total">
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Tasks
                  </Typography>
                  <Typography variant="h3">{stats.totalTasks}</Typography>
                </Box>
                <TaskIcon sx={{ fontSize: 48, color: '#1976d2', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard__card dashboard__card--done">
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Completed
                  </Typography>
                  <Typography variant="h3">{stats.byStatus.done}</Typography>
                </Box>
                <DoneIcon sx={{ fontSize: 48, color: '#4caf50', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard__card dashboard__card--pending">
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    In Progress
                  </Typography>
                  <Typography variant="h3">{stats.byStatus['in-progress']}</Typography>
                </Box>
                <PendingIcon sx={{ fontSize: 48, color: '#2196f3', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard__card dashboard__card--overdue">
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Overdue
                  </Typography>
                  <Typography variant="h3" color="error">
                    {stats.overdue}
                  </Typography>
                </Box>
                <OverdueIcon sx={{ fontSize: 48, color: '#f44336', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Second Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Projects
                  </Typography>
                  <Typography variant="h4">{projectCount}</Typography>
                </Box>
                <ProjectIcon sx={{ fontSize: 40, color: '#9c27b0', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Team Members
                  </Typography>
                  <Typography variant="h4">{developerCount}</Typography>
                </Box>
                <PersonIcon sx={{ fontSize: 40, color: '#ff9800', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Due This Week
                  </Typography>
                  <Typography variant="h4">{stats.dueThisWeek}</Typography>
                </Box>
                <TrendingIcon sx={{ fontSize: 40, color: '#ff5722', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Completed This Week
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {stats.completedThisWeek}
                  </Typography>
                </Box>
                <DoneIcon sx={{ fontSize: 40, color: '#4caf50', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts and Details */}
      <Grid container spacing={3}>
        {/* Status Breakdown - Doughnut Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Task Status Breakdown
            </Typography>
            <Box
              sx={{
                height: 300,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Doughnut
                data={{
                  labels: Object.keys(stats.byStatus).map(
                    (status) => statusLabels[status as TaskStatus]
                  ),
                  datasets: [
                    {
                      data: Object.values(stats.byStatus),
                      backgroundColor: Object.keys(stats.byStatus).map(
                        (status) => statusColors[status as TaskStatus]
                      ),
                      borderColor: '#fff',
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const value = context.raw as number;
                          const percentage =
                            stats.totalTasks > 0
                              ? Math.round((value / stats.totalTasks) * 100)
                              : 0;
                          return `${context.label}: ${value} (${percentage}%)`;
                        },
                      },
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Priority Breakdown - Bar Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Task Priority Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <Bar
                data={{
                  labels: ['P1 - Critical', 'P2 - High', 'P3 - Medium', 'P4 - Low'],
                  datasets: [
                    {
                      label: 'Tasks',
                      data: [
                        stats.byPriority.P1,
                        stats.byPriority.P2,
                        stats.byPriority.P3,
                        stats.byPriority.P4,
                      ],
                      backgroundColor: [
                        priorityColors.P1,
                        priorityColors.P2,
                        priorityColors.P3,
                        priorityColors.P4,
                      ],
                      borderRadius: 8,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                      },
                    },
                  },
                }}
              />
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="body1">Overall Completion Rate</Typography>
              <Typography variant="h5" color="success.main">
                {completionRate}%
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Top Assignees */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Assignees
            </Typography>
            <List dense>
              {stats.topAssignees.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No tasks assigned yet" />
                </ListItem>
              ) : (
                stats.topAssignees.map((assignee, index) => (
                  <ListItem key={assignee.name}>
                    <ListItemIcon>
                      <Chip
                        label={index + 1}
                        size="small"
                        color={index === 0 ? 'primary' : 'default'}
                      />
                    </ListItemIcon>
                    <ListItemText primary={assignee.name} />
                    <Chip
                      label={`${assignee.count} tasks`}
                      size="small"
                      variant="outlined"
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Grid>

        {/* Recent Tasks */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Tasks
            </Typography>
            <List dense>
              {stats.recentTasks.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No tasks created yet" />
                </ListItem>
              ) : (
                stats.recentTasks.map((task) => (
                  <ListItem key={task.id}>
                    <ListItemIcon>
                      <Chip label={task.taskId} size="small" sx={{ minWidth: 70 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={task.title}
                      secondary={task.assignee}
                      primaryTypographyProps={{ noWrap: true, sx: { maxWidth: 200 } }}
                    />
                    <Chip
                      label={statusLabels[task.status]}
                      size="small"
                      sx={{ bgcolor: statusColors[task.status], color: 'white' }}
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
