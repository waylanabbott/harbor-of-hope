import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { ResidentDetail, ResidentFormData } from '../../types/Resident';

const residentSchema = z.object({
  safehouseId: z.number({ error: 'Safehouse is required' }),
  caseControlNo: z.string().max(50).optional().nullable(),
  internalCode: z.string().max(50).optional().nullable(),
  caseStatus: z.string().min(1, 'Status is required').nullable(),
  sex: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  birthStatus: z.string().max(100).optional().nullable(),
  placeOfBirth: z.string().max(200).optional().nullable(),
  religion: z.string().max(100).optional().nullable(),
  caseCategory: z.string().max(100).optional().nullable(),

  // Sub-categories
  subCatOrphaned: z.boolean().default(false),
  subCatTrafficked: z.boolean().default(false),
  subCatChildLabor: z.boolean().default(false),
  subCatPhysicalAbuse: z.boolean().default(false),
  subCatSexualAbuse: z.boolean().default(false),
  subCatOsaec: z.boolean().default(false),
  subCatCicl: z.boolean().default(false),
  subCatAtRisk: z.boolean().default(false),
  subCatStreetChild: z.boolean().default(false),
  subCatChildWithHiv: z.boolean().default(false),

  // Disability and special needs
  isPwd: z.boolean().default(false),
  pwdType: z.string().max(100).optional().nullable(),
  hasSpecialNeeds: z.boolean().default(false),
  specialNeedsDiagnosis: z.string().max(500).optional().nullable(),

  // Family background
  familyIs4ps: z.boolean().default(false),
  familySoloParent: z.boolean().default(false),
  familyIndigenous: z.boolean().default(false),
  familyParentPwd: z.boolean().default(false),
  familyInformalSettler: z.boolean().default(false),

  // Dates and case details
  dateOfAdmission: z.string().optional().nullable(),
  ageUponAdmission: z.string().max(50).optional().nullable(),
  presentAge: z.string().max(50).optional().nullable(),
  lengthOfStay: z.string().max(50).optional().nullable(),
  referralSource: z.string().max(200).optional().nullable(),
  referringAgencyPerson: z.string().max(200).optional().nullable(),
  dateColbRegistered: z.string().optional().nullable(),
  dateColbObtained: z.string().optional().nullable(),
  assignedSocialWorker: z.string().max(200).optional().nullable(),
  initialCaseAssessment: z.string().max(1000).optional().nullable(),
  dateCaseStudyPrepared: z.string().optional().nullable(),
  reintegrationType: z.string().max(100).optional().nullable(),
  reintegrationStatus: z.string().max(100).optional().nullable(),
  initialRiskLevel: z.string().optional().nullable(),
  currentRiskLevel: z.string().optional().nullable(),
  dateEnrolled: z.string().optional().nullable(),
  dateClosed: z.string().optional().nullable(),
});

const defaultValues: ResidentFormData = {
  safehouseId: 1,
  caseControlNo: null,
  internalCode: null,
  caseStatus: 'Active',
  sex: null,
  dateOfBirth: null,
  birthStatus: null,
  placeOfBirth: null,
  religion: null,
  caseCategory: null,
  subCatOrphaned: false,
  subCatTrafficked: false,
  subCatChildLabor: false,
  subCatPhysicalAbuse: false,
  subCatSexualAbuse: false,
  subCatOsaec: false,
  subCatCicl: false,
  subCatAtRisk: false,
  subCatStreetChild: false,
  subCatChildWithHiv: false,
  isPwd: false,
  pwdType: null,
  hasSpecialNeeds: false,
  specialNeedsDiagnosis: null,
  familyIs4ps: false,
  familySoloParent: false,
  familyIndigenous: false,
  familyParentPwd: false,
  familyInformalSettler: false,
  dateOfAdmission: null,
  ageUponAdmission: null,
  presentAge: null,
  lengthOfStay: null,
  referralSource: null,
  referringAgencyPerson: null,
  dateColbRegistered: null,
  dateColbObtained: null,
  assignedSocialWorker: null,
  initialCaseAssessment: null,
  dateCaseStudyPrepared: null,
  reintegrationType: null,
  reintegrationStatus: null,
  initialRiskLevel: null,
  currentRiskLevel: null,
  dateEnrolled: null,
  dateClosed: null,
};

interface ResidentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ResidentFormData) => Promise<void>;
  initialData?: ResidentDetail | null;
}

