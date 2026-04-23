# Product Requirements Document (PRD)

## 1. Product Overview

**Product Name:** SympTax

SympTax is a web and mobile health application designed to bridge the gap between patients and healthcare providers by digitizing consultations, prescriptions, and medical records. The platform allows users to consult doctors in person, after which doctors (admins) upload prescriptions, medical advice, and records directly to the user’s account.

SympTax ensures that users never lose important medical documents while also providing offline access to essential health records. Additionally, the app includes an AI-powered chatbot and search feature for general health guidance, while always encouraging professional medical consultation.

---

## 2. Problem Statement

Many patients rely on paper-based prescriptions and handwritten medical advice, which can easily be lost, damaged, or forgotten. This leads to:

* Missed or incorrect medication usage
* Poor tracking of medical history
* Inefficient follow-ups with doctors
* Lack of centralized medical records

Healthcare providers also lack streamlined systems for managing and distributing patient records digitally.

---

## 3. Goals & Objectives

### Primary Goals

* Digitize prescriptions and medical records
* Enable seamless communication between users and doctors
* Provide secure, centralized, and offline-accessible health data

### Secondary Goals

* Offer general health guidance through AI/search
* Reduce reliance on paper-based systems
* Improve patient adherence to medical advice

---

## 4. Target Users

### Primary Users

* Patients who want organized and accessible health records
* Individuals who frequently consult doctors

### Secondary Users (Admins)

* Doctors
* Clinic staff
* Healthcare administrators

---

## 5. Key Features

### 5.1 User Features

#### 1. Account Management

* User registration and secure login
* Personal profile (basic info, medical history, allergies)

#### 2. Medical Records Access

* View prescriptions uploaded by doctors
* Access consultation summaries
* Download or share records

#### 3. Offline Access

* Cached access to prescriptions and records
* Local storage of recent medical data

#### 4. Communication with Doctors

* Messaging system (post-consultation)
* Notifications when new prescriptions are uploaded

#### 5. AI Chatbot / Search

* Users can input symptoms or concerns
* AI provides general guidance (non-diagnostic)
* Clear disclaimers encouraging doctor consultation

#### 6. Search-Based Health Guidance

* Keyword-based search (e.g., “headache remedies”)
* Structured articles or quick tips

---

### 5.2 Admin (Doctor) Features

#### 1. Patient Management

* View list of assigned patients
* Access patient profiles and history

#### 2. Prescription Upload

* Upload prescriptions (PDF/image/text)
* Attach notes, dosage instructions, and reminders

#### 3. Medical Record Management

* Update patient records
* Add consultation summaries

#### 4. Communication Tools

* Respond to patient messages
* Send follow-up instructions

#### 5. Dashboard

* Overview of patients and activity
* Recent uploads and consultations

---

## 6. User Flow

### Patient Flow

1. User registers/logs in
2. User visits doctor physically for consultation
3. Doctor uploads prescription to SympTax
4. User receives notification
5. User views/downloads prescription (online/offline)
6. User may ask follow-up questions via messaging or chatbot

### Doctor Flow

1. Doctor logs into admin panel
2. Selects patient
3. Uploads prescription and notes
4. Sends update/notification to patient

---

## 7. AI Chatbot Scope & Limitations

### Capabilities

* Provide general health advice
* Suggest basic remedies (e.g., rest, hydration)
* Help users understand symptoms at a high level

### Limitations

* No diagnosis or prescription generation
* No emergency handling beyond directing to professionals

### Safety Disclaimer

* Always prompt users to consult a licensed doctor
* Include warnings for serious symptoms

---

## 8. Technical Requirements

### Platform

* Web app (responsive)
* Mobile app (Android/iOS)

### Backend

* Secure cloud database
* API for user/admin interaction

### Offline Capability

* Local caching (e.g., IndexedDB / mobile storage)
* Sync when internet is available

### Security

* End-to-end encryption (for sensitive data)
* Role-based access control (user vs admin)
* Compliance with health data privacy laws

---

## 9. Data Management

* Patient profiles
* Prescription records
* Consultation notes
* Chat logs

All data must be:

* Securely stored
* Easily retrievable
* Backed up regularly

---

## 10. Success Metrics (KPIs)

* Number of active users
* Number of prescriptions uploaded
* User retention rate
* Reduction in lost prescriptions (survey-based)
* Engagement with chatbot/search

---

## 11. Risks & Mitigations

### Risk: Misuse of AI advice

* Mitigation: Strong disclaimers and limited AI scope

### Risk: Data privacy concerns

* Mitigation: Encryption, compliance, secure authentication

### Risk: Low adoption by doctors

* Mitigation: Simple UI and easy upload process

---

## 12. Future Enhancements

* Appointment scheduling system
* Video consultation integration
* Medication reminders and tracking
* Integration with pharmacies
* Health analytics dashboard for users

---

## 13. Conclusion

SympTax aims to modernize healthcare record management by ensuring that patients have continuous access to their prescriptions and medical history while enabling doctors to efficiently manage and distribute patient information. By combining digital records, offline accessibility, and AI-assisted guidance, SympTax improves healthcare accessibility, organization, and patient outcomes.
