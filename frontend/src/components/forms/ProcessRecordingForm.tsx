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
  ProcessRecordingItem,
  ProcessRecordingFormData,
} from '../../types/ProcessRecording';
import { fetchResidents } from '../../lib/residentsApi';
import type { ResidentListItem } from '../../types/Resident';
import {
  EMOTIONAL_STATES_END,
  EMOTIONAL_STATES_START,
  SESSION_TYPES,
} from '../../constants/domainFieldOptions';

const processRecordingSchema = z.object({
  residentId: z.number({ error: 'Resident ID is required' }),
  sessionDate: z.string().min(1, 'Date is required').nullable(),
  socialWorker: z.string().max(200).optional().nullable(),
  sessionType: z.string().min(1, 'Session type is required').nullable(),
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
  } = useForm<ProcessRecordingFormData>({
    resolver: zodResolver(processRecordingSchema) as never,
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
            {/* Row: Resident + Session Date */}
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
                      <MenuItem value="">
                        <em>Select session type</em>
                      </MenuItem>
                      {SESSION_TYPES.map((t) => (
                        <MenuItem key={t} value={t}>
                          {t}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Box>

            {/* Duration on its own row; emotional selects need width so labels don’t overlap the arrow */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ maxWidth: { xs: '100%', sm: 220 } }}>
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
              </Box>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 3,
                  minWidth: 0,
                }}
              >
                <Controller
                  name="emotionalStateObserved"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth size="small" sx={{ minWidth: 0 }}>
                      <InputLabel id="emotion-start-label">Emotional state (start)</InputLabel>
                      <Select
                        {...field}
                        labelId="emotion-start-label"
                        value={field.value ?? ''}
                        label="Emotional state (start)"
                      >
                        <MenuItem value="">
                          <em>Not specified</em>
                        </MenuItem>
                        {EMOTIONAL_STATES_START.map((s) => (
                          <MenuItem key={s} value={s}>
                            {s}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
                <Controller
                  name="emotionalStateEnd"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth size="small" sx={{ minWidth: 0 }}>
                      <InputLabel id="emotion-end-label">Emotional state (end)</InputLabel>
                      <Select
                        {...field}
                        labelId="emotion-end-label"
                        value={field.value ?? ''}
                        label="Emotional state (end)"
                      >
                        <MenuItem value="">
                          <em>Not specified</em>
                        </MenuItem>
                        {EMOTIONAL_STATES_END.map((s) => (
                          <MenuItem key={s} value={s}>
                            {s}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Box>
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