export default function ResidentForm({
  open,
  onClose,
  onSubmit,
  initialData,
}: ResidentFormProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResidentFormData>({
    resolver: zodResolver(residentSchema) as never,
    defaultValues,
  });

  // Reset form when initialData changes (edit vs create)
  useEffect(() => {
    if (open) {
      if (initialData) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { residentId, safehouseName, createdAt, ...formFields } = initialData;
        reset(formFields);
      } else {
        reset(defaultValues);
      }
      setSubmitError(null);
      setActiveTab(0);
    }
  }, [open, initialData, reset]);

  const onFormSubmit = async (data: ResidentFormData) => {
    try {
      setSubmitError(null);
      await onSubmit(data);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Failed to save resident'
      );
    }
  };

  const isEdit = !!initialData;

  const subCategories = [
    { key: 'subCatOrphaned' as const, label: 'Orphaned' },
    { key: 'subCatTrafficked' as const, label: 'Trafficked' },
    { key: 'subCatChildLabor' as const, label: 'Child Labor' },
    { key: 'subCatPhysicalAbuse' as const, label: 'Physical Abuse' },
    { key: 'subCatSexualAbuse' as const, label: 'Sexual Abuse' },
    { key: 'subCatOsaec' as const, label: 'OSAEC' },
    { key: 'subCatCicl' as const, label: 'CICL' },
    { key: 'subCatAtRisk' as const, label: 'At Risk' },
    { key: 'subCatStreetChild' as const, label: 'Street Child' },
    { key: 'subCatChildWithHiv' as const, label: 'Child with HIV' },
  ];

  const familyFields = [
    { key: 'familyIs4ps' as const, label: '4Ps Member' },
    { key: 'familySoloParent' as const, label: 'Solo Parent' },
    { key: 'familyIndigenous' as const, label: 'Indigenous' },
    { key: 'familyParentPwd' as const, label: 'Parent is PWD' },
    { key: 'familyInformalSettler' as const, label: 'Informal Settler' },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{ sx: { maxHeight: fullScreen ? undefined : '90vh' } }}
    >
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <DialogTitle>{isEdit ? 'Edit Resident' : 'Add Resident'}</DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {submitError && (
            <Alert severity="error" sx={{ m: 2, mb: 0 }}>
              {submitError}
            </Alert>
          )}

          {/* Issue 25: Tabs for form sections */}
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
          >
            <Tab label="Basic Info" />
            <Tab label="Categories" />
            <Tab label="Family" />
            <Tab label="Case Details" />
            <Tab label="Assessment" />
          </Tabs>

          <Box sx={{ px: { xs: 2, sm: 4 }, py: 3, maxWidth: 720, mx: 'auto' }}>
            {/* Tab 0: Basic Info */}
            {activeTab === 0 && (
              <>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Basic Info
                </Typography>
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="safehouseId"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth size="small" error={!!errors.safehouseId}>
                          <InputLabel>Safehouse</InputLabel>
                          <Select {...field} label="Safehouse">
                            <MenuItem value={1}>Lighthouse Safehouse 1</MenuItem>
                            <MenuItem value={2}>Lighthouse Safehouse 2</MenuItem>
                            <MenuItem value={3}>Lighthouse Safehouse 3</MenuItem>
                            <MenuItem value={4}>Lighthouse Safehouse 4</MenuItem>
                            <MenuItem value={5}>Lighthouse Safehouse 5</MenuItem>
                            <MenuItem value={6}>Lighthouse Safehouse 6</MenuItem>
                            <MenuItem value={7}>Lighthouse Safehouse 7</MenuItem>
                            <MenuItem value={8}>Lighthouse Safehouse 8</MenuItem>
                            <MenuItem value={9}>Lighthouse Safehouse 9</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="caseControlNo"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value ?? ''}
                          label="Case Control No."
                          fullWidth
                          size="small"
                          error={!!errors.caseControlNo}
                          helperText={errors.caseControlNo?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="internalCode"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value ?? ''}
                          label="Internal Code"
                          fullWidth
                          size="small"
                          error={!!errors.internalCode}
                          helperText={errors.internalCode?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="caseStatus"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth size="small" error={!!errors.caseStatus}>
                          <InputLabel>Status</InputLabel>
                          <Select {...field} label="Status">
                            <MenuItem value="Active">Active</MenuItem>
                            <MenuItem value="Closed">Closed</MenuItem>
                            <MenuItem value="Pending">Pending</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="sex"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth size="small">
                          <InputLabel>Sex</InputLabel>
                          <Select {...field} value={field.value ?? ''} label="Sex">
                            <MenuItem value="">Not specified</MenuItem>
                            <MenuItem value="Female">Female</MenuItem>
                            <MenuItem value="Male">Male</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="dateOfBirth"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value ?? ''}
                          label="Date of Birth"
                          type="date"
                          fullWidth
                          size="small"
                          slotProps={{ inputLabel: { shrink: true } }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="caseCategory"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value ?? ''}
                          label="Case Category"
                          fullWidth
                          size="small"
                        />
                      )}
                    />
                  </Grid>
                </Grid>

                {/* Personal */}
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Personal
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="religion"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value ?? ''}
                          label="Religion"
                          fullWidth
                          size="small"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="placeOfBirth"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value ?? ''}
                          label="Place of Birth"
                          fullWidth
                          size="small"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="birthStatus"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value ?? ''}
                          label="Birth Status"
                          fullWidth
                          size="small"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Controller
                      name="isPwd"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          }
                          label="PWD"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="pwdType"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value ?? ''}
                          label="PWD Type"
                          fullWidth
                          size="small"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Controller
                      name="hasSpecialNeeds"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          }
                          label="Special Needs"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="specialNeedsDiagnosis"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value ?? ''}
                          label="Special Needs Diagnosis"
                          fullWidth
                          size="small"
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </>
            )}

            {/* Tab 1: Categories */}
            {activeTab === 1 && (
              <>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Sub-Categories
                </Typography>
                <Grid container spacing={2}>
                  {subCategories.map((cat) => (
                    <Grid item xs={12} md={6} key={cat.key}>
                      <Controller
                        name={cat.key}
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={field.value}
                                onChange={(e) => field.onChange(e.target.checked)}
                              />
                            }
                            label={cat.label}
                          />
                        )}
                      />
                    </Grid>
                  ))}
                </Grid>
              </>
            )}

            {/* Tab 2: Family */}
            {activeTab === 2 && (
              <>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Family Background
                </Typography>
                <Grid container spacing={2}>
                  {familyFields.map((f) => (
                    <Grid item xs={12} md={6} key={f.key}>
                      <Controller
                        name={f.key}
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={field.value}
                                onChange={(e) => field.onChange(e.target.checked)}
                              />
                            }
                            label={f.label}
                          />
                        )}
                      />
                    </Grid>
                  ))}
                </Grid>
              </>
            )}

            {/* Tab 3: Case Details */}
            {activeTab === 3 && (
              <>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Case Details
                </Typography>
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="dateOfAdmission"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value ?? ''}
                          label="Date of Admission"
                          type="date"
                          fullWidth
                          size="small"
                          slotProps={{ inputLabel: { shrink: true } }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="ageUponAdmission"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value ?? ''}
                          label="Age Upon Admission"
                          fullWidth
                          size="small"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="presentAge"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value ?? ''}
                          label="Present Age"
                          fullWidth
                          size="small"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="lengthOfStay"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value ?? ''}
                          label="Length of Stay"
                          fullWidth
                          size="small"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="referralSource"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value ?? ''}
                          label="Referral Source"
                          fullWidth
                          size="small"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="referringAgencyPerson"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value ?? ''}
                          label="Referring Agency/Person"
                          fullWidth
                          size="small"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="assignedSocialWorker"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value ?? ''}
                          label="Assigned Social Worker"
                          fullWidth
                          size="small"
                        />
                      )}
                    />
                  </Grid>
                </Grid>

                {/* Reintegration */}
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Reintegration
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="reintegrationType"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value ?? ''}
                          label="Reintegration Type"
                          fullWidth
                          size="small"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="reintegrationStatus"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value ?? ''}
                          label="Reintegration Status"
                          fullWidth
                          size="small"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="dateEnrolled"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value ?? ''}
                          label="Date Enrolled"
                          type="date"
                          fullWidth
                          size="small"
                          slotProps={{ inputLabel: { shrink: true } }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="dateClosed"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value ?? ''}
                          label="Date Closed"
                          type="date"
                          fullWidth
                          size="small"
                          slotProps={{ inputLabel: { shrink: true } }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </>
            )}

            {/* Tab 4: Assessment */}
            {activeTab === 4 && (
              <>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Assessment
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Controller
                      name="initialCaseAssessment"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value ?? ''}
                          label="Initial Case Assessment"
                          fullWidth
                          size="small"
                          multiline
                          rows={3}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="dateCaseStudyPrepared"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value ?? ''}
                          label="Date Case Study Prepared"
                          type="date"
                          fullWidth
                          size="small"
                          slotProps={{ inputLabel: { shrink: true } }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="initialRiskLevel"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth size="small">
                          <InputLabel>Initial Risk Level</InputLabel>
                          <Select
                            {...field}
                            value={field.value ?? ''}
                            label="Initial Risk Level"
                          >
                            <MenuItem value="">Not assessed</MenuItem>
                            <MenuItem value="Critical">Critical</MenuItem>
                            <MenuItem value="High">High</MenuItem>
                            <MenuItem value="Medium">Medium</MenuItem>
                            <MenuItem value="Low">Low</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="currentRiskLevel"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth size="small">
                          <InputLabel>Current Risk Level</InputLabel>
                          <Select
                            {...field}
                            value={field.value ?? ''}
                            label="Current Risk Level"
                          >
                            <MenuItem value="">Not assessed</MenuItem>
                            <MenuItem value="Critical">Critical</MenuItem>
                            <MenuItem value="High">High</MenuItem>
                            <MenuItem value="Medium">Medium</MenuItem>
                            <MenuItem value="Low">Low</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                </Grid>
              </>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
          >
            {isEdit ? 'Save Changes' : 'Create Resident'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
