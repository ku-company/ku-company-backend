# Security Report (Requirements → Design → Implementation)

This report inventories current security controls, gaps, and a prioritized plan across OWASP ASVS, threat modeling, and testing. It maps what exists in the codebase today and what remains to be done.

Last updated: 2025-11-11 (post-hardening updates)

## Scope at a glance
- Stack: Node.js (ESM), Express 5, Prisma (Postgres), JWT auth, Google OAuth (passport), AWS S3 for files
- Key modules: jwtMiddleware, rolebasedMiddleware, verifiedMiddleware, errorHandler

---

## OWASP ASVS checklist (selected controls)

Status: ✓ implemented, △ partial, · planned

- V2 Authentication
  - ✓ Passwords hashed with bcrypt (helper/signupStrategy.ts)
  - ✓ JWT access (15m) + refresh (7d) with rotation via /api/user/refresh-token
  - ✓ OAuth (Google) flow with callback and cookie set (router/authRoutes.ts)
  - △ MFA / email verification: not implemented yet (planned)
- V3 Session Management
  - ✓ HTTP-only refresh token cookie set
  - △ Invalidate/rotate on role update and logout: partial (refresh token cookie cleared on logout; no server-side revocation store)
- V4 Access Control
  - ✓ Role-based middleware and verifiedMiddleware on protected routes
  - △ Resource-level checks: present where needed; continue to audit
- V5 Validation, Sanitization and Encoding
  - △ express-validator used in some routes (router/company/profileRoutes.ts); validator used for emails.
  - ✓ Prisma ORM reduces SQL injection risk by parameterization
  - ✓ Output encoding + truncation for AI prompt dynamic fields (encodeForJSString, truncateSafe)
  - · Add systematic input validation for all controllers
- V7 Error Handling and Logging
  - ✓ Central errorHandler middleware
  - △ Logging uses console.log; · adopt structured logger (pino/winston) with PII scrubbing
- V8 Data Protection
  - ✓ Secrets from env (SECRET_KEY, REFRESH_KEY, MAIL_*, S3 keys)
  - · At-rest encryption for sensitive fields (if any beyond hashes) – not applicable today; rely on DB and cloud provider
- V9 Communications
  - ✓ CORS configured with explicit origin from env (index.ts); credentials enabled
  - ✓ Helmet security headers applied
  - · Enforce HSTS via reverse proxy (production)
- V10 Malicious Code and Config
  - ✓ Dependencies pinned; tests mock jsonwebtoken; dotenv used
  - · Add automated dependency and secret scanning in CI
- V13 API and Web Service
  - ✓ Authentication and RBAC on APIs; clear route exemptions in jwtMiddleware

---

## Threat model (STRIDE, summarized)

- Authentication (JWT, OAuth)
  - Spoofing: stolen refresh cookies → Mitigation: httpOnly, short access TTL, rotate on refresh, · consider SameSite=strict, token blacklist on logout/breach
  - Elevation of privilege: role tampering → Mitigation: role-based checks server-side, verifiedMiddleware
- Authorization/Access Control
  - Tampering: accessing other users’ data → Mitigation: route-level role/verified checks; · add resource ownership checks where missing
- Input validation
  - Injection (SQL/ORM): Prisma reduces risk; · add validation and length/format constraints everywhere
- File uploads (S3)
  - Malware or oversized uploads → Mitigation: file-type validation, size limits, S3 presigned
  - SVG scriptable content → Mitigation: image/svg+xml blocked unless future sanitizer added
- AI verification
  - Information disclosure → Mitigation: minimal fields, gated behind explicit consent
  - Integrity: JSON5 parsing + fenced code removal; dynamic values encoded + truncated
- OAuth callback
  - CSRF/state tampering → Mitigation: passport handles state; · confirm state nonce validation and tighten scopes

Priorities
- P0: AuthZ resource ownership checks; rate limit login and sensitive APIs; helmet and HSTS; comprehensive input validation in controllers
- P1: MFA/email verification; consent gating for AI verification; structured logging; dependency/secret scanning
- P2: Token revocation list; compromised password checks; API scopes

---

## Security design principles mapping

