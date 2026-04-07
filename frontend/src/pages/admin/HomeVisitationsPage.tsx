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
    render: (row) =>
      row.safetyConcernsNoted ? (
        <Chip label="Warning" size="small" color="warning" />
      ) : (
        <Chip label="None" size="small" variant="outlined" />
      ),
  },
  {
    id: 'followUpNeeded',
    label: 'Follow-up',
    minWidth: 90,
    align: 'center',
    render: (row) => (
      <Chip
        label={row.followUpNeeded ? 'Needed' : 'No'}
        size="small"
        color={row.followUpNeeded ? 'info' : 'default'}
        variant="outlined"
      />
    ),
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
            `${opt.internalCode ?? ''} - ${opt.caseControlNo ?? ''}`.trim()
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
