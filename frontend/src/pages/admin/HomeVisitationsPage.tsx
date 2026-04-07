import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Alert,
  TextField,
  Paper,
  Autocomplete,
  Popover,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DataTable from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import HomeVisitationForm from '../../components/forms/HomeVisitationForm';
import {
  fetchHomeVisitations,
  createHomeVisitation,
  updateHomeVisitation,
  deleteHomeVisitation,
} from '../../lib/homeVisitationsApi';
import { fetchResidents } from '../../lib/residentsApi';
import type { PagedResult } from '../../types/Pagination';
import type {
  HomeVisitationItem,
  HomeVisitationFormData,
} from '../../types/HomeVisitation';
import type { ResidentListItem } from '../../types/Resident';

function SafetyConcernChip({ row }: { row: HomeVisitationItem }) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  if (!row.safetyConcernsNoted) {
    return <Chip label="None" size="small" variant="outlined" />;
  }
  return (
    <>
      <Chip
        label="Warning"
        size="small"
        color="warning"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ cursor: 'pointer' }}
      />
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{ paper: { sx: { p: 2.5, maxWidth: 360, borderRadius: 2 } } }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'warning.dark' }}>
          Safety Concerns
        </Typography>
        {row.observations && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary">Observations</Typography>
            <Typography variant="body2">{row.observations}</Typography>
          </Box>
        )}
        {row.visitOutcome && (
          <Box>
            <Typography variant="caption" color="text.secondary">Visit Outcome</Typography>
            <Typography variant="body2">{row.visitOutcome}</Typography>
          </Box>
        )}
        {!row.observations && !row.visitOutcome && (
          <Typography variant="body2" color="text.secondary">No additional notes recorded.</Typography>
        )}
      </Popover>
    </>
  );
}

function FollowUpChip({ row }: { row: HomeVisitationItem }) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  if (!row.followUpNeeded) {
    return <Chip label="No" size="small" variant="outlined" />;
  }
  return (
    <>
      <Chip
        label="Needed"
        size="small"
        color="info"
        variant="outlined"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ cursor: 'pointer' }}
      />
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{ paper: { sx: { p: 2.5, maxWidth: 360, borderRadius: 2 } } }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'info.dark' }}>
          Follow-up Details
        </Typography>
        {row.followUpNotes && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary">Follow-up Notes</Typography>
            <Typography variant="body2">{row.followUpNotes}</Typography>
          </Box>
        )}
        {row.purpose && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary">Visit Purpose</Typography>
            <Typography variant="body2">{row.purpose}</Typography>
          </Box>
        )}
        {row.visitOutcome && (
          <Box>
            <Typography variant="caption" color="text.secondary">Visit Outcome</Typography>
            <Typography variant="body2">{row.visitOutcome}</Typography>
          </Box>
        )}
        {!row.followUpNotes && !row.purpose && !row.visitOutcome && (
          <Typography variant="body2" color="text.secondary">No additional notes recorded.</Typography>
        )}
      </Popover>
    </>
  );
}

const columns: Column<HomeVisitationItem>[] = [
  { id: 'residentCode', label: 'Resident', sortable: true, minWidth: 100 },
  { id: 'visitDate', label: 'Date', sortable: true, minWidth: 100 },
  { id: 'socialWorker', label: 'Social Worker', minWidth: 130 },
  { id: 'visitType', label: 'Type', minWidth: 90 },
  { id: 'locationVisited', label: 'Location', minWidth: 130 },
  { id: 'familyCooperationLevel', label: 'Cooperation', minWidth: 100 },
  {
    id: 'safetyConcernsNoted',
    label: 'Safety Concerns',
    minWidth: 110,
    align: 'center',
    render: (row) => <SafetyConcernChip row={row} />,
  },
  {
    id: 'followUpNeeded',
    label: 'Follow-up',
    minWidth: 90,
    align: 'center',
    render: (row) => <FollowUpChip row={row} />,
  },
];

export default function HomeVisitationsPage() {
  useEffect(() => {
    document.title = 'Visitations | Harbor of Hope';
  }, []);

  // Data state
  const [visits, setVisits] = useState<PagedResult<HomeVisitationItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination and sort
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('visitDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Filters
  const [residentId, setResidentId] = useState('');
  const [residents, setResidents] = useState<ResidentListItem[]>([]);
  const [selectedResident, setSelectedResident] = useState<ResidentListItem | null>(null);

  // Form dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<HomeVisitationItem | null>(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<HomeVisitationItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load residents list for the filter dropdown
  useEffect(() => {
    fetchResidents({ page: 1, pageSize: 200, sortBy: 'caseControlNo', sortDir: 'asc' })
      .then((data) => setResidents(data.items))
      .catch(() => { /* non-critical */ });
  }, []);

  const loadVisits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchHomeVisitations({
        page,
        pageSize,
        sortBy,
        sortDir,
        residentId: residentId ? Number(residentId) : undefined,
      });
      setVisits(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load home visitations'
      );
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortBy, sortDir, residentId]);

  useEffect(() => {
    loadVisits();
  }, [loadVisits]);

  useEffect(() => {
    setPage(1);
  }, [residentId]);

  const handleSortChange = (column: string) => {
    if (sortBy === column) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  // CRUD handlers
  const handleCreate = () => {
    setEditingVisit(null);
    setFormOpen(true);
  };

  const handleEdit = (row: HomeVisitationItem) => {
    setEditingVisit(row);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: HomeVisitationFormData) => {
    if (editingVisit) {
      await updateHomeVisitation(editingVisit.visitationId, data);
    } else {
      await createHomeVisitation(data);
    }
    setFormOpen(false);
    setEditingVisit(null);
    loadVisits();
  };

  const handleDeleteClick = (row: HomeVisitationItem) => {
    setDeleteTarget(row);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await deleteHomeVisitation(deleteTarget.visitationId);
      setDeleteTarget(null);
      loadVisits();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete home visitation'
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>Home Visitations</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Add Visit
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 2, mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <Autocomplete
          size="small"
          options={residents}
          getOptionLabel={(opt) =>
            `${opt.caseControlNo ?? 'No case #'} — ${opt.safehouseName ?? 'Unknown safehouse'}${opt.caseStatus ? ` (${opt.caseStatus})` : ''}`
          }
          value={selectedResident}
          onChange={(_e, value) => {
            setSelectedResident(value);
            setResidentId(value ? String(value.residentId) : '');
          }}
          renderInput={(params) => (
            <TextField {...params} label="Filter by Resident" placeholder="Search residents..." />
          )}
          sx={{ minWidth: 280 }}
          isOptionEqualToValue={(opt, val) => opt.residentId === val.residentId}
        />
      </Paper>

      <DataTable<HomeVisitationItem>
        columns={columns}
        rows={visits?.items ?? []}
        totalCount={visits?.totalCount ?? 0}
        page={page}
        pageSize={pageSize}
        sortBy={sortBy}
        sortDir={sortDir}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onSortChange={handleSortChange}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        loading={loading}
        getRowId={(r) => r.visitationId}
      />

      {/* Create/Edit Form Dialog */}
      <HomeVisitationForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingVisit(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingVisit}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        message={`Are you sure you want to delete this home visitation for resident ${deleteTarget?.residentCode ?? deleteTarget?.residentId ?? ''}? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </Box>
  );
}
