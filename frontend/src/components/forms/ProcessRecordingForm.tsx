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
  ProcessRecordingItem,
  ProcessRecordingFormData,
} from '../../types/ProcessRecording';

const processRecordingSchema = z.object({
  residentId: z.number({ required_error: 'Resident ID is required' }),
  sessionDate: z.string().min(1, 'Date is required'),
  socialWorker: z.string().max(200).optional().nullable(),
  sessionType: z.string().min(1, 'Session type is required'),
  sessionDurationMinutes: z.number().optional().nullable(),
  emotionalStateObserved: z.string().optional().nullable(),
  emotionalStateEnd: z.string().optional().nullable(),
  sessionNarrative: z.string().max(5000).optional().nullable(),
  interventionsApplied: z.string().optional().nullable(),
  followUpActions: z.string().optional().nullable(),
  progressNoted: z.boolean().default(false),
  concernsFlagged: z.boolean().default(false),
  referralMade: z.boolean().default(false),
});

const defaultValues: ProcessRecordingFormData = {
  residentId: 0,
  sessionDate: null,
  socialWorker: null,
  sessionType: null,
  sessionDurationMinutes: null,
  emotionalStateObserved: null,
  emotionalStateEnd: null,
  sessionNarrative: null,
  interventionsApplied: null,
  followUpActions: null,
  progressNoted: false,
  concernsFlagged: false,
  referralMade: false,
};

interface ProcessRecordingFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProcessRecordingFormData) => Promise<void>;
  initialData?: ProcessRecordingItem | null;
}

export default function ProcessRecordingForm({
  open,
  onClose,
  onSubmit,
  initialData,
}: ProcessRecordingFormProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProcessRecordingFormData>({
    resolver: zodResolver(processRecordingSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        const { recordingId, residentCode, ...formFields } = initialData;
        void recordingId; void residentCode;
        reset(formFields);
      } else {
        reset(defaultValues);
      }
      setSubmitError(null);
    }
  }, [open, initialData, reset]);

  const onFormSubmit = async (data: ProcessRecordingFormData) => {
    try {
      setSubmitError(null);
      await onSubmit(data);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Failed to save session recording'
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
          {isEdit ? 'Edit Session Recording' : 'Add Session Recording'}
        </DialogTitle>
        <DialogContent dividers>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          <Grid container spacing={3}>
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
                name="sessionDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Session Date"
                    type="date"
                    fullWidth
                    size="small"
                    required
                    error={!!errors.sessionDate}
                    helperText={errors.sessionDate?.message}
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
                name="sessionType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small" error={!!errors.sessionType}>
                    <InputLabel>Session Type</InputLabel>
                    <Select {...field} value={field.value ?? ''} label="Session Type">
                      <MenuItem value="Individual">Individual</MenuItem>
                      <MenuItem value="Group">Group</MenuItem>
                      <MenuItem value="Family">Family</MenuItem>
                      <MenuItem value="Crisis">Crisis</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="sessionDurationMinutes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                    label="Duration (minutes)"
                    type="number"
                    fullWidth
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="emotionalStateObserved"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Emotional State (Start)"
                    fullWidth
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="emotionalStateEnd"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Emotional State (End)"
                    fullWidth
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="sessionNarrative"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Session Narrative"
                    fullWidth
                    size="small"
                    multiline
                    rows={4}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="interventionsApplied"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Interventions Applied"
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
                name="followUpActions"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Follow-up Actions"
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <Controller
                name="progressNoted"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Progress Noted"
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <Controller
                name="concernsFlagged"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Concerns Flagged"
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <Controller
                name="referralMade"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Referral Made"
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
            {isEdit ? 'Save Changes' : 'Add Recording'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
