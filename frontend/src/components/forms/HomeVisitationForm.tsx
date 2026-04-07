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
  Box,
  CircularProgress,
  Alert,
  Autocomplete,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type {
  HomeVisitationItem,
  HomeVisitationFormData,
} from '../../types/HomeVisitation';
import { fetchResidents } from '../../lib/residentsApi';
import type { ResidentListItem } from '../../types/Resident';
import {
  FAMILY_COOPERATION_LEVELS,
  HOME_VISIT_TYPES,
  VISIT_OUTCOMES,
} from '../../constants/domainFieldOptions';

const homeVisitationSchema = z.object({
  residentId: z.number({ error: 'Resident ID is required' }),
  visitDate: z.string().min(1, 'Date is required').nullable(),
  socialWorker: z.string().max(200).optional().nullable(),
  visitType: z.string().min(1, 'Visit type is required').nullable(),
  locationVisited: z.string().optional().nullable(),
  familyMembersPresent: z.string().optional().nullable(),
  purpose: z.string().optional().nullable(),
  observations: z.string().max(5000).optional().nullable(),
  familyCooperationLevel: z.string().optional().nullable(),
  safetyConcernsNoted: z.boolean().default(false),
  followUpNeeded: z.boolean().default(false),
  followUpNotes: z.string().optional().nullable(),
  visitOutcome: z.string().optional().nullable(),
});

const defaultValues: HomeVisitationFormData = {
  residentId: 0,
  visitDate: null,
  socialWorker: null,
  visitType: null,
  locationVisited: null,
  familyMembersPresent: null,
  purpose: null,
  observations: null,
  familyCooperationLevel: null,
  safetyConcernsNoted: false,
  followUpNeeded: false,
  followUpNotes: null,
  visitOutcome: null,
};

interface HomeVisitationFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: HomeVisitationFormData) => Promise<void>;
  initialData?: HomeVisitationItem | null;
}

export default function HomeVisitationForm({
  open,
  onClose,
  onSubmit,
  initialData,
}: HomeVisitationFormProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [residents, setResidents] = useState<ResidentListItem[]>([]);

  useEffect(() => {
    fetchResidents({ page: 1, pageSize: 200, sortBy: 'caseControlNo', sortDir: 'asc' })
      .then((data) => setResidents(data.items))
      .catch(() => {});
  }, []);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<HomeVisitationFormData>({
    resolver: zodResolver(homeVisitationSchema) as never,
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        const { visitationId, residentCode, ...formFields } = initialData;
        void visitationId; void residentCode;
        reset(formFields);
      } else {
        reset(defaultValues);
      }
      setSubmitError(null);
    }
  }, [open, initialData, reset]);

  const onFormSubmit = async (data: HomeVisitationFormData) => {
    try {
      setSubmitError(null);
      await onSubmit(data);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Failed to save home visitation'
      );
    }
  };

  const isEdit = !!initialData;

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
        <DialogTitle>
          {isEdit ? 'Edit Home Visitation' : 'Add Home Visitation'}
        </DialogTitle>
        <DialogContent dividers sx={{ px: { xs: 3, sm: 5 }, py: 4 }}>
          {submitError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {submitError}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600, mx: 'auto' }}>
            {/* Row: Resident + Visit Date */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <Controller
                name="residentId"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={residents}
                    getOptionLabel={(opt) =>
                      `${opt.caseControlNo ?? '?'} — ${opt.safehouseName ?? 'Unknown'}`
                    }
                    value={residents.find((r) => r.residentId === field.value) ?? null}
                    onChange={(_e, value) => field.onChange(value?.residentId ?? 0)}
                    isOptionEqualToValue={(opt, val) => opt.residentId === val.residentId}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Resident"
                        required
                        error={!!errors.residentId}
                        helperText={errors.residentId?.message}
                      />
                    )}
                  />
                )}
              />
              <Controller
                name="visitDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Visit Date"
                    type="date"
                    fullWidth
                    required
                    error={!!errors.visitDate}
                    helperText={errors.visitDate?.message}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              />
            </Box>

            {/* Row: Social Worker + Visit Type */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <Controller
                name="socialWorker"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Social Worker"
                    fullWidth
                  />
                )}
              />
              <Controller
                name="visitType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.visitType}>
                    <InputLabel>Visit Type</InputLabel>
                    <Select {...field} value={field.value ?? ''} label="Visit Type">
                      <MenuItem value="">
                        <em>Select visit type</em>
                      </MenuItem>
                      {HOME_VISIT_TYPES.map((t) => (
                        <MenuItem key={t} value={t}>
                          {t}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Box>

            {/* Row: Location + Family Members */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <Controller
                name="locationVisited"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Location Visited"
                    fullWidth
                  />
                )}
              />
              <Controller
                name="familyMembersPresent"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Family Members Present"
                    fullWidth
                  />
                )}
              />
            </Box>

            {/* Full width: Purpose */}
            <Controller
              name="purpose"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value ?? ''}
                  label="Purpose"
                  fullWidth
                  multiline
                  rows={2}
                />
              )}
            />

            {/* Full width: Observations */}
            <Controller
              name="observations"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value ?? ''}
                  label="Observations"
                  fullWidth
                  multiline
                  rows={4}
                />
              )}
            />

            {/* Row: Cooperation Level + Visit Outcome */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <Controller
                name="familyCooperationLevel"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Cooperation Level</InputLabel>
                    <Select
                      {...field}
                      value={field.value ?? ''}
                      label="Cooperation Level"
                    >
                      <MenuItem value="">Not assessed</MenuItem>
                      {FAMILY_COOPERATION_LEVELS.map((lvl) => (
                        <MenuItem key={lvl} value={lvl}>
                          {lvl}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
              <Controller
                name="visitOutcome"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Visit Outcome</InputLabel>
                    <Select
                      {...field}
                      value={field.value ?? ''}
                      label="Visit Outcome"
                    >
                      <MenuItem value="">
                        <em>Not specified</em>
                      </MenuItem>
                      {VISIT_OUTCOMES.map((o) => (
                        <MenuItem key={o} value={o}>
                          {o}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Box>

            {/* Checkboxes */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Controller
                name="safetyConcernsNoted"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Safety Concerns"
                  />
                )}
              />
              <Controller
                name="followUpNeeded"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Follow-up Needed"
                  />
                )}
              />
            </Box>

            {/* Full width: Follow-up Notes */}
            <Controller
              name="followUpNotes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value ?? ''}
                  label="Follow-up Notes"
                  fullWidth
                  multiline
                  rows={3}
                />
              )}
            />
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
            {isEdit ? 'Save Changes' : 'Add Visitation'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
