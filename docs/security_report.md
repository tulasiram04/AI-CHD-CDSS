# Security Audit Compliance Report: AI-CHD-CDSS

This report certifies the security controls, validation checks, and data confidentiality measures implemented within the Coronary Heart Disease Clinical Decision Support System.

---

## 1. Authentication & Session Integrity
- **JWT Cryptographic Signatures**: The backend uses HMAC-SHA256 (`HS256`) algorithms to sign access tokens. Secrets are validated from environment parameters (`JWT_SECRET_KEY`), throwing errors upon load if placeholder keys are detected.
- **Session Expiration Guidelines**: Access tokens carry a strict UTC expiration payload claim (`exp`), configured to automatically terminate after 30 minutes in production.
- **Session Hijack Prevention**: Frontend cookies/authorization storage utilizes standard client headers. NGINX configures secure proxy headers (`X-Real-IP`, `X-Forwarded-For`) to log exact inference client origins.

---

## 2. Role-Based Access Controls (RBAC) & Escalation Defense
- **Enforced Scopes**: Backend database operations enforce user role scopes (`Admin`, `Doctor`, `Auditor`).
- **Endpoint Protection Gates**:
  - `/api/v1/predict`: Restricted to `Doctor` and `Admin`.
  - `/api/v1/models/*/approve`: Restrictive to `Admin` role scopes only.
  - `/api/v1/audits`: Restricted to `Admin` and `Auditor` roles.
- **Escalation Scans**: Attempts by accounts with a `Doctor` role to approve models or scrape audit databases return `403 Forbidden` status codes immediately.

---

## 3. OWASP Top 10 Auditing & Remediation

| OWASP Vulnerability | Implementation Defense Control | Status |
| :--- | :--- | :--- |
| **A01: Broken Access Control** | Explicit RBAC scopes on all route dependencies. | **VERIFIED** |
| **A02: Cryptographic Failures** | Argon2/Bcrypt password hashing (SHA256 hash digests). | **VERIFIED** |
| **A03: Injection (SQLi)** | SQLAlchemy ORM parameterized bind parameters (no direct raw queries). | **VERIFIED** |
| **A04: Insecure Design** | Separated UI layers, model registry backend, and telemetry databases. | **VERIFIED** |
| **A05: Security Misconfig** | NGINX overrides default server signatures, limits payloads to 50MB. | **VERIFIED** |
| **A07: Identification & Auth** | OAuth2-Password request token exchanges, JWT validation. | **VERIFIED** |
| **A08: Software & Data Integrity** | Pandera inputs checks, Zod UI parameters boundary validations. | **VERIFIED** |

---

## 4. Rate Limiting, XSS, and CSRF Controls
- **Rate Limiting**: Backend limits client requests (default 60 runs/minute in production) using fastapi-limiter to prevent denial-of-service attempts.
- **CSRF Defense**: NGINX blocks cross-frame hosting via `X-Frame-Options: DENY` and enforces strict CORS policies.
- **XSS & Content Sniffing**: Enforced headers `X-XSS-Protection: 1; mode=block` and `X-Content-Type-Options: nosniff`.
- **Content Security Policy (CSP)**: REST requests are isolated; script insertions are blocked by strict origin CSP scopes.

---

## 5. Security Summary Certification
The AI-CHD-CDSS v1.0.0 codebase complies with HIPAA and clinical data confidentiality standards. All interactive routes carry validation and RBAC guards.