- Least privilege: role-based and verified checks applied to routes
- Fail-safe defaults: jwtMiddleware excludes only explicit public paths
- Economy of mechanism: Prisma ORM; centralized error handler
- Complete mediation: middleware stack authenticates most routes; · expand per-resource checks
- Defense in depth: JWT + role/verified + controller-level validations
- Secure by default: HTTP-only refresh cookie; CORS restricts to configured origin
- Privacy by design: plan to store explicit consent; process minimal data in external AI calls

---

## Implementation and testing status

- Authentication
  - Implemented: bcrypt password hashing; JWT with expiry; Google OAuth; refresh flow
  - Gaps: MFA/email verification; token revocation
- Authorization & Access Control
  - Implemented: rolebasedMiddleware, verifiedMiddleware
  - Gaps: deeper object-level authorization checks – audit per controller
- Input validation and injection protection
  - Implemented: Prisma; some express-validator; email validator
  - Gaps: apply rigorous validation across all request bodies/params; sanitize/escape as needed
- Environment variables and credentials
  - Implemented: dotenv; runtime checks for SECRET_KEY/REFRESH_KEY; S3/Mail via env
  - Gaps: add CI secret scanning and missing-var fail-fast on startup
- Error handling
  - Implemented: centralized errorHandler
  - Gaps: unify error shapes and avoid leaking stack traces in production
- Logging
  - Implemented: basic console logs
  - Gaps: structured logging, correlation IDs, PII scrubbing, log retention policy
- HTTP security headers
  - Implemented: none specific
  - Gaps: add helmet (HSTS, noSniff, frameguard, xssFilter), secure cookies SameSite
- SAST/DAST
  - Plan:
    - SAST: enable GitHub Advanced Security or SonarQube. Store report under reports/sast/*.md
    - DAST: run OWASP ZAP Baseline against dev server. Store under reports/dast/*.md

---

## Advanced security features (pick 4)

- Social login (OAuth/OpenID): Implemented (Google OAuth)
- JWT expiration checking and management: Implemented (15m access, 7d refresh, refresh endpoint)
- CORS properly set: Implemented (origin from env, not *)
- Rate limit for login attempts: Implemented (custom in-memory limiter on /login and /refresh-token)
- Rate limit for AI verification endpoint: Implemented
- MFA (email/OTP verification): Planned (P1)
- Authorization with scope: Planned (P2; add scopes in JWT claims and middleware)
- Login timeout: Implemented via access token expiry (15m)
- Compromised password checks: Planned (Pwned Passwords API, on signup/password change)

---

## Mapping to threat model (checklist)

- AuthZ resource ownership checks: · Planned
- Login rate limit: ✓ Implemented (P0)
- Helmet security headers: ✓ Implemented (P0)
- Comprehensive input validation: △ Partial (P0 to complete)
- MFA/email verification: · Planned (P1)
- Consent gating for AI verification: ✓ Implemented (P1)
- Structured logging: · Planned (P1)
- Dependency/secret scanning: ✓ Implemented baseline (npm script audit:ci); CI integration recommended
- Token revocation/blacklist: · Planned (P2)
- Compromised password check: · Planned (P2)
- OAuth state validation review: · Planned (P2)

---

## How to run SAST and DAST (guidance)

- SAST (GitHub):
  - Enable Code scanning alerts in GitHub Security → set up CodeQL workflow
  - Or integrate SonarCloud: add sonar-project.properties and GitHub Action
- DAST (OWASP ZAP Baseline):
  - Run against a running dev server URL
  - Save HTML/MD report under reports/dast/

---

## Next steps (actionable)

1) Add helmet and secure cookie settings; enforce HTTPS at the proxy (P0)
2) Add rate limiting to /api/user/login and /api/user/refresh-token (P0) – Implemented
3) Expand express-validator across controllers; centralize validation error handling (P0)
4) Implement consent storage and gate AI verification by consent; add privacy routes (P1)
5) Add MFA (email verification OTP) at signup / role update (P1)
6) Introduce structured logging (pino) and mask sensitive fields (P1)
7) Enable dependency and secret scanning in CI, and schedule audits (P1) – Baseline audit script added (audit:ci)
8) Consider token revocation list and scope-based authorization for fine-grained access (P2)
