import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Alert,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  IconButton,
  LinearProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DataTable from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import SearchFilterBar from '../../components/ui/SearchFilterBar';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import SupporterForm from '../../components/forms/SupporterForm';
import DonationForm from '../../components/forms/DonationForm';
import {
  fetchSupporters,
  fetchSupporter,
  createSupporter,
  updateSupporter,
  deleteSupporter,
} from '../../lib/supportersApi';
import {
  fetchDonations,
  createDonation,
  updateDonation,
  deleteDonation,
} from '../../lib/donationsApi';
import type { PagedResult } from '../../types/Pagination';
import type { SupporterItem, SupporterFormData } from '../../types/Supporter';
import type { DonationItem, DonationFormData } from '../../types/Donation';

const columns: Column<SupporterItem>[] = [
  { id: 'displayName', label: 'Display Name', sortable: true, minWidth: 150 },
  { id: 'supporterType', label: 'Type', minWidth: 100 },
  { id: 'email', label: 'Email', minWidth: 160 },
  { id: 'region', label: 'Region', minWidth: 100 },
  { id: 'status', label: 'Status', minWidth: 80 },
  {
    id: 'donationCount',
    label: 'Donations',
    minWidth: 90,
    align: 'center',
    render: (row) => (
      <Chip
        label={row.donationCount}
        size="small"
        color={row.donationCount > 0 ? 'primary' : 'default'}
        variant="outlined"
      />
    ),
  },
];

