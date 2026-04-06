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
import type { DonationItem, DonationFormData } from '../../types/Donation';

const donationSchema = z.object({
  supporterId: z.number(),
  donationType: z.string().min(1, 'Type is required'),
  donationDate: z.string().min(1, 'Date is required'),
  isRecurring: z.boolean().default(false),
  campaignName: z.string().max(200).optional().nullable(),
  channelSource: z.string().optional().nullable(),
  currencyCode: z.string().default('USD'),
  amount: z.number().min(0.01, 'Amount must be positive'),
  estimatedValue: z.number().optional().nullable(),
  impactUnit: z.string().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  referralPostId: z.number().optional().nullable(),
});

interface DonationFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: DonationFormData) => Promise<void>;
  initialData?: DonationItem | null;
  supporterId: number;
}

export default function DonationForm({
  open,
  onClose,
  onSubmit,
  initialData,
  supporterId,
}: DonationFormProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [submitError, setSubmitError] = useState<string | null>(null);

  const defaultValues: DonationFormData = {
    supporterId,
    donationType: null,
    donationDate: null,
    isRecurring: false,
    campaignName: null,
    channelSource: null,
    currencyCode: 'USD',
    amount: 0,
    estimatedValue: null,
    impactUnit: null,
    notes: null,
    referralPostId: null,
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DonationFormData>({
    resolver: zodResolver(donationSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        const { donationId, supporterDisplayName, ...formFields } = initialData;
        void donationId; void supporterDisplayName;
        reset(formFields);
      } else {
        reset({ ...defaultValues, supporterId });
      }
      setSubmitError(null);
    }
  }, [open, initialData, reset, supporterId]);

  const onFormSubmit = async (data: DonationFormData) => {
    try {
      setSubmitError(null);
      await onSubmit({ ...data, supporterId });
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Failed to save donation'
      );
    }
  };

  const isEdit = !!initialData;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{ sx: { maxHeight: fullScreen ? undefined : '90vh' } }}
    >
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <DialogTitle>{isEdit ? 'Edit Donation' : 'Add Donation'}</DialogTitle>
        <DialogContent dividers>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="donationType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small" error={!!errors.donationType}>
                    <InputLabel>Type</InputLabel>
                    <Select {...field} value={field.value ?? ''} label="Type">
                      <MenuItem value="Cash">Cash</MenuItem>
                      <MenuItem value="In-Kind">In-Kind</MenuItem>
                      <MenuItem value="Stock">Stock</MenuItem>
                      <MenuItem value="Service">Service</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="donationDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Date"
                    type="date"
                    fullWidth
                    size="small"
                    required
                    error={!!errors.donationDate}
                    helperText={errors.donationDate?.message}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    label="Amount"
                    type="number"
                    fullWidth
                    size="small"
                    required
                    error={!!errors.amount}
                    helperText={errors.amount?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="currencyCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? 'USD'}
                    label="Currency"
                    fullWidth
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="isRecurring"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Recurring Donation"
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="campaignName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Campaign Name"
                    fullWidth
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="channelSource"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Channel Source"
                    fullWidth
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="estimatedValue"
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
                    label="Estimated Value"
                    type="number"
                    fullWidth
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="impactUnit"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Impact Unit"
                    fullWidth
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Notes"
                    fullWidth
                    size="small"
                    multiline
                    rows={3}
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
            {isEdit ? 'Save Changes' : 'Add Donation'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
