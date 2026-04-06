import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Chip,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DataTable from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import SearchFilterBar from '../../components/ui/SearchFilterBar';
import RiskBadge from '../../components/ui/RiskBadge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ResidentForm from '../../components/forms/ResidentForm';
import {
  fetchResidents,
  fetchResident,
  createResident,
  updateResident,
  deleteResident,
} from '../../lib/residentsApi';
import type { PagedResult } from '../../types/Pagination';
import type {
  ResidentListItem,
  ResidentDetail,
  ResidentFormData,
} from '../../types/Resident';

const columns: Column<ResidentListItem>[] = [
  { id: 'caseControlNo', label: 'Case #', sortable: true, minWidth: 110 },
  { id: 'internalCode', label: 'Internal Code', minWidth: 110 },
  { id: 'safehouseName', label: 'Safehouse', sortable: true, minWidth: 120 },
  { id: 'caseStatus', label: 'Status', sortable: true, minWidth: 90 },
  { id: 'caseCategory', label: 'Category', minWidth: 100 },
  {
    id: 'currentRiskLevel',
    label: 'Risk Level',
    minWidth: 100,
    render: (row) => <RiskBadge level={row.currentRiskLevel} />,
  },
  { id: 'presentAge', label: 'Age', minWidth: 60 },
];

