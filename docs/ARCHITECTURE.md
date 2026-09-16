# TechIndustry — System Architecture & Design Patterns

Comprehensive architectural documentation for the TechIndustry interactive IT learning platform and LMS.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../LICENSE)
[![Architecture: Layered MVC](https://img.shields.io/badge/Architecture-Layered_MVC-blue.svg)](ARCHITECTURE.md)

---

## 1. High-Level System Architecture

TechIndustry is architected as a modular, high-performance **Layered MVC Monolith** built on **Node.js (Express 5)**, **PostgreSQL (Sequelize ORM)**, and **Handlebars SSR**.

```
                                 ┌─────────────────────────┐
                                 │     Client Browser      │
                                 │ (HTML / CSS / JS / PWA) │
                                 └────────────┬────────────┘
                                              │ HTTP / HTTPS
                                              ▼
                    ┌──────────────────────────────────────────────────┐
                    │            Security & Defense Pipeline           │
                    │   - Helmet (Content Security Policy & HSTS)      │
                    │   - Rate Limiters (Tiered Token-Bucket)          │
                    │   - CSURF (Double-Submit CSRF Cookie Armor)      │
                    │   - Mongo Sanitize & HPP (Injection Shield)      │
                    │   - Compression (Adaptive Gzip Pipeline)         │
                    └─────────────────────────┬────────────────────────┘
                                              │
                    ┌─────────────────────────▼────────────────────────┐
                    │               Express 5 Dispatcher               │
                    └─────────────┬──────────────────────┬─────────────┘
                                  │                      │
                   ┌──────────────▼─────┐      ┌─────────▼────────────┐
                   │    Page Routes     │      │      API Routes      │
                   │    (SSR Engine)    │      │   (JSON Endpoints)   │
                   └──────────────┬─────┘      └─────────┬────────────┘
                                  │                      │
                   ┌──────────────▼──────────────────────▼────────────┐
                   │                Controllers Layer                 │
                   │  (Request parsing, DTO mapping, View delegation) │
                   └──────────────────────┬───────────────────────────┘
                                          │
                   ┌──────────────────────▼───────────────────────────┐
                   │             Domain Business Services             │
                   │  - GamificationService   - AIService (Groq)      │
                   │  - ProgressService       - CertificateService    │
                   │  - ShopService           - UserService           │
                   │  - CourseService         - AuthService           │
                   └──────────────┬──────────────────────┬────────────┘
                                  │                      │
           ┌──────────────────────▼─────┐      ┌─────────▼────────────┐
           │    Sequelize ORM Models    │      │ External Services &  │
           │  (Entity graphs, Cascades, │      │ Cloud Integrations   │
           │   Row locks, Transactions) │      │  - Groq LLaMA 3.3 AI │
           └──────────────┬─────────────┘      │  - Google OAuth 2.0  │
                          │ SQL                │  - SMTP Nodemailer   │
           ┌──────────────▼─────────────┐      │  - PDFKit Renderer   │
           │    PostgreSQL Database     │      └──────────────────────┘
           └────────────────────────────┘
```

---

## 2. Architectural Layers & Separation of Concerns

The codebase enforces strict modularity with clear separation between concerns across `src/`:

```
src/
├── config/         # System constants, database connection pool, rate limiting tiers, seeders
├── controllers/    # HTTP orchestration: Request validation, DTO extraction, response delivery
├── helpers/        # Handlebars SSR view helpers, avatar frame decorators, formatting utilities
├── middleware/     # Auth verification, session validation, SEO injection, rate limiters
├── models/         # Sequelize entity models, relational foreign keys, schema hooks
├── routes/         # Endpoint mappings for Page SSR and REST API interfaces
├── services/       # Core business logic, mathematical formulas, transactions, integrations
└── views/          # Handlebars templates (layouts, views, and reusable partial components)
```

### Layer Responsibilities

1. **Routes Layer (`src/routes/`)**:
   - Maps URL endpoints and HTTP verbs to controller actions.
   - Attaches endpoint-specific middleware (auth guards, rate limiters, validation schemas).
   - Separates public pages, authenticated pages, and JSON API routes.

2. **Middleware Layer (`src/middleware/`)**:
   - **`auth.js`**: Verifies JWT authentication for REST API endpoints.
   - **`pageAuth.js`**: Protects SSR page routes and redirects unauthenticated guests to `/login`.
   - **`seoDefaults.js`**: Injects default meta tags, canonical links, and OpenGraph metadata into `res.locals`.

3. **Controllers Layer (`src/controllers/`)**:
   - Orchestrates HTTP request/response flow.
   - Handles parameter extraction, query sanitization, and error code translations.
   - Delegates heavy computations and persistence logic to domain services.

4. **Services Layer (`src/services/`)**:
   - Encapsulates all domain rules, business workflows, and external service calls.
   - Manages atomic transactions, XP calculations, and certificate verification.
   - Completely decoupled from the HTTP transport layer.

5. **Models Layer (`src/models/`)**:
   - Defines database tables, attributes, validations, and relational associations via Sequelize.
   - Implements cascade deletions and relational indexes for optimal query execution.

---

## 3. Security & Armor Pipeline

Security is applied in a multi-layered defensive posture before requests reach business logic:

```
Incoming Request
       │
       ▼
[1. Gzip Compression] ─────────► Skip if 'x-no-compression' header present
       │
       ▼
[2. Static Asset Caching] ─────► Long-lived Cache-Control headers (maxAge: 1y, ETag)
       │
       ▼
[3. Helmet Security] ──────────► Strict CSP, HSTS (31536000s), FrameGuard, ReferrerPolicy
       │
       ▼
[4. Rate Limiter (IP)] ────────► Tiered sliding-window buckets per endpoint category
       │
       ▼
[5. MongoSanitize & HPP] ──────► Strips prohibited characters and parameter pollutions
       │
       ▼
[6. Session & CSRF Armor] ─────► Double-submit cookie verification on all mutating verbs
       │
       ▼
[7. JWT & User Cache] ─────────► Decodes token, validates claims, checks session cache
       │
       ▼
Target Controller / Action
```

### Key Security Implementations:
- **Helmet Content Security Policy (CSP)**: Restricts script, style, font, and frame origins to authorized CDNs (`cdn.jsdelivr.net`, `cdnjs.cloudflare.com`, Google Fonts).
- **HTTP Strict Transport Security (HSTS)**: 1-year duration with subdomains and preload enabled.
- **Double-Submit CSRF Tokens (`csurf`)**: Enforced on all state-mutating requests (`POST`, `PUT`, `DELETE`, `PATCH`).
- **Tiered Rate Limiting**:
  - Global: 1000 req / 15 min.
  - Login / Auth: 5 attempts / 15 min.
  - Quiz Submissions: 10 submissions / 1 min.
  - AI Mentor: 10 messages / 5 min cooldown with burst filtering (max 5 req / 30s).
- **Input Sanitization**: Declarative sanitization using `express-validator` and `xss` library to prevent Stored & Reflected XSS.

---

## 4. Authentication, Session & Context Strategy

TechIndustry implements a hybrid stateless-stateful authentication strategy:

```
                       ┌──────────────────────┐
                       │  Client Credentials  │
                       └──────────┬───────────┘
                                  │
                   ┌──────────────┴──────────────┐
                   │                             │
                   ▼                             ▼
        [Local Email/Password]          [Google OAuth 2.0 SSO]
                   │                             │
                   ▼                             ▼
           Bcrypt Validation            OAuth Code Exchange
                   │                             │
                   └──────────────┬──────────────┘
                                  │
                                  ▼
                   Generate JWT (HMAC-SHA256)
                   Payload: { userId, username }
                                  │
                                  ▼
                   Set HTTP-Only Secure Cookie
                                  │
                                  ▼
             Fast-Path User Context Cache (60s TTL)
```

### Session User Context Caching
To eliminate redundant database queries on repeated page navigations:
- When a valid JWT token is verified, the user's profile context is stored in `req.session.userContextCache` with a 60-second TTL.
- Subsequent requests within the TTL retrieve the cached user context instantly.
- Any profile mutation, password change, avatar upload, or cosmetic equip action immediately calls `invalidateUserContextCache(req)` to force an instant cache refresh.

---

## 5. Gamification & Atomic Economy Architecture

The gamification engine governs player progression, XP allocation, level thresholds, and virtual coin transactions:

```
Action Triggered (Lesson Complete / Quiz Passed / Course Finished)
                             │
                             ▼
              ┌──────────────────────────────┐
              │     GamificationService      │
              └──────────────┬───────────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
   [Experience & Leveling]       [Atomic Coin Transaction]
   - Calculate XP gain           - Open Sequelize Transaction
   - Map to LEVEL_THRESHOLDS     - Acquire Row Lock (LOCK.UPDATE)
   - Detect Level-Up threshold   - Update UserLevel.coins
   - Trigger Badge Listeners     - Insert CoinTransaction Audit Record
   - Update UserLevel entity     - Commit Transaction
```

### 1. Deterministic Level Thresholds
- Levels scale across 100+ defined XP milestones (from Level 1 to Level 1000+).
- The `calculateLevel(experience)` algorithm performs deterministic threshold binary/range checks to ensure predictable mathematical progression.

### 2. Transactional Coin Consistency
- All coin grants and shop purchases run within **isolated Sequelize transactions** with row-level locks (`LOCK.UPDATE`) on `UserLevel`.
- Every coin movement generates an immutable `CoinTransaction` record capturing `amount`, `transaction_type`, `reference_id`, `description`, and `balance_after`.

### 3. Automated Badge Distribution
- Milestone badges (`level_1`, `level_5`, `level_10`, `first_course`, `course_3`, `course_5`, `perfect_quiz`) are automatically evaluated and appended to the user's `badges` array.

---

## 6. AI Mentor & Topic-Restricted Guardrails

The built-in AI tutor utilizes Groq's low-latency inference engine (`llama-3.3-70b-versatile`) protected by defensive guardrails:

```
User Prompt
     │
     ▼
[Anti-Spam & Burst Filter] ────► Verify length, duplicate counts, minimum intervals (2s)
     │
     ▼
[Regex Jailbreak Detector] ────► Reject prompts matching blocked patterns (prompts, bypasses)
     │
     ▼
[System Prompt Boundary] ──────► Force identity: TechIndustry IT Assistant, max 4 sentences
     │
     ▼
[Groq Cloud API] ──────────────► Inference using llama-3.3-70b-versatile (temperature: 0.3)
     │
     ▼
Structured JSON Response
```

### Safety Rules:
- **Jailbreak Detection**: Regular expression filters intercept bypass phrases (`"ignore previous instructions"`, `"developer mode"`, `"incognito mode"`).
- **Scope Restriction**: Non-IT or off-topic prompts receive a polite, standardized refusal encouraging the user to reframe their question within technology topics.
- **Quota Enforcer**: Session-tracked limits grant 10 prompts per 5-minute cooldown window with strict penalty escalations for violations.

---

## 7. Dynamic PDF Certificate Engine

Verifiable course completion certificates are dynamically rendered in-memory using **PDFKit**:

```
Client Requests Certificate Download
                  │
                  ▼
[Verify Course Completion] ────► Checks UserProgress (status === 'completed' & 100% lessons)
                  │
                  ▼
[Fetch Course & User Metadata] ─► Retrieves User full name, Course title, completion date
                  │
                  ▼
[PDFKit Vector Drawing Engine]
  - Vector borders, branding badges, decorative geometry
  - Embed custom Inter Regular & Bold typography
  - Calculate dynamic text metrics for balanced centering
  - Render verification metadata & certificate serial
                  │
                  ▼
[Stream Buffer to Response] ───► Content-Type: application/pdf; Content-Disposition: inline
```

---

## 8. Relational Data Model & Schema Associations

The database schema is modeled in PostgreSQL using Sequelize ORM:

```
 ┌──────────────┐          1:1          ┌──────────────┐
 │   Customer   │◄─────────────────────►│     User     │
 └──────────────┘                       └──────┬───────┘
                                               │
               ┌───────────────────────────────┼──────────────────────────────┐
               │ 1:N                           │ 1:1                          │ 1:N
               ▼                               ▼                              ▼
     ┌──────────────────┐            ┌──────────────────┐           ┌──────────────────┐
     │   UserProgress   │            │    UserLevel     │           │   UserPurchase   │
     └─────────┬────────┘            └──────────────────┘           └─────────┬────────┘
               │ N:1                                                          │ N:1
               ▼                                                              ▼
     ┌──────────────────┐                                           ┌──────────────────┐
     │      Course      │                                           │     ShopItem     │
     └─────────┬────────┘                                           └─────────┬────────┘
               │ 1:N                                                          │ N:1
               ▼                                                              ▼
     ┌──────────────────┐                                           ┌──────────────────┐
     │      Module      │                                           │   ShopCategory   │
     └─────────┬────────┘                                           └──────────────────┘
               │ 1:N
               ▼
     ┌──────────────────┐
     │      Lesson      │
     └──────────────────┘
```

### Relational Entity Roles:
- **`Customer` & `User`**: Customer holds personal identification details (name, email, phone), while User encapsulates authentication, credentials, and role state.
- **`Course` → `Module` → `Lesson`**: Hierarchical content structure with cascading deletions.
- **`UserProgress`**: Tracks completed lessons array, completed quizzes array, course status, and timestamps.
- **`UserLevel` & `CoinTransaction`**: Manages XP, calculated level, unlocked badges array, coin balance, and complete transaction histories.
- **`ShopCategory` → `ShopItem` → `UserPurchase`**: In-app marketplace items, cosmetic types (`avatar_frame`, `title_badge`, `profile_theme`), pricing, ownership records, and equipped states.
