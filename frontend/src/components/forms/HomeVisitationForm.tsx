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
  CircularProgress,
  Alert,
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

const homeVisitationSchema = z.object({
  residentId: z.number({ required_error: 'Resident ID is required' }),
  visitDate: z.string().min(1, 'Date is required'),
  socialWorker: z.string().max(200).optional().nullable(),
  visitType: z.string().min(1, 'Visit type is required'),
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

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<HomeVisitationFormData>({
    resolver: zodResolver(homeVisitationSchema),
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
        <DialogContent dividers sx={{ px: { xs: 2, sm: 4 }, py: 3 }}>
          {submitError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {submitError}
            </Alert>
          )}

          <Grid container spacing={3} sx={{ maxWidth: 720, mx: 'auto' }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="residentId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    label="Resident ID"
                    type="number"
                    fullWidth
                    size="small"
                    required
                    error={!!errors.residentId}
                    helperText={errors.residentId?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
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
                    size="small"
                    required
                    error={!!errors.visitDate}
                    helperText={errors.visitDate?.message}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="socialWorker"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Social Worker"
                    fullWidth
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="visitType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small" error={!!errors.visitType}>
                    <InputLabel>Visit Type</InputLabel>
                    <Select {...field} value={field.value ?? ''} label="Visit Type">
                      <MenuItem value="Routine">Routine</MenuItem>
                      <MenuItem value="Emergency">Emergency</MenuItem>
                      <MenuItem value="Follow-up">Follow-up</MenuItem>
                      <MenuItem value="Assessment">Assessment</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="locationVisited"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Location Visited"
                    fullWidth
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="familyMembersPresent"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Family Members Present"
                    fullWidth
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="purpose"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Purpose"
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="observations"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Observations"
                    fullWidth
                    size="small"
                    multiline
                    rows={4}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="familyCooperationLevel"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small">
                    <InputLabel>Cooperation Level</InputLabel>
                    <Select
                      {...field}
                      value={field.value ?? ''}
                      label="Cooperation Level"
                    >
                      <MenuItem value="">Not assessed</MenuItem>
                      <MenuItem value="High">High</MenuItem>
                      <MenuItem value="Medium">Medium</MenuItem>
                      <MenuItem value="Low">Low</MenuItem>
                      <MenuItem value="Uncooperative">Uncooperative</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="visitOutcome"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Visit Outcome"
                    fullWidth
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
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
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
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
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="followUpNotes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Follow-up Notes"
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                  />
                )}
              />
            </Grid>
          </Grid>
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
