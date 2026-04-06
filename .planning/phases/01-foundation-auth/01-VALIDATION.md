---
phase: 1
slug: foundation-auth
status: accepted-tradeoff
nyquist_compliant: false
wave_0_complete: false
tradeoff_note: "4-day deadline. Compile checks (dotnet build, tsc --noEmit) at every task + human-verify checkpoint at end. Behavioral tests deferred to Phase 6 polish."
created: 2026-04-06
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | dotnet test (xUnit) for backend, vitest for frontend |
| **Config file** | backend: tests/*.csproj, frontend: vitest.config.ts |
| **Quick run command** | `dotnet test --filter "Category=Unit" && cd frontend && npx vitest run` |
| **Full suite command** | `dotnet test && cd frontend && npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick command
- **After every plan wave:** Run full suite
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | DATA-01 | integration | `dotnet test --filter "Database"` | W0 | pending |
| 01-01-02 | 01 | 1 | DATA-02 | integration | `dotnet test --filter "Seeding"` | W0 | pending |
| 01-01-03 | 01 | 1 | DATA-03 | integration | `dotnet test --filter "Indexes"` | W0 | pending |
| 01-02-01 | 02 | 1 | AUTH-01 | integration | `dotnet test --filter "Registration"` | W0 | pending |
| 01-02-02 | 02 | 1 | AUTH-02 | integration | `dotnet test --filter "Login"` | W0 | pending |
| 01-02-03 | 02 | 1 | AUTH-03 | manual | Google OAuth redirect | N/A | pending |
| 01-02-04 | 02 | 1 | AUTH-04 | manual | MFA setup flow | N/A | pending |
| 01-02-05 | 02 | 2 | AUTH-05..09 | integration | `dotnet test --filter "Authorization"` | W0 | pending |
| 01-02-06 | 02 | 2 | AUTH-10 | integration | `dotnet test --filter "TestAccounts"` | W0 | pending |
| 01-03-01 | 03 | 1 | SEC-01 | manual | HTTPS redirect check | N/A | pending |
| 01-03-02 | 03 | 1 | SEC-02 | integration | `curl -s -D- url | grep Content-Security-Policy` | W0 | pending |
| 01-03-03 | 03 | 1 | SEC-03 | integration | `curl -s -D- url | grep Strict-Transport-Security` | W0 | pending |
| 01-03-04 | 03 | 1 | SEC-06 | grep | `grep -r "password\|secret\|connectionstring" src/ --include="*.cs" --include="*.ts"` | N/A | pending |

---

## Wave 0 Requirements

- [ ] Backend test project with xUnit + EF Core InMemory or TestContainers
- [ ] Frontend vitest config with React Testing Library
- [ ] Test fixtures for database context and auth helpers

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Google OAuth login | AUTH-03 | Requires browser redirect to Google | Open app, click "Sign in with Google", verify redirect and callback |
| MFA setup | AUTH-04 | Requires authenticator app interaction | Enable MFA, scan QR code, enter TOTP code |
| HTTPS certificate | SEC-01 | Requires deployed environment | Open browser dev tools > Security tab > verify valid certificate |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
