# msmtp Mailprovider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add real invite-mail delivery through the server/container sendmail interface backed by msmtp.

**Architecture:** Keep DigiPlein's mail boundary in `lib/mail/staff-invite.ts`. `noop` remains the safe default; `smtp` writes a plain-text RFC822 message to a sendmail-compatible command. Environment validation lives in `lib/env.ts`.

**Tech Stack:** Next.js server actions, Node `child_process`, Zod env validation, Vitest.

---

## Files

- Modify: `lib/env.ts` and `__tests__/lib/env.test.ts` for mail env validation.
- Modify: `lib/mail/staff-invite.ts` and `__tests__/lib/staff-invite-mail.test.ts` for sendmail transport.
- Modify: `.env.example` for deployment configuration.

## Tasks

- [x] Add failing env tests proving `MAIL_FROM` is required for `MAIL_TRANSPORT=smtp` and optional for `noop`.
- [x] Implement `MAIL_FROM`, `MAIL_FROM_NAME`, and `MAIL_SENDMAIL_PATH` in `envSchema`.
- [x] Add failing mail tests for smtp success, smtp failure, header injection rejection, and sanitized logging.
- [x] Implement sendmail transport with injectable runner for tests.
- [x] Update `.env.example` with msmtp/sendmail settings.
- [x] Run targeted tests.
- [x] Run `npm run verify`.
- [x] Run `npm run build`.
- [x] Commit the implementation.

## Verification

```bash
npm test -- __tests__/lib/env.test.ts __tests__/lib/staff-invite-mail.test.ts
npm run verify
npm run build
```

Manual Docker check after deployment:

```bash
docker exec -it <app-container> sh -lc 'printenv MAIL_TRANSPORT MAIL_FROM MAIL_SENDMAIL_PATH APP_BASE_URL'
docker exec -it <app-container> sh -lc 'test -x "${MAIL_SENDMAIL_PATH:-/usr/sbin/sendmail}" && echo sendmail-ok'
docker logs --since 1h <app-container> 2>&1 | grep -F '[mail] staff invite accepted by smtp transport'
```
