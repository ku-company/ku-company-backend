# Open Design Controls Compliance

Date: 2025-11-11

This document maps the "Open Design" requirements to concrete controls in the codebase and deployment guidance.

## Standard Cryptography (V11.3.1, V11.3.2, V11.4.1)
- Password hashing: bcrypt (approved password hashing function) in `helper/signupStrategy.ts`, `service/userService.ts`.
- JWT: HS256 (HMAC-SHA-256) for token MAC/signature in `service/userService.ts` and enforced in `middlewares/jwtMiddleware.ts`.
- File storage: AWS S3 Server-Side Encryption (SSE-S3 AES-256) enabled for uploads in `service/s3Services.ts`.
- No custom block cipher usage in application code; crypto kept simple and standard.

Note: If you need application-layer encryption for specific fields, prefer AES-GCM via a vetted library and manage keys via KMS; none is currently required.

## Standard Protocols (V12.1.1, V12.2.1, V12.2.2)
- HTTPS redirect: enable by setting `FORCE_HTTPS=enabled` (index.ts).
- HSTS: `Strict-Transport-Security` with max-age ≥ 1 year is set automatically on HTTPS requests.
- TLS versions and certificates: configure at your reverse proxy/load balancer to allow only TLS 1.2 and 1.3 with publicly trusted certificates (infrastructure setting).

## Standard Token Validation (V9.1.1)
- Self-contained JWTs validated using HMAC signatures.
- Algorithms allowlisted to `HS256` only; tokens with `alg=none` are rejected. See `middlewares/jwtMiddleware.ts` and tests under `tests/security/jwt.security.test.ts`.

## Standard Session Management (V7.2.4)
- New tokens issued on login; refresh rotation revokes old tokens.
- Logout revokes presented refresh token and clears cookies.
- Single-session default: issuing a new refresh token revokes all previous sessions for that user.
- Cookies are `HttpOnly`, `SameSite=Strict`, and `Secure` in secure environments. Prefixed cookies (`__Host-`/`__Secure-`) supported via `COOKIE_PREFIX_MODE`.

## Standard Security Headers (V3.4.1)
- `Strict-Transport-Security` (≥ 1 year, includeSubDomains) set on HTTPS requests.
- Additional headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`.

## Standard Password Policies (V6.2.1, V6.2.4)
- Minimum password length 8–15 characters enforced.
- Common password blacklist check integrated via `utils/passwordBlacklist.ts`.
- For top-3000 coverage, set `COMMON_PASSWORDS_FILE` to a newline-separated list file; the app will load it at startup to extend the denylist.

## Operations Checklist (Deployment)
- Enforce TLS 1.2/1.3 only at the proxy/ingress.
- Set `FORCE_HTTPS=enabled` to redirect HTTP→HTTPS and emit HSTS on secure requests.
- Provide `COMMON_PASSWORDS_FILE` with top common passwords to strengthen password checks.
- Set `COOKIE_PREFIX_MODE=host` (recommended) in production for `__Host-` cookie prefixes.