export default function SupportersPage() {
  useEffect(() => {
    document.title = 'Supporters | Harbor of Hope';
  }, []);

  // Data state
  const [supporters, setSupporters] = useState<PagedResult<SupporterItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // Pagination and sort
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('displayName');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Filters
  const [search, setSearch] = useState('');

  // Supporter form dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingSupporter, setEditingSupporter] = useState<SupporterItem | null>(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<SupporterItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Donation management state
  const [donationFormOpen, setDonationFormOpen] = useState(false);
  const [editingDonation, setEditingDonation] = useState<DonationItem | null>(null);
  const [activeSupporterId, setActiveSupporterId] = useState<number>(0);
  const [deleteDonationTarget, setDeleteDonationTarget] = useState<DonationItem | null>(null);
  const [deleteDonationLoading, setDeleteDonationLoading] = useState(false);

  const loadSupporters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSupporters({
        page,
        pageSize,
        sortBy,
        sortDir,
        search: search || undefined,
      });
      setSupporters(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load supporters'
      );
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortBy, sortDir, search]);

  useEffect(() => {
    loadSupporters();
  }, [loadSupporters]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const allColumns: Column<SupporterItem>[] = columns;

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
    setEditingSupporter(null);
    setFormOpen(true);
  };

  const handleEdit = async (row: SupporterItem) => {
    try {
      const detail = await fetchSupporter(row.supporterId);
      setEditingSupporter(detail);
      setFormOpen(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load supporter details'
      );
    }
  };

  const handleFormSubmit = async (data: SupporterFormData) => {
    if (editingSupporter) {
      await updateSupporter(editingSupporter.supporterId, data);
    } else {
      await createSupporter(data);
    }
    setFormOpen(false);
    setEditingSupporter(null);
    loadSupporters();
  };

  const handleDeleteClick = (row: SupporterItem) => {
    setDeleteTarget(row);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await deleteSupporter(deleteTarget.supporterId);
      setDeleteTarget(null);
      loadSupporters();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete supporter'
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // Donation handlers
  const handleAddDonation = (supporterId: number) => {
    setActiveSupporterId(supporterId);
    setEditingDonation(null);
    setDonationFormOpen(true);
  };

  const handleEditDonation = (donation: DonationItem) => {
    setActiveSupporterId(donation.supporterId);
    setEditingDonation(donation);
    setDonationFormOpen(true);
  };

  const handleDonationFormSubmit = async (data: DonationFormData) => {
    if (editingDonation) {
      await updateDonation(editingDonation.donationId, data);
    } else {
      await createDonation(data);
    }
    setDonationFormOpen(false);
    setEditingDonation(null);
    loadSupporters(); // refresh donation counts
  };

  const handleDeleteDonationClick = (donation: DonationItem) => {
    setDeleteDonationTarget(donation);
  };

  const handleDeleteDonationConfirm = async () => {
    if (!deleteDonationTarget) return;
    try {
      setDeleteDonationLoading(true);
      await deleteDonation(deleteDonationTarget.donationId);
      setDeleteDonationTarget(null);
      loadSupporters(); // refresh donation counts
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete donation'
      );
    } finally {
      setDeleteDonationLoading(false);
    }
  };

  // Expanded row renderer
  const renderExpandedRow = (row: SupporterItem) => (
    <ExpandedDonationsRow
      supporterId={row.supporterId}
      onAddDonation={() => handleAddDonation(row.supporterId)}
      onEditDonation={handleEditDonation}
      onDeleteDonation={handleDeleteDonationClick}
    />
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>Supporters</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Add Supporter
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
      />

      <DataTable<SupporterItem>
        columns={allColumns}
        rows={supporters?.items ?? []}
        totalCount={supporters?.totalCount ?? 0}
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
        renderExpandedRow={renderExpandedRow}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        loading={loading}
        getRowId={(r) => r.supporterId}
      />

      {/* Supporter Form Dialog */}
      <SupporterForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingSupporter(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingSupporter}
      />

      {/* Donation Form Dialog */}
      <DonationForm
        open={donationFormOpen}
        onClose={() => {
          setDonationFormOpen(false);
          setEditingDonation(null);
        }}
        onSubmit={handleDonationFormSubmit}
        initialData={editingDonation}
        supporterId={activeSupporterId}
      />

      {/* Supporter Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        message={`Are you sure you want to delete supporter "${deleteTarget?.displayName ?? ''}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      {/* Donation Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteDonationTarget}
        message={`Are you sure you want to delete this donation of ${deleteDonationTarget?.amount ?? 0} ${deleteDonationTarget?.currencyCode ?? 'USD'}? This action cannot be undone.`}
        onConfirm={handleDeleteDonationConfirm}
        onCancel={() => setDeleteDonationTarget(null)}
        loading={deleteDonationLoading}
      />
    </Box>
  );
}

/**
 * Expanded row component that fetches donations for a supporter
 */
function ExpandedDonationsRow({
  supporterId,
  onAddDonation,
  onEditDonation,
  onDeleteDonation,
}: {
  supporterId: number;
  onAddDonation: () => void;
  onEditDonation: (donation: DonationItem) => void;
  onDeleteDonation: (donation: DonationItem) => void;
}) {
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDonations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchDonations({
        page: 1,
        pageSize: 100,
        supporterId,
      });
      setDonations(data.items);
    } catch {
      // silently fail -- expanded row is non-critical
    } finally {
      setLoading(false);
    }
  }, [supporterId]);

  useEffect(() => {
    loadDonations();
  }, [loadDonations]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Donations
        </Typography>
        <Button size="small" startIcon={<AddIcon />} onClick={onAddDonation}>
          Add Donation
        </Button>
      </Box>

      {loading && <LinearProgress sx={{ mb: 1 }} />}

      {!loading && donations.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No donations recorded for this supporter.
        </Typography>
      )}

      {donations.length > 0 && (
        <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
          <Table size="small" aria-label="Supporter donations">
            <TableHead>
              <TableRow>
                <TableCell scope="col">Date</TableCell>
                <TableCell scope="col">Type</TableCell>
                <TableCell scope="col" align="right">Amount</TableCell>
                <TableCell scope="col">Campaign</TableCell>
                <TableCell scope="col" align="center">Recurring</TableCell>
                <TableCell scope="col" align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {donations.map((donation) => (
                <TableRow key={donation.donationId} hover>
                  <TableCell>{donation.donationDate ?? '-'}</TableCell>
                  <TableCell>{donation.donationType ?? '-'}</TableCell>
                  <TableCell align="right">
                    {donation.amount.toLocaleString()} {donation.currencyCode ?? 'USD'}
                  </TableCell>
                  <TableCell>{donation.campaignName ?? '-'}</TableCell>
                  <TableCell align="center">
                    {donation.isRecurring ? (
                      <Chip label="Yes" size="small" color="success" variant="outlined" />
                    ) : (
                      <Chip label="No" size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => onEditDonation(donation)}
                      color="primary"
                      aria-label="Edit donation"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDeleteDonation(donation)}
                      color="error"
                      aria-label="Delete donation"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
