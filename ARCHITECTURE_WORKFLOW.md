# ATLAS PERFORMANCE HUB: Next-Gen AI Integration & Backend Workflow Strategy

**Document Version:** 1.0.0  
**Target Stack:** Node.js (TypeScript) Backend / Next.js 14+ App Router Frontend, Prisma 5 (PostgreSQL), Firebase Auth, Gemini 1.5 Pro AI Engine.

This document defines the elite standard operating procedure (SOP) and architectural workflow for the Atlas Performance Hub. It is designed to transcend standard CRUD patterns, ensuring enterprise-grade scalability, ironclad data integrity, and seamless AI execution.

---

## 1. The Core Development Loop: Standard Operating Procedure (SOP)

To maintain a pristine, modular codebase, every new backend feature must strictly adhere to the following layered architecture. No business logic shall reside in the routing layer.

- **Step 1: Domain Modeling & Zod Schemas:** Define the precise shape of the data entering and exiting the system using Zod. This acts as the absolute source of truth for the interface.
- **Step 2: Interface Definition (Types):** Extract TypeScript interfaces directly from Zod (`z.infer<typeof Schema>`) to guarantee 1:1 parity between runtime validation and compile-time strictness.
- **Step 3: The Service Layer (Business Logic):** Create isolated, pure service classes (e.g., `WorkoutService`). This layer executes Prisma database calls, orchestrates AI generation, and applies domain-specific business rules. Services must be entirely agnostic of HTTP/Express concepts.
- **Step 4: The Controller Layer:** Controllers act merely as orchestrators. They receive the HTTP request, pass the raw payload to the Zod validator, pass the validated DTO to the Service Layer, and handle standard HTTP status codes/error formatting.
- **Step 5: Route Binding & Middleware:** Map the Controller to an Express endpoint, wrapping it in a centralized error-catching middleware and a JWT authentication guard (Firebase Admin).

---

## 2. AI Integration Architecture: Orchestrating Gemini 1.5 Pro

The Atlas AI Engine acts as a co-processor alongside standard application logic. It is divided into synchronous streaming operations and asynchronous heavy-lifting.

- **Isolated AI Service Classes:** AI logic is decoupled from standard services. We will utilize distinct classes like `ProgressiveOverloadEngine`, `BiometricAnalyzer`, and `VisionDiagnosticsService`.
- **Handling Heavy Analysis (Background Workers):**
  - _The Problem:_ Analyzing 6 weeks of volume load or processing video frames for biomechanical diagnostics takes time and will trigger Serverless HTTP timeouts (e.g., Vercel's 10s-60s limit).
  - _The Solution:_ We will implement a **Redis-backed Worker Queue** (e.g., BullMQ). The frontend submits a payload (like a weekly check-in), the Controller drops a job in Redis and returns a `202 Accepted` with a `jobId`. A separate background worker processes the Gemini API call and writes the resulting JSON to the `AIInsight` table. The frontend polls or listens via WebSocket/SSE for job completion.
- **Streaming Responses (RAG Concierge):** For the "AI Coaching Concierge", latency is critical. We will utilize the `Stream` capabilities of the Gemini 1.5 Pro API. The backend will open a Server-Sent Events (SSE) connection or use Next.js Route Handlers to stream tokens directly into the user's dashboard for a real-time conversational experience.
- **Prompt Structuring:** All non-conversational AI outputs (like the _Fatigue Score_) must strictly use Gemini's `response_schema` or `response_mime_type: "application/json"` parameters to guarantee structural parity with our database models.

---

## 3. Data Integrity & Sync: Firebase Auth to Prisma

Decoupling authentication (Firebase) from the relational database (Prisma User table) introduces the risk of race conditions and orphaned records. We will solve this via an idempotent synchronization strategy.

- **The Race Condition:** A user signs up via Firebase client SDK. The client immediately tries to fetch their Profile from our backend before the backend knows they exist.
- **The Idempotent Sync Endpoint:**
  - Instead of relying exclusively on flaky Cloud Functions/Webhooks, the client application will securely call a `/api/auth/sync` endpoint immediately upon a successful Firebase login.
  - This endpoint verifies the Firebase JWT via `firebase-admin`, extracts the `uid`, `email`, and basic profile data.
  - We use a **Prisma `upsert`** operation on the `User` model using the Firebase `uid` as the primary key (`id`).
  - _Upsert Logic:_ If the user exists, return them. If they do not, create the `User` and initialize their empty `Profile` within a single Prisma interactive transaction.
- **Webhook Fallback:** As a secondary safety net, a Firebase Authentication trigger (EventArc) can ping an internal backend webhook to ensure users who register but drop connection immediately are still provisioned in the PostgreSQL database.

---

## 4. Scalability, Serverless & Edge Handling

Given the potential for high-frequency data logging (intra-workout set tracking) and Vercel/Serverless deployment targets, connection pooling and edge caching are paramount.

- **Prisma Connection Pooling:**
  - Serverless functions spin up and down constantly, which can easily exhaust the PostgreSQL connection limit.
  - _Strategy:_ We will implement **Prisma Accelerate** (or a managed PgBouncer at the database level). The `DATABASE_URL` will utilize a pooled connection string to ensure thousands of concurrent athletes can log sets without dropping database connections.
- **Redis Caching Strategy:**
  - Historical workout data and exercise definitions are read-heavy but mutate less frequently during a session.
  - We will cache active `Workout` objects and `Exercise` catalogs in **Redis**. When a user requests their current micro-cycle, the backend hits Redis first.
  - _Cache Invalidation:_ Upon finishing a workout or modifying a routine, the `WorkoutService` will flush the specific user's Redis cache block.
- **AI Rate Limiting (Protection):**
  - Gemini API calls represent our highest variable cost and latency vulnerability.
  - We will utilize `rate-limit-redis` middleware to strictly limit AI insight generation endpoints per `userId` to prevent abuse, applying secondary limits on Vision diagnostic requests.

---

## 5. Security & Validation Strictness

The backend operates on a "Zero Trust" policy for incoming payloads, ensuring our relational data remains pristine.

- **The Validation Pipeline:**
  1.  **Auth Guard:** First middleware verifies the Firebase Bearer token and attaches the decoded `uid` to the `req.user` object.
  2.  **Schema Enforcement:** The second middleware acts as a gatekeeper using `zod`. Any payload missing required fields, possessing incorrect types (e.g., passing a string for `weight`), or injecting unexpected properties is instantly rejected with a `400 Bad Request` and detailed error map.
  3.  **Sanitized Propagation:** The Controller only accesses `req.validatedBody`. It never reads raw `req.body`.
- **Role-Based Access Control (RBAC):**
  - The `Role` enum (ADMIN, COACH, ATHLETE) dictates boundary logic.
  - Services enforce multi-tenant isolation by always scoping Prisma queries with `where: { athleteId: req.user.uid }` (or validating that a Coach's ID maps to the Athlete's `coachId`).
- **Soft Deletion Execution:**
  - Due to the implementation of `deletedAt`, all standard `findMany` and `findUnique` operations in the Service layer will automatically append `deletedAt: null`. This preserves invaluable historical training data for the AI Overload Architect while keeping the user's dashboard uncluttered.
