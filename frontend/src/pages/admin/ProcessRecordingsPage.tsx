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
import ProcessRecordingForm from '../../components/forms/ProcessRecordingForm';
import {
  fetchProcessRecordings,
  createProcessRecording,
  updateProcessRecording,
  deleteProcessRecording,
} from '../../lib/processRecordingsApi';
import { fetchResidents } from '../../lib/residentsApi';
import type { PagedResult } from '../../types/Pagination';
import type {
  ProcessRecordingItem,
  ProcessRecordingFormData,
} from '../../types/ProcessRecording';
import type { ResidentListItem } from '../../types/Resident';

function ProgressChip({ row }: { row: ProcessRecordingItem }) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const hasNotes = row.sessionNarrative || row.interventionsApplied || row.followUpActions;

  if (!row.progressNoted) {
    return <Chip label="No" size="small" variant="outlined" />;
  }

  return (
    <>
      <Chip
        label="Yes"
        size="small"
        color="success"
        variant="outlined"
        onClick={hasNotes ? (e) => setAnchorEl(e.currentTarget) : undefined}
        sx={hasNotes ? { cursor: 'pointer' } : undefined}
      />
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{ paper: { sx: { p: 2.5, maxWidth: 400, borderRadius: 2 } } }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'success.dark' }}>
          Session Notes
        </Typography>
        {row.sessionNarrative && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" color="text.secondary">Narrative</Typography>
            <Typography variant="body2">{row.sessionNarrative}</Typography>
          </Box>
        )}
        {row.interventionsApplied && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" color="text.secondary">Interventions Applied</Typography>
            <Typography variant="body2">{row.interventionsApplied}</Typography>
          </Box>
        )}
        {row.followUpActions && (
          <Box>
            <Typography variant="caption" color="text.secondary">Follow-up Actions</Typography>
            <Typography variant="body2">{row.followUpActions}</Typography>
          </Box>
        )}
      </Popover>
    </>
  );
}

function ConcernsChip({ row }: { row: ProcessRecordingItem }) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const hasNotes = row.sessionNarrative || row.followUpActions;

  if (!row.concernsFlagged) {
    return <Chip label="None" size="small" variant="outlined" />;
  }

  return (
    <>
      <Chip
        label="Flagged"
        size="small"
        color="warning"
        onClick={hasNotes ? (e) => setAnchorEl(e.currentTarget) : undefined}
        sx={hasNotes ? { cursor: 'pointer' } : undefined}
      />
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{ paper: { sx: { p: 2.5, maxWidth: 400, borderRadius: 2 } } }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'warning.dark' }}>
          Concern Details
        </Typography>
        {row.sessionNarrative && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" color="text.secondary">Narrative</Typography>
            <Typography variant="body2">{row.sessionNarrative}</Typography>
          </Box>
        )}
        {row.followUpActions && (
          <Box>
            <Typography variant="caption" color="text.secondary">Follow-up Actions</Typography>
            <Typography variant="body2">{row.followUpActions}</Typography>
          </Box>
        )}
      </Popover>
    </>
  );
}

const columns: Column<ProcessRecordingItem>[] = [
  { id: 'residentCode', label: 'Resident', sortable: true, minWidth: 100 },
  { id: 'sessionDate', label: 'Date', sortable: true, minWidth: 100 },
  { id: 'socialWorker', label: 'Social Worker', minWidth: 130 },
  { id: 'sessionType', label: 'Type', minWidth: 90 },
  {
    id: 'sessionDurationMinutes',
    label: 'Duration',
    minWidth: 80,
    render: (row) => (row.sessionDurationMinutes != null ? `${row.sessionDurationMinutes} min` : '-'),
  },
  {
    id: 'emotionalStateObserved',
    label: 'Emotional State',
    minWidth: 160,
    render: (row) => {
      const start = row.emotionalStateObserved ?? '?';
      const end = row.emotionalStateEnd ?? '?';
      return `${start} -> ${end}`;
    },
  },
  {
    id: 'progressNoted',
    label: 'Progress',
    minWidth: 80,
    align: 'center',
    render: (row) => <ProgressChip row={row} />,
  },
  {
    id: 'concernsFlagged',
    label: 'Concerns',
    minWidth: 90,
    align: 'center',
    render: (row) => <ConcernsChip row={row} />,
  },
];

export default function ProcessRecordingsPage() {
  useEffect(() => {
    document.title = 'Sessions | Harbor of Hope';
  }, []);

  // Data state
  const [recordings, setRecordings] = useState<PagedResult<ProcessRecordingItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination and sort
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('sessionDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Filters
  const [residentId, setResidentId] = useState('');
  const [residents, setResidents] = useState<ResidentListItem[]>([]);
  const [selectedResident, setSelectedResident] = useState<ResidentListItem | null>(null);

  // Form dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecording, setEditingRecording] = useState<ProcessRecordingItem | null>(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<ProcessRecordingItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load residents list for the filter dropdown
  useEffect(() => {
    fetchResidents({ page: 1, pageSize: 200, sortBy: 'caseControlNo', sortDir: 'asc' })
      .then((data) => setResidents(data.items))
      .catch(() => { /* non-critical */ });
  }, []);

  const loadRecordings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProcessRecordings({
        page,
        pageSize,
        sortBy,
        sortDir,
        residentId: residentId ? Number(residentId) : undefined,
      });
      setRecordings(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load session recordings'
      );
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortBy, sortDir, residentId]);

  useEffect(() => {
    loadRecordings();
  }, [loadRecordings]);

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
    setEditingRecording(null);
    setFormOpen(true);
  };

  const handleEdit = (row: ProcessRecordingItem) => {
    setEditingRecording(row);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: ProcessRecordingFormData) => {
    if (editingRecording) {
      await updateProcessRecording(editingRecording.recordingId, data);
    } else {
      await createProcessRecording(data);
    }
    setFormOpen(false);
    setEditingRecording(null);
    loadRecordings();
  };

  const handleDeleteClick = (row: ProcessRecordingItem) => {
    setDeleteTarget(row);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await deleteProcessRecording(deleteTarget.recordingId);
      setDeleteTarget(null);
      loadRecordings();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete session recording'
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>Session Recordings</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Add Session
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

      <DataTable<ProcessRecordingItem>
        columns={columns}
        rows={recordings?.items ?? []}
        totalCount={recordings?.totalCount ?? 0}
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
        getRowId={(r) => r.recordingId}
      />

      {/* Create/Edit Form Dialog */}
      <ProcessRecordingForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingRecording(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingRecording}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        message={`Are you sure you want to delete this session recording for resident ${deleteTarget?.residentCode ?? deleteTarget?.residentId ?? ''}? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </Box>
  );
}
