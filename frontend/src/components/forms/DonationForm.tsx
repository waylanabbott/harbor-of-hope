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
import type { DonationItem, DonationFormData } from '../../types/Donation';

const donationSchema = z.object({
  supporterId: z.number(),
  donationType: z.string().min(1, 'Type is required').nullable(),
  donationDate: z.string().min(1, 'Date is required').nullable(),
  isRecurring: z.boolean().default(false),
  campaignName: z.string().max(200).optional().nullable(),
  channelSource: z.string().optional().nullable(),
  currencyCode: z.string().nullable().default('USD'),
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
    resolver: zodResolver(donationSchema) as never,
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
        <DialogContent dividers sx={{ px: { xs: 3, sm: 5 }, py: 4 }}>
          {submitError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {submitError}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600, mx: 'auto' }}>
            {/* Row 1: Donation Type + Date */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <Controller
                name="donationType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.donationType}>
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
                    required
                    error={!!errors.donationDate}
                    helperText={errors.donationDate?.message}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              />
            </Box>

            {/* Row 2: Amount + Currency */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
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
                    required
                    error={!!errors.amount}
                    helperText={errors.amount?.message}
                  />
                )}
              />
              <Controller
                name="currencyCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? 'USD'}
                    label="Currency"
                    fullWidth
                  />
                )}
              />
            </Box>

            {/* Checkbox: Recurring */}
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

            {/* Row 3: Campaign Name + Channel Source */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <Controller
                name="campaignName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Campaign Name"
                    fullWidth
                  />
                )}
              />
              <Controller
                name="channelSource"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Channel Source"
                    fullWidth
                  />
                )}
              />
            </Box>

            {/* Row 4: Estimated Value + Impact Unit */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
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
                  />
                )}
              />
              <Controller
                name="impactUnit"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Impact Unit"
                    fullWidth
                  />
                )}
              />
            </Box>

            {/* Full width: Notes */}
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value ?? ''}
                  label="Notes"
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
            {isEdit ? 'Save Changes' : 'Add Donation'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
