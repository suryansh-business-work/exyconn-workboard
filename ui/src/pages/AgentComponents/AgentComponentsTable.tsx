import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  TablePagination,
  TextField,
  Box,
  TableSortLabel,
  MenuItem,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useState, useMemo } from 'react';
import { AgentComponent, AgentComponentCategory } from '../../types';

interface Props {
  components: AgentComponent[];
  onEdit: (c: AgentComponent) => void;
  onDelete: (c: AgentComponent) => void;
}

type SortField = 'name' | 'category' | 'status' | 'createdAt';
type SortOrder = 'asc' | 'desc';

const CATEGORIES: AgentComponentCategory[] = [
  'event',
  'data-scrapper',
  'communication',
  'ai',
  'action',
  'logic',
  'custom',
];

const CATEGORY_COLORS: Record<AgentComponentCategory, string> = {
  event: '#1976d2',
  'data-scrapper': '#f57c00',
  communication: '#2e7d32',
  ai: '#9c27b0',
  action: '#d32f2f',
  logic: '#00796b',
  custom: '#616161',
};

const AgentComponentsTable = ({ components, onEdit, onDelete }: Props) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    setSortOrder(sortField === field && sortOrder === 'asc' ? 'desc' : 'asc');
    setSortField(field);
  };

  const filtered = useMemo(() => {
    let result = components;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
      );
    }
    if (categoryFilter) {
      result = result.filter((c) => c.category === categoryFilter);
    }
    return [...result].sort((a, b) => {
      const cmp = String(a[sortField] ?? '').localeCompare(String(b[sortField] ?? ''));
      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [components, search, categoryFilter, sortField, sortOrder]);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search components..."
          size="small"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 240 }}
        />
        <TextField
          select
          size="small"
          label="Category"
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All</MenuItem>
          {CATEGORIES.map((c) => (
            <MenuItem key={c} value={c}>
              {c.replace('-', ' ')}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'name'}
                  direction={sortField === 'name' ? sortOrder : 'asc'}
                  onClick={() => handleSort('name')}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'category'}
                  direction={sortField === 'category' ? sortOrder : 'asc'}
                  onClick={() => handleSort('category')}
                >
                  Category
                </TableSortLabel>
              </TableCell>
              <TableCell>Config Fields</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'status'}
                  direction={sortField === 'status' ? sortOrder : 'asc'}
                  onClick={() => handleSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'createdAt'}
                  direction={sortField === 'createdAt' ? sortOrder : 'asc'}
                  onClick={() => handleSort('createdAt')}
                >
                  Created
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((comp) => (
              <TableRow key={comp.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: comp.color || CATEGORY_COLORS[comp.category],
                      }}
                    />
                    {comp.name}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={comp.category.replace('-', ' ')}
                    size="small"
                    sx={{
                      backgroundColor: CATEGORY_COLORS[comp.category],
                      color: '#fff',
                      textTransform: 'capitalize',
                    }}
                  />
                </TableCell>
                <TableCell>{comp.configSchema.length}</TableCell>
                <TableCell>
                  <Chip
                    label={comp.status}
                    size="small"
                    color={comp.status === 'active' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>{new Date(comp.createdAt).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => onEdit(comp)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" onClick={() => onDelete(comp)}>
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  {search || categoryFilter
                    ? 'No components match your filters.'
                    : 'No components created yet.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filtered.length}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Box>
  );
};

export default AgentComponentsTable;
