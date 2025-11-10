# Privacy Notice and Consent (GDPR/PDPA)

This service processes personal data to provide a university-company job platform. This document explains what we collect, why, and how you can exercise your rights. It also contains a standard consent text you can present to users (web/app) and instructions for storing consent.

## Data Controller
- Kasetsart University (or your organization operating the platform)
- Contact: privacy@your-org.example (replace)

## What we collect
- Account data: first_name, last_name, email, user_name, role, profile_image
- Student data: stdId
- Company data: company_name, company profile fields
- Professor data: profile (faculty, department), posts and comments
- Authentication data: password hash (bcrypt) or Google OAuth ID
- Application data: resumes uploaded to S3 (keys only), job applications
- System data: tokens (JWT), cookies (refresh token), logs (minimal)

## Purposes and legal bases
- Provide core service functions: sign-up, login, profiles, job postings and applications (Contract/Legitimate Interest)
- Email notifications about account/job activity (Legitimate Interest/Consent where required)
- AI-assisted account verification for fraud prevention (Legitimate Interest/Consent if required by policy)

## Retention
- Account records: while the account is active, then deleted or anonymized within 90 days.
- Logs: 30–90 days (configurable).
- Resumes/attachments in S3: retained while account is active or until deleted by user.

## Data sharing
- Cloud providers (S3) for file storage.
- Email service provider.
- No sale of data.

## International transfers
- S3 region and email provider region may be outside your country. We use standard contractual clauses or equivalent safeguards.

## Your rights (GDPR/PDPA)
- Access, rectification, deletion, portability of your data
- Object or restrict processing
- Withdraw consent at any time (does not affect prior lawful processing)

## Security
- Passwords hashed (bcrypt)
- JWT access (15m) and refresh (7d) tokens
- Role-based access control and verified status checks
- ORM (Prisma) to reduce SQL injection risk
- CORS configured by environment for allowed origins

## Cookie usage
- HTTP-only cookie for refresh_token (no third-party tracking cookies)

---

# Consent Text (UI)

Title: Privacy Notice and Consent

We collect and process your personal data to operate this platform, including your name, email, role, and profile details. We store resume files in cloud storage. We also use AI to assist with account verification for fraud prevention. For full details, please read our Privacy Notice.

By selecting “I consent”, you consent to:
- Processing of your personal data to provide platform features
- Storing resume files in our cloud provider
- Contacting you via email for account and job-related notifications
- Optional: AI-assisted verification of your account

You may withdraw consent at any time in Settings. If you do not consent, we will still provide core services required to operate your account, but optional features may be disabled.

[ ] I consent to processing as described above

[ ] I consent to AI-assisted account verification (optional)

[Confirm]   [Cancel]

---

# Implementation Guide (Backend)

- Table/fields (example additions):
  - user_consent: { id, user_id, consent_processing: boolean, consent_ai_verification: boolean, created_at, updated_at }
- Endpoints:
  - POST /api/privacy/consent { consent_processing, consent_ai_verification } → upsert by user_id
  - GET /api/privacy/consent → return current user selections
- Middleware gates (optional):
  - Before invoking AI verification, check consent_ai_verification; if false, skip AI and route to manual verification.

Status in current codebase: Not yet implemented. This document provides wording and a minimal schema/endpoint plan. Add migrations and wire routes when ready.
