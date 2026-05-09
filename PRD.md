ATLAS PERFORMANCE HUB
Product Requirements Document (PRD) | V-1.1.0
1. Executive Summary
Atlas is an elite SaaS platform engineered for professional high-performance coaches, sports scientists,
and dedicated athletes. Moving beyond basic calorie trackers, Atlas serves as a comprehensive system
for physiological engineering. The platform tracks advanced metrics such as volume load, biomechanical efficiency, and progressive overload, acting as a true "Operating System" for physique and
strength development.
2. Technical Architecture Foundation
Frontend: Next.js 14+ (App Router), TypeScript, Tailwind CSS, ShadCN UI.
State & Data: Zustand (Global UI), TanStack Query (Server State), React Hook Form + Zod.
Backend: Node.js / Express or Next.js Route Handlers (TypeScript).
Database: PostgreSQL via Prisma 5 (Optimized for Vercel Serverless deployments).
Authentication: Firebase Authentication (Seamless social logins and simpler state management).
AI Engine: Gemini 1.5 Pro API (Structured JSON output, Streaming).
3. Core AI Integration (The 4 Pillars)
3.1 AI Progressive Overload Architect
A sophisticated logic engine that analyzes past performance to auto-generate optimal weights and rep
ranges for the next micro-cycle. For instance, if the core objective is maximizing raw strength and muscle
density, the AI intelligently recalibrates volume across a heavy 4-day split, ensuring optimal central
nervous system recovery between intense sessions.
3.2 AI Bio-metric Data Analyzer
Processes weekly check-in parameters (body weight fluctuations, sleep quality scores, resting heart rate,
and subjective stress). The Gemini API returns a structured JSON "Fatigue Score" and mitigation
recommendations (e.g., suggesting a deload week or caloric adjustments).
3.3 AI Form & Posture Diagnostics (Vision)
Utilizes advanced image classification capabilities. Users or coaches upload video frames of compound
lifts. The AI analyzes biomechanical alignment (e.g., hip hinge depth, bar path) and provides precise
structural feedback to optimize lift mechanics.
3.4 AI Coaching Concierge (RAG Chatbot)
A highly context-aware assistant embedded directly into the dashboard. Trained strictly on the coach’s
proprietary methodology, it can answer athlete inquiries (e.g., "What is the best alternative to a barbell
row today?") based on their specific program.
4. Core Pages & UI Navigation
Landing Page (Public): High-contrast, premium aesthetic. Features interactive charts, a preview of
the AI Overload Architect, transparent pricing, and professional testimonials.
Role-Based Dashboard (Auth): Separate views for Admin (Platform Manager), Coach (Pro User),
and Athlete (Client).
Coach View: Roster overview, client compliance metrics, and aggregate fatigue indicators using
dynamic charts (Recharts).
Athlete View: Active 4-day split interface, historical lift data, form-check upload center, and biometric
logging forms.
Items Details Page: Deep-dive into specific exercises. Includes anatomical targets, video references,
and personal historical performance logs.
Explore/Directory: Debounced search for finding verified coaches or exploring public programs, with
multi-field filtering (e.g., methodology, equipment availability).
5. Database Schema Blueprint (Prisma 5)
To support this architecture and Firebase Auth, the data layer must be highly relational. A brief overview
of the core Prisma 5 models:
model User { id String @id // Maps directly to Firebase Auth UID role Role
@default(ATHLETE) email String @unique profile Profile? workouts Workout[] coachId String?
} model Workout { id String @id @default(uuid()) athleteId String date DateTime focus
String // e.g., "Hypertrophy/Density" exercises WorkoutExercise[] } // Further models:
Exercise, SetLog, Biometrics, AI_Insight
•
•
•
•
•
•
6. Implementation Roadmap
Phase Objective Key Deliverables
Phase
1
Foundation &
Auth
Next.js scaffolding, Prisma 5 Schema deployment, Firebase Auth setup, Global
CSS/Tailwind configuration.
Phase
2
Core App Logic
Dashboard layout, Zod form validation, TanStack Query integration, workout
logging CRUD.
Phase
3
AI Injection
Gemini API endpoints, RAG document pipeline for Concierge, Vision
integration for Form Diagnostics.
Phase
4
Polish &
Production
Redis rate limiting, Winston logging, full Vercel deployment (optimized via
Prisma 5).