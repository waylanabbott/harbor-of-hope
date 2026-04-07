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
  Box,
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
    resolver: zodResolver(supporterSchema) as never,
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
        <DialogContent dividers sx={{ px: { xs: 3, sm: 5 }, py: 4 }}>
          {submitError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {submitError}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600, mx: 'auto' }}>
            {/* Row 1: Display Name + Type */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <Controller
                name="displayName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Display Name"
                    fullWidth
                    required
                    error={!!errors.displayName}
                    helperText={errors.displayName?.message}
                  />
                )}
              />
              <Controller
                name="supporterType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.supporterType}>
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
            </Box>

            {/* Row 2: First Name + Last Name */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="First Name"
                    fullWidth
                  />
                )}
              />
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Last Name"
                    fullWidth
                  />
                )}
              />
            </Box>

            {/* Row 3: Organization Name + Email */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <Controller
                name="organizationName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Organization Name"
                    fullWidth
                  />
                )}
              />
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
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Box>

            {/* Row 4: Phone + Region */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Phone"
                    fullWidth
                  />
                )}
              />
              <Controller
                name="region"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Region"
                    fullWidth
                  />
                )}
              />
            </Box>

            {/* Row 5: Country + Relationship Type */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Country"
                    fullWidth
                  />
                )}
              />
              <Controller
                name="relationshipType"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Relationship Type"
                    fullWidth
                  />
                )}
              />
            </Box>

            {/* Row 6: Status + Acquisition Channel */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select {...field} value={field.value ?? ''} label="Status">
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
              <Controller
                name="acquisitionChannel"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label="Acquisition Channel"
                    fullWidth
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
            {isEdit ? 'Save Changes' : 'Create Supporter'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
