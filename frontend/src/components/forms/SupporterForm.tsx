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
  Grid,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { SupporterItem, SupporterFormData } from '../../types/Supporter';

const supporterSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').max(200),
  supporterType: z.string().min(1, 'Type is required'),
  organizationName: z.string().max(200).optional().nullable(),
  firstName: z.string().max(100).optional().nullable(),
  lastName: z.string().max(100).optional().nullable(),
  email: z.string().email('Invalid email').optional().nullable().or(z.literal('')),
  phone: z.string().max(50).optional().nullable(),
  relationshipType: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  acquisitionChannel: z.string().optional().nullable(),
  firstDonationDate: z.string().optional().nullable(),
});

const defaultValues: SupporterFormData = {
  displayName: null,
  supporterType: null,
  organizationName: null,
  firstName: null,
  lastName: null,
  email: null,
  phone: null,
  relationshipType: null,
  region: null,
  country: null,
  status: 'Active',
  acquisitionChannel: null,
  firstDonationDate: null,
};

interface SupporterFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SupporterFormData) => Promise<void>;
  initialData?: SupporterItem | null;
}

export default function SupporterForm({
  open,
  onClose,
  onSubmit,
  initialData,
}: SupporterFormProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupporterFormData>({
    resolver: zodResolver(supporterSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        const { supporterId, donationCount, createdAt, ...formFields } = initialData;
        void supporterId; void donationCount; void createdAt;
        reset(formFields);
      } else {
        reset(defaultValues);
      }
      setSubmitError(null);
    }
  }, [open, initialData, reset]);

  const onFormSubmit = async (data: SupporterFormData) => {
    try {
      setSubmitError(null);
      await onSubmit(data);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Failed to save supporter'
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
        <DialogTitle>{isEdit ? 'Edit Supporter' : 'Add Supporter'}</DialogTitle>
        <DialogContent dividers>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="displayName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Display Name"
                    fullWidth
                    size="small"
                    required
                    error={!!errors.displayName}
                    helperText={errors.displayName?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="supporterType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small" error={!!errors.supporterType}>
                    <InputLabel>Type</InputLabel>
                    <Select {...field} value={field.value ?? ''} label="Type">
                      <MenuItem value="Individual">Individual</MenuItem>
                      <MenuItem value="Organization">Organization</MenuItem>
                      <MenuItem value="Church">Church</MenuItem>
                      <MenuItem value="Foundation">Foundation</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="First Name"
                    fullWidth
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Last Name"
                    fullWidth
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="organizationName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Organization Name"
                    fullWidth
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Email"
                    type="email"
                    fullWidth
                    size="small"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Phone"
                    fullWidth
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="region"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Region"
                    fullWidth
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Country"
                    fullWidth
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="relationshipType"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Relationship Type"
                    fullWidth
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select {...field} value={field.value ?? ''} label="Status">
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="acquisitionChannel"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Acquisition Channel"
                    fullWidth
                    size="small"
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
            {isEdit ? 'Save Changes' : 'Create Supporter'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
