import type { AuthSession } from '../types/AuthSession';
import type {
  TwoFactorStatus,
  TwoFactorSetup,
  TwoFactorVerifyResult,
} from '../types/TwoFactorStatus';

export interface ExternalAuthProvider {
  name: string;
  displayName: string;
}

export interface LoginResult {
  requiresTwoFactor?: boolean;
  message?: string;
}

// ── Helpers ──

async function readApiError(
  response: Response,
  fallbackMessage: string
): Promise<string> {
  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    return fallbackMessage;
  }

  const data = await response.json();

  if (typeof data?.detail === 'string' && data.detail.length > 0) {
    return data.detail;
  }

  if (typeof data?.title === 'string' && data.title.length > 0) {
    return data.title;
  }

  if (data?.errors && typeof data.errors === 'object') {
    const firstError = Object.values(data.errors)
      .flat()
      .find((value): value is string => typeof value === 'string');

    if (firstError) {
      return firstError;
    }
  }

  if (typeof data?.message === 'string' && data.message.length > 0) {
    return data.message;
  }

  return fallbackMessage;
}

// ── Session ──

export async function fetchCurrentUser(): Promise<AuthSession> {
  const response = await fetch('/api/auth/me', {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Unable to load auth session.');
  }

  return response.json();
}

// ── Login / Register / Logout ──

export async function login(
  email: string,
  password: string,
  twoFactorCode?: string
): Promise<LoginResult> {
  const body: Record<string, string> = { email, password };

  if (twoFactorCode) {
    body.twoFactorCode = twoFactorCode;
  }

  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(
      await readApiError(response, 'Unable to log in.')
    );
  }

  return response.json();
}

export async function register(
  email: string,
  password: string
): Promise<void> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(
      await readApiError(response, 'Unable to register the account.')
    );
  }
}

export async function logout(): Promise<void> {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, 'Unable to log out.'));
  }
}

// ── External Providers (Google OAuth) ──

export async function fetchExternalProviders(): Promise<
  ExternalAuthProvider[]
> {
  const response = await fetch('/api/auth/providers', {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(
      await readApiError(response, 'Unable to load external login providers.')
    );
  }

  return response.json();
}

export function getExternalLoginUrl(
  provider: string,
  returnUrl = '/admin/dashboard'
): string {
  const searchParams = new URLSearchParams({
    provider,
    returnUrl,
  });

  return `/api/auth/external-login?${searchParams}`;
}

// ── Two-Factor Authentication ──

export async function fetchTwoFactorStatus(): Promise<TwoFactorStatus> {
  const response = await fetch('/api/auth/manage/2fa', {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(
      await readApiError(response, 'Unable to load MFA status.')
    );
  }

  return response.json();
}

export async function setupTwoFactor(): Promise<TwoFactorSetup> {
  const response = await fetch('/api/auth/manage/2fa/setup', {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(
      await readApiError(response, 'Unable to set up MFA.')
    );
  }

  return response.json();
}

export async function verifyTwoFactor(
  code: string
): Promise<TwoFactorVerifyResult> {
  const response = await fetch('/api/auth/manage/2fa/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    throw new Error(
      await readApiError(response, 'Unable to verify MFA code.')
    );
  }

  return response.json();
}

export async function disableTwoFactor(): Promise<void> {
  const response = await fetch('/api/auth/manage/2fa/disable', {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(
      await readApiError(response, 'Unable to disable MFA.')
    );
  }
}
