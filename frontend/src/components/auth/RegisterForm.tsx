import { type FormEvent, useState } from 'react';
import {
  TextField,
  Button,
  Alert,
  Stack,
} from '@mui/material';

interface RegisterFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  error?: string;
}

function RegisterForm({ onSubmit, error }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError('');

    if (password.length < 14) {
      setLocalError('Password must be at least 14 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(email, password);
    } finally {
      setIsSubmitting(false);
    }
  }

  const displayError = localError || error;

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
          helperText="Must be at least 14 characters"
          autoComplete="new-password"
        />
        <TextField
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          fullWidth
          autoComplete="new-password"
        />
        {displayError && <Alert severity="error">{displayError}</Alert>}
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
          fullWidth
        >
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </Button>
      </Stack>
    </form>
  );
}

export default RegisterForm;
