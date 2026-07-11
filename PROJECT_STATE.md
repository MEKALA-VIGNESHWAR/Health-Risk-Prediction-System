# Project State: AI Health Risk Prediction System 2.0 (AuraHealth)

This document maps the development state of **AuraHealth**, transitioning from a simple prediction application to a premium, production-ready AI Healthcare Platform.

## 📊 Status Summary
- **Current Phase**: Version 2.0 Upgrade (Design & Platform Expansion)
- **Primary Objective**: Build an AI-driven, high-fidelity SaaS health platform resembling modern digital interfaces (Stripe, Linear, Vercel) featuring clinical analytics, explainable predictions, symptom triaging, report parsing, and dynamic planners.
- **Backend Status**: Spring Boot 3.2.4 (Java 21) backend is running, connected to Supabase PostgreSQL, and JWT auth is active.
- **Frontend Status**: React + Vite + TypeScript + Tailwind CSS application configured for seamless production builds.

---

## 🛠️ Upgraded Tech Stack (2.0 Platform)
- **Backend Framework**: Spring Boot (Java 21, Maven)
- **Frontend Framework**: React 18 (Vite, TypeScript, Tailwind CSS, Framer Motion)
- **Visual Analytics**: Recharts (for medical trends, vitals, sleep, water, and SHAP prediction graphs)
- **Database**: Supabase PostgreSQL (Managed instance)
- **Authentication**: JWT token validation, enhanced with reset, verification, and profile workflows
- **AI/LLM Pipelines**: Spring AI / OpenAI API client with support for chat, natural language symptom triaging, report extraction, and meal/workout planning
- **File Upload / Extraction**: PDF/Image parsing leveraging OpenAI Vision API and multi-part data storage

---

## 🌟 Version 2.0 Feature Roadmap

### 1. Premium UI/UX Design System [COMPLETED]
- **Palette**: Soft Emerald, Forest Green, Sage, Mint (primary), Warm Cream, Ivory, Soft Beige (secondary), Coral, Peach, Soft Gold (accent), Off-white, Light Stone (backgrounds).
- **Aesthetics**: Large whitespace, rounded corners, soft glassmorphic panels, skeleton loading states, smooth page transitions (Framer Motion).
- **Responsive Layout**: Tailored viewports from desktop down to mobile.

### 2. Upgraded Auth & Profile [COMPLETED]
- **Security Flows**: Password recovery (forgot/reset), email verification mock flows, dynamic session tokens.
- **Comprehensive Profile**: Dynamic upload for avatar, structured sections for health parameters (Age, Gender, Height, Weight, Blood Group), medical details (History, Medications, Allergies), and lifestyle metrics (Smoking, Alcohol, Exercise, Sleep, Water).

### 3. Deep AI Health Predictions [COMPLETED]
- **Visual AI Reports**: Detailed risk analysis, model confidence, specific contributing risk factors, preventative measures, recommended diets, sleep advice, and severity warnings.
- **Explainable AI (XAI)**: SHAP-like feature contribution graphs displaying exactly how vitals influenced predictions.

### 4. Interactive Health Analytics
- **Trends & Forecasts**: Recharts-based visualizer tracking BMI, weight, blood sugar, blood pressure, heart rate, sleep, calories, and water across weekly, monthly, and yearly intervals.

### 5. AI Chat & Symptom Checker
- **Streaming Assistant**: Natural language symptom triager (assess urgency, recommend doctor, provide clinical disclaimer) and chatbot answering health FAQs with full session context memory.

### 6. Medical Report Parser [COMPLETED]
- **OCR Engine**: Drop PDF/images (blood/lab reports) to automatically extract parameters, analyze values, and explain abnormalities in user-friendly language.

### 7. Lifestyle Planners (Nutrition & Fitness) [COMPLETED]
- **Diet Planner**: Generates complete meal schedules (breakfast/lunch/dinner/snacks) mapping calories, proteins, carbs, and fats.
- **Workout Planner**: Generates daily workout plans (yoga, cardio, gyms, difficulty levels, duration, calories burned).

### 8. Medicine Reminders & Alerts [COMPLETED]
- **Schedule Tracker**: Daily scheduler monitoring dose, times, and frequency with alert notifications and missed-medicine logs.
- **Emergency Warnings**: Automated trigger alerts when vitals exceed clinical safety limits.

### 9. Global Search & Admin Portal [COMPLETED]
- **Clinical Search**: Composite search endpoint scanning across predictions, uploaded reports text, and reminder schedules.
- **Admin Control Panel**: Lightweight server telemetry dashboard displaying heap memory allocation, CPU core counts, and data growth charts.
