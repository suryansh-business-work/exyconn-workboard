import { useEffect } from 'react';
import { Box, Breadcrumbs, Typography, Link as MuiLink } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: React.ReactNode;
}

const PageHeader = ({ title, breadcrumbs, action }: PageHeaderProps) => {
  const location = useLocation();

  // Update document title
  useEffect(() => {
    document.title = `${title} | Workboard`;
    return () => {
      document.title = 'Workboard';
    };
  }, [title]);

  // Generate breadcrumbs from path if not provided
  const defaultBreadcrumbs: BreadcrumbItem[] =
    breadcrumbs ||
    (() => {
      const paths = location.pathname.split('/').filter(Boolean);
      return paths.map((path, index) => ({
        label: path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' '),
        path:
          index < paths.length - 1
            ? `/${paths.slice(0, index + 1).join('/')}`
            : undefined,
      }));
    })();

  return (
    <Box
      sx={{
        mb: 3,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2,
      }}
    >
      <Box>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 0.5 }}>
          <MuiLink
            component={Link}
            to="/"
            color="inherit"
            underline="hover"
            sx={{ fontSize: 14 }}
          >
            Home
          </MuiLink>
          {defaultBreadcrumbs.map((crumb, index) =>
            crumb.path ? (
              <MuiLink
                key={index}
                component={Link}
                to={crumb.path}
                color="inherit"
                underline="hover"
                sx={{ fontSize: 14 }}
              >
                {crumb.label}
              </MuiLink>
            ) : (
              <Typography key={index} color="text.primary" sx={{ fontSize: 14 }}>
                {crumb.label}
              </Typography>
            )
          )}
        </Breadcrumbs>
        <Typography variant="h5" fontWeight={600}>
          {title}
        </Typography>
      </Box>
      {action && <Box>{action}</Box>}
    </Box>
  );
};

export default PageHeader;
