# SympTax: Digital Health Record & Governance Platform (MVP)

## Project Overview
SympTax is an enterprise-grade, multi-tenant digital health ecosystem. It centralizes patient data while maintaining strict privacy and delegated clinical authority through a hierarchical governance model.

---

## Role-Specific Structures & Capabilities

### 1. Super Admin (Platform Nexus)
The Super Admin manages the global infrastructure and enforces the first level of trust for all platform participants.

-   **Structure & Dashboard**:
    *   **Request Nexus**: A dedicated tab for reviewing and approving "Hospital Requests" from aspiring Master Admins.
    *   **Infrastructure Management**: View and audit all active branches and their respective Master Admins.
    *   **Global User Directory**: A complete registry of every user (Patient/Doctor/Master Admin) on the platform with search and profile viewing capabilities.
-   **Core Features**:
    *   **Hospital Provisioning**: Toggling the status of branch creation requests. Approval automatically creates the `Hospital` and `Branch` entities and elevates the requester to `MASTER_ADMIN`.
    *   **Global Verification**: Exclusive authority to verify (`isVerified`) new Patient and Doctor registrations, acting as a security gatekeeper.
    *   **Account Termination**: Ability to remove any user account (excluding other Super Admins) for security or compliance reasons.

### 2. Master Admin (Branch Governance)
The Master Admin manages the specific ecosystem of a single hospital branch.

-   **Structure & Dashboard**:
    *   **Branch Nexus**: A high-level view of all verified members (Doctors and Patients) associated with their branch.
    *   **Membership Management**: A dedicated interface for reviewing incoming membership requests from users wishing to join the branch.
    *   **Record Auditor**: Access to the medical records and clinical history of any user within their branch for administrative oversight.
-   **Core Features**:
    *   **Membership Approval**: Approving or rejecting `BranchMembership` requests for Patients and Doctors.
    *   **Staff Oversight**: Tracking the number of active doctors and patients within their jurisdiction.
    *   **Profile Review**: Access to detailed user profiles, including blood type, gender, and contact info, for branch members.

### 3. Doctor (Clinical Specialist)
Doctors provide care, maintain clinical data, and consult with patients through secure channels.

-   **Structure & Dashboard**:
    *   **Patient Nexus**: A quick-access list of "accepted" patient connections.
    *   **Appointment Hub**: Integration with video consultation tools.
    *   **Clinical Toolset**: Direct access to creating and managing medical records for their patients.
-   **Core Features**:
    *   **Medical Record Creation**: Create records (Diagnoses, Prescriptions, Notes, Alerts) with support for image attachments (Supabase Storage).
    *   **Rich Attachments**: Ability to upload and attach clinical photos or documents directly to a patient's medical history.
    *   **Telehealth**: Initiate and conduct HIPAA-compatible video consultations via Daily.co.
    *   **Secure Communication**: Message patients or colleagues who are part of their accepted clinical network.
    *   **Doctor Invitations**: Send and receive connection requests to build a clinical network.

### 4. Patient (Primary User)
Patients own their health data and interact with clinicians for wellness management.

-   **Structure & Dashboard**:
    *   **Health Hub**: Summary of total records, diagnoses, and prescriptions.
    *   **Clinical Timeline**: A chronological view of every medical event, record, and medication update.
    *   **Insights Engine**: A specialized view for wellness tips derived from clinical diagnoses.
-   **Core Features**:
    *   **AI Clinical Assistant**: Chat with the SympTax Clinical AI (Gemini) for wellness patterns and symptom guidance (non-diagnostic).
    *   **Medical History Ownership**: Full access to all records created by doctors, with the ability to see attachments and notes.
    *   **Branch Navigation**: Ability to "Explore Branches" and request to join new hospital networks.
    *   **Context Switching**: Ability to swap between different hospital memberships and set a "Primary Branch."
    *   **Medication Management**: Track active medications, dosages, and frequencies.

---

## Technical Features Overview

### Telehealth & Communication
-   **Daily.co Integration**: Seamless video consultation framework.
-   **Secure Messaging**: Internal chat restricted to users with `ACCEPTED` friend/connection status.
-   **Notifications**: Global bell-based system for new records, messages, and membership status changes.

### AI & Data Insights
-   **Symmetry AI Agent**: A guardrailed clinical agent using Google's Gemini Flash model.
-   **Automated Insights**: Dynamic generation of wellness advice based on `MedicalRecord` types.

### Infrastructure & Security
-   **Multi-Branch Hierarchy**: Scoped access via `Hospital` and `Branch` relationships.
-   **Dual-Layer Verification**: Accounts must be verified by Super Admin, and branch memberships must be verified by Master Admin.
-   **Supabase Storage**: Secure, private bucket for medical file and profile image hosting.
-   **Global Branding**: Consistent custom theming with custom SVG logo animations for professional identity.
