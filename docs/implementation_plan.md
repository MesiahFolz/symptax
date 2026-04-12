# SympTax Implementation Plan

SympTax is a digital health record and communication platform aimed at clarity, accessibility, and offline capability. It supports role-based functionality (Patients and Doctors), prescriptions, offline data access (via PWA and local caching), messaging, and a non-diagnostic AI Chatbot.

## User Review Required

> [!IMPORTANT]
> Since this is a very comprehensive project, I am proposing an iterative execution plan. Please review the architecture, schemas, and UI stack choices below. Once approved, I will begin initializing the code and generating the structured components directly in this workspace.

> [!WARNING]
> You mentioned compiling into an Android APK (mobile). The most straightforward approach for a Next.js App Router application that acts as a PWA is to use **PWABuilder** to convert the Progressive Web App into an APK (Trusted Web Activity). This avoids managing two completely separate codebases (e.g., Next.js vs React Native/Expo) while still providing a native-like experience. Is this approach acceptable, or do you strictly require a separate React Native/Expo repository?

## Proposed Execution Phases

### Phase 1: Foundation
1. Initialize a Next.js App Router project with Tailwind CSS and TypeScript.
2. Setup Prisma ORM with SQLite for local development (can easily be switched to PostgreSQL for Vercel deployment later).
3. Initialize NextAuth for JWT-based session handling.
4. Setup `shadcn/ui` components (buttons, inputs, cards, dialogs, etc.).

### Phase 2: Database Schema & API
1. Implement User, Prescription, Message, and Profile tables in Prisma.
2. Develop Next.js API Routes for:
   - Authentication
   - Prescriptions (CRUD, view by patient)
   - Messaging
   - AI Chat (Mock integration for general advice)

### Phase 3: UI & Core Features
1. Build Authentication forms (Login/Register).
2. Build Patient Dashboard (View prescriptions, profile, message doctor).
3. Build Doctor Dashboard (Upload notes, manage patients, respond to messages).
4. Implement AI Chatbot UI with appropriate non-diagnostic disclaimers.

### Phase 4: PWA / Offline Capability
1. Integrate `next-pwa` for service worker generation and caching.
2. Ensure critical assets and recently viewed prescriptions are cached locally.

## Architecture

**Frontend:** Next.js App Router, Tailwind CSS, shadcn/ui.
**Backend:** Next.js Server Actions & API Routes, NextAuth.js.
**Database:** Prisma ORM with PostgreSQL.
**Hosting/Web:** Vercel.
**Mobile:** PWA compilation to APK via PWABuilder (or Expo if requested).

## Database Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String         @id @default(uuid())
  email         String         @unique
  password      String
  name          String
  role          Role           @default(PATIENT)
  prescriptions Prescription[] @relation("PatientPrescriptions")
  messagesSent  Message[]      @relation("MessageSender")
  messagesRecv  Message[]      @relation("MessageReceiver")
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

enum Role {
  PATIENT
  DOCTOR
  ADMIN
}

model Prescription {
  id        String   @id @default(uuid())
  title     String
  content   String?  // Text notes
  fileUrl   String?  // Link to PDF/Image
  patientId String
  patient   User     @relation("PatientPrescriptions", fields: [patientId], references: [id])
  createdAt DateTime @default(now())
}

model Message {
  id         String   @id @default(uuid())
  content    String
  senderId   String
  receiverId String
  sender     User     @relation("MessageSender", fields: [senderId], references: [id])
  receiver   User     @relation("MessageReceiver", fields: [receiverId], references: [id])
  createdAt  DateTime @default(now())
}
```

## API Routes Plan

- `POST /api/auth/register` - Account creation
- `POST /api/auth/login` - Handled primarily by NextAuth
- `GET /api/prescriptions` - Fetch prescriptions for a user
- `POST /api/prescriptions` - Upload a prescription (Doctor only)
- `GET /api/messages` - Fetch chat thread
- `POST /api/messages` - Send a message
- `POST /api/chat` - AI endpoint for symptoms/health guidance

## Verification Plan

### Automated/Manual Testing
1. Successfully boot Next.js dev server.
2. Create standard Patient and Doctor accounts.
3. Access Doctor dashboard, log a test prescription to Patient.
4. Log in as Patient, view prescription.
5. Simulate offline mode (Network tab -> Offline) and ensure the PWA loads and recent prescriptions remain viewable.
6. Verify message transmission between Doctor and Patient.
7. Attempt a Chatbot interaction and verify the disclaimer appears prominently.
