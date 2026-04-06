import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Alert,
  TextField,
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
import type { PagedResult } from '../../types/Pagination';
import type {
  ProcessRecordingItem,
  ProcessRecordingFormData,
} from '../../types/ProcessRecording';

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
    render: (row) => (
      <Chip
        label={row.progressNoted ? 'Yes' : 'No'}
        size="small"
        color={row.progressNoted ? 'success' : 'default'}
        variant="outlined"
      />
    ),
  },
];

export default function ProcessRecordingsPage() {
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

  // Form dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecording, setEditingRecording] = useState<ProcessRecordingItem | null>(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<ProcessRecordingItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">Session Recordings</Typography>
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

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          size="small"
          label="Filter by Resident ID"
          type="number"
          value={residentId}
          onChange={(e) => setResidentId(e.target.value)}
          sx={{ minWidth: 200 }}
        />
      </Box>

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
