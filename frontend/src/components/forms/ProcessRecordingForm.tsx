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
        <DialogContent dividers sx={{ px: { xs: 3, sm: 5 }, py: 4 }}>
          {submitError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {submitError}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600, mx: 'auto' }}>
            {/* Row: Resident ID + Session Date */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
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
                    required
                    error={!!errors.residentId}
                    helperText={errors.residentId?.message}
                  />
                )}
              />
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
                    required
                    error={!!errors.sessionDate}
                    helperText={errors.sessionDate?.message}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              />
            </Box>

            {/* Row: Social Worker + Session Type */}
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
                name="sessionType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.sessionType}>
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
            </Box>

            {/* Row: Duration + Emotional States */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 3 }}>
              <Controller
                name="sessionDurationMinutes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(e.target.value ? Number(e.target.value) : null)
                    }
                    label="Duration (min)"
                    type="number"
                    fullWidth
                  />
                )}
              />
              <Controller
                name="emotionalStateObserved"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Emotional State (Start)"
                    fullWidth
                  />
                )}
              />
              <Controller
                name="emotionalStateEnd"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Emotional State (End)"
                    fullWidth
                  />
                )}
              />
            </Box>

            {/* Full width: Session Narrative */}
            <Controller
              name="sessionNarrative"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value ?? ''}
                  label="Session Narrative"
                  fullWidth
                  multiline
                  rows={4}
                />
              )}
            />

            {/* Row: Interventions + Follow-up */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <Controller
                name="interventionsApplied"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Interventions Applied"
                    fullWidth
                    multiline
                    rows={3}
                  />
                )}
              />
              <Controller
                name="followUpActions"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Follow-up Actions"
                    fullWidth
                    multiline
                    rows={3}
                  />
                )}
              />
            </Box>

            {/* Checkboxes row */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
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
            </Box>
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
            {isEdit ? 'Save Changes' : 'Add Recording'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
