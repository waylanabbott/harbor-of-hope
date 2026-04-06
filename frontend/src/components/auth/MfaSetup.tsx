import { type FormEvent, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  fetchTwoFactorStatus,
  setupTwoFactor,
  verifyTwoFactor,
  disableTwoFactor,
} from '../../lib/authApi';
import type { TwoFactorStatus, TwoFactorSetup } from '../../types/TwoFactorStatus';

function MfaSetup() {
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [setup, setSetup] = useState<TwoFactorSetup | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void loadStatus();
  }, []);

  useEffect(() => {
    if (!setup?.authenticatorUri) {
      setQrCodeDataUrl('');
      return;
    }

    QRCode.toDataURL(setup.authenticatorUri, { width: 224, margin: 1 })
      .then(setQrCodeDataUrl)
      .catch(() => setQrCodeDataUrl(''));
  }, [setup?.authenticatorUri]);

  async function loadStatus() {
    setError('');
    try {
      const s = await fetchTwoFactorStatus();
      setStatus(s);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load MFA status.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSetup() {
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const result = await setupTwoFactor();
      setSetup(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to set up MFA.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const result = await verifyTwoFactor(verifyCode);
      setRecoveryCodes(result.recoveryCodes ?? []);
      setSetup(null);
      setVerifyCode('');
      setSuccess('MFA is now enabled. Save the recovery codes below.');
      await loadStatus();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to verify MFA code.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDisable() {
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await disableTwoFactor();
      setRecoveryCodes([]);
      setSetup(null);
      setSuccess('MFA has been disabled for this account.');
      await loadStatus();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to disable MFA.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      {status && (
        <Box>
          <Chip
            label={status.isMfaEnabled ? 'MFA Enabled' : 'MFA Not Enabled'}
            color={status.isMfaEnabled ? 'success' : 'warning'}
            sx={{ mb: 2 }}
          />
        </Box>
      )}

      {!status?.isMfaEnabled && !setup && (
        <Button
          variant="contained"
          onClick={handleSetup}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Setting up...' : 'Enable MFA'}
        </Button>
      )}

      {setup && (
        <Stack spacing={2}>
          {qrCodeDataUrl && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Scan this QR code with your authenticator app
              </Typography>
              <img
                src={qrCodeDataUrl}
                alt="Authenticator app QR code"
                style={{
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  padding: 8,
                  backgroundColor: '#fff',
                }}
              />
            </Box>
          )}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Or enter this key manually
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}
            >
              {setup.sharedKey}
            </Typography>
          </Box>
          <form onSubmit={handleVerify}>
            <Stack spacing={2}>
              <TextField
                label="Verification Code"
                type="text"
                inputMode="numeric"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                required
                helperText="Enter the 6-digit code from your authenticator app"
                autoComplete="one-time-code"
              />
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Verifying...' : 'Verify'}
              </Button>
            </Stack>
          </form>
        </Stack>
      )}

      {status?.isMfaEnabled && (
        <Button
          variant="outlined"
          color="error"
          onClick={handleDisable}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Disabling...' : 'Disable MFA'}
        </Button>
      )}

      {recoveryCodes.length > 0 && (
        <Paper sx={{ p: 3, bgcolor: 'warning.light' }}>
          <Typography variant="h6" gutterBottom>
            Recovery Codes
          </Typography>
          <Typography variant="body2" gutterBottom>
            Save these now. They are shown only when newly generated.
          </Typography>
          <Stack spacing={0.5}>
            {recoveryCodes.map((code) => (
              <Typography
                key={code}
                variant="body2"
                sx={{ fontFamily: 'monospace' }}
              >
                {code}
              </Typography>
            ))}
          </Stack>
        </Paper>
      )}

      {status && !status.isMfaEnabled && !setup && (
        <Typography variant="body2" color="text.secondary">
          Recovery codes left: {status.recoveryCodesLeft}
        </Typography>
      )}
    </Stack>
  );
}

export default MfaSetup;
