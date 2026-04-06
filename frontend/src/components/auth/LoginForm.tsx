import { type FormEvent, useState } from 'react';
import {
  TextField,
  Button,
  Alert,
  Stack,
} from '@mui/material';

interface LoginFormProps {
  onSubmit: (
    email: string,
    password: string,
    twoFactorCode?: string
  ) => Promise<void>;
  error?: string;
  requiresTwoFactor: boolean;
}

function LoginForm({ onSubmit, error, requiresTwoFactor }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(email, password, twoFactorCode || undefined);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          autoComplete="email"
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          autoComplete="current-password"
        />
        {requiresTwoFactor && (
          <TextField
            label="Authenticator Code"
            type="text"
            inputMode="numeric"
            value={twoFactorCode}
            onChange={(e) => setTwoFactorCode(e.target.value)}
            required
            fullWidth
            helperText="Enter the 6-digit code from your authenticator app"
            autoComplete="one-time-code"
          />
        )}
        {error && <Alert severity="error">{error}</Alert>}
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
          fullWidth
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </Button>
      </Stack>
    </form>
  );
}

export default LoginForm;