export default function ResidentsPage() {
  // Data state
  const [residents, setResidents] = useState<PagedResult<ResidentListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination and sort
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('caseControlNo');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Filters
  const [search, setSearch] = useState('');
  const [safehouseId, setSafehouseId] = useState('');
  const [status, setStatus] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [category, setCategory] = useState('');

  // Form dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<ResidentDetail | null>(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<ResidentListItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadResidents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchResidents({
        page,
        pageSize,
        sortBy,
        sortDir,
        search: search || undefined,
        safehouseId: safehouseId ? Number(safehouseId) : undefined,
        status: status || undefined,
        riskLevel: riskLevel || undefined,
        category: category || undefined,
      });
      setResidents(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load residents'
      );
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortBy, sortDir, search, safehouseId, status, riskLevel, category]);

  useEffect(() => {
    loadResidents();
  }, [loadResidents]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, safehouseId, status, riskLevel, category]);

  // Sort handler
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
    setEditingResident(null);
    setFormOpen(true);
  };

  const handleEdit = async (row: ResidentListItem) => {
    try {
      const detail = await fetchResident(row.residentId);
      setEditingResident(detail);
      setFormOpen(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load resident details'
      );
    }
  };

  const handleFormSubmit = async (data: ResidentFormData) => {
    if (editingResident) {
      await updateResident(editingResident.residentId, data);
    } else {
      await createResident(data);
    }
    setFormOpen(false);
    setEditingResident(null);
    loadResidents();
  };

  const handleDeleteClick = (row: ResidentListItem) => {
    setDeleteTarget(row);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await deleteResident(deleteTarget.residentId);
      setDeleteTarget(null);
      loadResidents();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete resident'
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // Expanded row renderer
  const renderExpandedRow = (row: ResidentListItem) => (
    <ExpandedResidentRow residentId={row.residentId} />
  );

  // Filter config
  const filters = [
    {
      id: 'safehouse',
      label: 'Safehouse',
      value: safehouseId,
      options: [
        { value: '1', label: 'Safehouse 1' },
        { value: '2', label: 'Safehouse 2' },
        { value: '3', label: 'Safehouse 3' },
        { value: '4', label: 'Safehouse 4' },
        { value: '5', label: 'Safehouse 5' },
      ],
      onChange: setSafehouseId,
    },
    {
      id: 'status',
      label: 'Status',
      value: status,
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Closed', label: 'Closed' },
        { value: 'Pending', label: 'Pending' },
      ],
      onChange: setStatus,
    },
    {
      id: 'riskLevel',
      label: 'Risk Level',
      value: riskLevel,
      options: [
        { value: 'Critical', label: 'Critical' },
        { value: 'High', label: 'High' },
        { value: 'Medium', label: 'Medium' },
        { value: 'Low', label: 'Low' },
      ],
      onChange: setRiskLevel,
    },
    {
      id: 'category',
      label: 'Category',
      value: category,
      options: [
        { value: 'CICL', label: 'CICL' },
        { value: 'CNSP', label: 'CNSP' },
        { value: 'VAC', label: 'VAC' },
        { value: 'VOT', label: 'VOT' },
      ],
      onChange: setCategory,
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Residents</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Add Resident
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
        filters={filters}
      />

      <DataTable<ResidentListItem>
        columns={columns}
        rows={residents?.items ?? []}
        totalCount={residents?.totalCount ?? 0}
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
        getRowId={(r) => r.residentId}
      />

      {/* Create/Edit Form Dialog */}
      <ResidentForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingResident(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingResident}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        message={`Are you sure you want to delete resident ${deleteTarget?.caseControlNo ?? deleteTarget?.internalCode ?? ''}? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </Box>
  );
}

/**
 * Expanded row component that fetches full resident details
 */
function ExpandedResidentRow({ residentId }: { residentId: number }) {
  const [detail, setDetail] = useState<ResidentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchResident(residentId);
        if (!cancelled) setDetail(data);
      } catch {
        // silently fail — row is non-critical
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [residentId]);

  if (loading) {
    return (
      <Typography variant="body2" color="text.secondary">
        Loading details...
      </Typography>
    );
  }

  if (!detail) {
    return (
      <Typography variant="body2" color="text.secondary">
        Could not load details
      </Typography>
    );
  }

  const subCategories = [
    detail.subCatOrphaned && 'Orphaned',
    detail.subCatTrafficked && 'Trafficked',
    detail.subCatChildLabor && 'Child Labor',
    detail.subCatPhysicalAbuse && 'Physical Abuse',
    detail.subCatSexualAbuse && 'Sexual Abuse',
    detail.subCatOsaec && 'OSAEC',
    detail.subCatCicl && 'CICL',
    detail.subCatAtRisk && 'At Risk',
    detail.subCatStreetChild && 'Street Child',
    detail.subCatChildWithHiv && 'Child with HIV',
  ].filter(Boolean);

  return (
    <Grid container spacing={2}>
      {/* Identity */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Identity
        </Typography>
        <DetailField label="Sex" value={detail.sex} />
        <DetailField label="Date of Birth" value={detail.dateOfBirth} />
        <DetailField label="Place of Birth" value={detail.placeOfBirth} />
        <DetailField label="Birth Status" value={detail.birthStatus} />
        <DetailField label="Religion" value={detail.religion} />
        <DetailField label="PWD" value={detail.isPwd ? `Yes — ${detail.pwdType ?? 'unspecified'}` : 'No'} />
        <DetailField label="Special Needs" value={detail.hasSpecialNeeds ? detail.specialNeedsDiagnosis ?? 'Yes' : 'No'} />
      </Grid>

      {/* Case Info */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Case Info
        </Typography>
        <DetailField label="Admission Date" value={detail.dateOfAdmission} />
        <DetailField label="Age at Admission" value={detail.ageUponAdmission} />
        <DetailField label="Length of Stay" value={detail.lengthOfStay} />
        <DetailField label="Referral Source" value={detail.referralSource} />
        <DetailField label="Referring Agency" value={detail.referringAgencyPerson} />
        <DetailField label="Social Worker" value={detail.assignedSocialWorker} />
        <DetailField label="Initial Assessment" value={detail.initialCaseAssessment} />
      </Grid>

      {/* Reintegration & Sub-categories */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Reintegration
        </Typography>
        <DetailField label="Type" value={detail.reintegrationType} />
        <DetailField label="Status" value={detail.reintegrationStatus} />
        <DetailField label="Initial Risk" value={detail.initialRiskLevel} />
        <DetailField label="Date Enrolled" value={detail.dateEnrolled} />
        <DetailField label="Date Closed" value={detail.dateClosed} />

        {subCategories.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Sub-Categories
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {subCategories.map((cat) => (
                <Chip key={cat as string} label={cat} size="small" variant="outlined" />
              ))}
            </Box>
          </Box>
        )}

        {/* Family */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Family Background
          </Typography>
          {detail.familyIs4ps && <Chip label="4Ps Member" size="small" sx={{ mr: 0.5, mb: 0.5 }} />}
          {detail.familySoloParent && <Chip label="Solo Parent" size="small" sx={{ mr: 0.5, mb: 0.5 }} />}
          {detail.familyIndigenous && <Chip label="Indigenous" size="small" sx={{ mr: 0.5, mb: 0.5 }} />}
          {detail.familyParentPwd && <Chip label="Parent PWD" size="small" sx={{ mr: 0.5, mb: 0.5 }} />}
          {detail.familyInformalSettler && <Chip label="Informal Settler" size="small" sx={{ mr: 0.5, mb: 0.5 }} />}
          {!detail.familyIs4ps && !detail.familySoloParent && !detail.familyIndigenous && !detail.familyParentPwd && !detail.familyInformalSettler && (
            <Typography variant="body2" color="text.secondary">None flagged</Typography>
          )}
        </Box>
      </Grid>
    </Grid>
  );
}

function DetailField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <Typography variant="body2" sx={{ mb: 0.5 }}>
      <Box component="span" sx={{ fontWeight: 600 }}>{label}:</Box>{' '}
      {value ?? '-'}
    </Typography>
  );
}
