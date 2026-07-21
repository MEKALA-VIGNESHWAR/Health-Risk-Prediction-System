# 🩺 PulseMind — Real-Time AI Clinical Healthcare Platform

<p align="center">
  A high-performance full-stack healthcare platform combining Java 21, Spring Boot 3.2, React 18, Supabase PostgreSQL, and machine learning for real-time risk prediction, AI symptom triage, and medical report intelligence.
</p>

<p align="center">
  <a href="https://health-risk-prediction-jck5.onrender.com" target="_blank"><strong>🚀 Live Production Demo on Render</strong></a>
</p>

<p align="center">
  ![Java 21](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=openjdk)
  ![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.4-6DB33F?style=for-the-badge&logo=springboot)
  ![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=for-the-badge&logo=postgresql)
  ![Machine Learning](https://img.shields.io/badge/Machine_Learning-KNN-red?style=for-the-badge)
  ![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)
  [![Render Live](https://img.shields.io/badge/Render-Live-success?style=for-the-badge&logo=render)](https://health-risk-prediction-jck5.onrender.com)
</p>

---

## ✨ System Overview

**PulseMind** bridges clinical data science and modern web applications to provide real-time health intelligence:

- **🩸 Diabetes Risk Engine**: KNN model trained on the Pima Indians dataset with automated feature scaling and median imputation.
- **🫀 Cardiovascular Risk Engine**: Multivariable KNN classifier assessing 13 clinical indicators (cholesterol, ECG, peak heart rate, oldpeak ST depression).
- **🤖 AI Assistant & Symptom Triage**: Context-aware clinical assistant powered by LLM models with fallback for offline execution.
- **📄 Medical Report Parser**: Automated OCR and biomarker extractor parsing lab reports (PDF/images) into structured diagnostic findings.
- **📊 Real-Time Vitals Analytics**: Interactive Recharts dashboards tracking BP, blood glucose, BMI, sleep, and hydration over time.
- **💊 Smart Medication Scheduler**: Automated reminder engine tracking dosage compliance and raising clinical threshold alerts.

---

## 📌 Implementation Status

| Feature / Subsystem | Status | Proof & Technical Implementation |
|:---|:---:|:---|
| **Java 21 KNN ML Engine** | Completed | Native Java KNN (K=15) with z-score normalization and median imputation (`DiabetesPredictionService.java`) |
| **Authentication & Authorization** | Completed | JWT Bearer authentication with role-based Access Control (PATIENT, DOCTOR, ADMIN) (`AuthService.java`) |
| **DTO Layer Separation** | Completed | Strict controller-service separation using decoupled DTO models (`ReportDTO`, `AlertDTO`, `DoctorNoteDTO`) |
| **Database Architecture** | Completed | Supabase PostgreSQL via Hibernate JPA with indexed schemas (`application.properties`) |
| **Frontend React SPA** | Completed | Vite + React 18 + Tailwind CSS + Framer Motion with code-splitting and form validation (`src/`) |
| **AI Medical Report Parsing** | Completed | Multipart file processing and biomarker extraction service (`ReportController.java`) |
| **Docker Production Container** | Completed | Multi-stage Docker deployment packaging Spring Boot and React SPA (`Dockerfile`) |
| **Wearables & EHR Export** | In Progress | OAuth2 integration for HL7/FHIR health data export streams |

---

## 📸 Platform Screenshot Gallery

| **Health Dashboard & Vitals Hub** | **AI Assistant & Symptom Triage** |
|:---:|:---:|
| ![Dashboard](screenshots/dashboard.png) | ![AI Assistant](screenshots/chatbot.png) |

| **Vitals & Trend Analytics** | **KNN Clinical Predictor Workspace** |
|:---:|:---:|
| ![Analytics](screenshots/analytics.png) | ![Predictions](screenshots/predictions.png) |

| **AI Medical Report Parser** |
|:---:|
| ![Reports](screenshots/reports.png) |

---

## 🏗️ Technical Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                    PulseMind React SPA                  │
│  React 18 · TypeScript · Tailwind CSS · Recharts · Vite │
└────────────────────────────┬────────────────────────────┘
                             │ REST API / Bearer JWT
┌────────────────────────────┴────────────────────────────┐
│                  Spring Boot 3.2 Backend                │
│   Spring Security · WebFlux · JPA · Pure Java KNN Engine│
└──────────────┬───────────────────────────┬──────────────┘
               │ JDBC                      │ HTTP API
┌──────────────┴──────────────┐ ┌──────────┴──────────────┐
│     Supabase PostgreSQL     │ │       OpenAI API        │
│ Users · Predictions · Vitals│ │ Medical Report Parser   │
└─────────────────────────────┘ └─────────────────────────┘
```

---

## 🛠️ Tech Stack & Key Libraries

| Layer | Technologies |
|:---|:---|
| **Frontend** | React 18, TypeScript, Vite 6, Tailwind CSS 3, Framer Motion, Recharts, Lucide Icons |
| **Backend** | Java 21, Spring Boot 3.2.4, Spring Security, Spring Data JPA, Spring WebFlux |
| **Database** | PostgreSQL (Supabase Pooler), Hibernate ORM |
| **Machine Learning** | Pure Java K-Nearest Neighbors (KNN), Feature Standardization Engine |
| **Container & CI/CD** | Docker, Maven Frontend Plugin, Render Cloud |

---

## ⚙️ Local Setup & Running Guide

### Prerequisites
- **Java 21** or later (`java -version`)
- **Node.js 22** or later (`node -v`)
- **Git**

### 1. Clone & Environment Configuration
```bash
git clone https://github.com/MEKALA-VIGNESHWAR/health-risk-prediction.git
cd health-risk-prediction

# Copy root environment template
cp .env.example .env
```

### 2. Run Backend (Spring Boot)
```bash
cd backend

# Compile and run (uses default application.properties fallback credentials)
./mvnw spring-boot:run
```
> The backend starts on `http://localhost:8080`.

### 3. Run Frontend (React + Vite)
```bash
cd frontend

# Install dependencies and start Vite dev server
npm install
npm run dev
```
> Access the SPA at `http://localhost:5173`.

---

## 🐳 Docker Deployment

To build a unified production container packaging both backend and static frontend assets:

```bash
# Build Docker image
docker build -t pulsemind .

# Run container listening on port 8080
docker run -p 8080:8080 --env-file .env pulsemind
```

---

## 🔐 Environment Variables Reference

| Variable Name | Default Value / Description | Required? |
|:---|:---|:---:|
| `PORT` | `8080` (App listening port) | No |
| `SPRING_DATASOURCE_URL` | Supabase PostgreSQL JDBC connection string | Yes (in Prod) |
| `SPRING_DATASOURCE_USERNAME` | Supabase DB user | Yes (in Prod) |
| `SPRING_DATASOURCE_PASSWORD` | Supabase DB password | Yes (in Prod) |
| `JWT_SECRET` | Secret key for signing JWT tokens | Recommended |
| `OPENAI_API_KEY` | API Key for AI Chatbot & Report Parser (runs in demo mode if empty) | Optional |
| `VITE_API_BASE` | `/api` (Base API prefix for frontend requests) | No |

---

## 📡 Key REST API Routes

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new patient account
- `POST /api/auth/login` — Authenticate and obtain Bearer JWT token
- `GET /api/auth/me` — Retrieve current authenticated profile

### Machine Learning Predictions (`/api/predict`)
- `POST /api/predict/diabetes` — Evaluate diabetes risk using 8 clinical parameters
- `POST /api/predict/heart` — Evaluate cardiovascular risk using 13 clinical parameters
- `GET /api/predict/history/user/{userId}` — Fetch patient diabetes risk history DTOs
- `GET /api/predict/heart/history/user/{userId}` — Fetch patient heart risk history DTOs

### Medical Reports & AI Assistant
- `POST /api/reports/analyze` — Parse uploaded PDF/image lab report (`MultipartFile`)
- `GET /api/reports/user/{userId}` — Retrieve user's analyzed medical reports
- `POST /api/symptoms/check` — Execute AI symptom triage analysis

---

## 📝 Example API Payloads & Responses

### 1. Diabetes Risk Prediction
**Request**: `POST /api/predict/diabetes`
```json
{
  "pregnancies": 6,
  "glucose": 148,
  "bloodPressure": 72,
  "skinThickness": 35,
  "insulin": 0,
  "bmi": 33.6,
  "diabetesPedigreeFunction": 0.627,
  "age": 50
}
```

**Response**: `200 OK`
```json
{
  "predictionResult": 1,
  "probabilityDiabetes": 0.73,
  "probabilityNoDiabetes": 0.27,
  "riskLevel": "HIGH",
  "riskPercentage": 73.0,
  "confidenceLevel": 0.88,
  "predictionMessage": "Clinical Risk: POSITIVE (High Probability of Diabetes)",
  "modelUsed": "Java KNN Classifier (K=15)"
}
```

### 2. Cardiovascular Risk Prediction
**Request**: `POST /api/predict/heart`
```json
{
  "age": 67,
  "sex": 1,
  "cp": 0,
  "trestbps": 160.0,
  "chol": 286.0,
  "fbs": 0,
  "restecg": 0,
  "thalach": 108.0,
  "exang": 1,
  "oldpeak": 1.5,
  "slope": 1,
  "ca": 2,
  "thal": 2
}
```

**Response**: `200 OK`
```json
{
  "prediction": 1,
  "disease_probability": 0.85,
  "no_disease_probability": 0.15,
  "risk": "HIGH",
  "confidenceLevel": 0.85,
  "message": "Heart Disease Risk: Positive",
  "risk_description": "Multiple high-risk indicators detected including age, resting BP, and exercise angina."
}
```

---

## ⚠️ Security Notice & Test Accounts

> [!WARNING]
> **LOCAL DEVELOPMENT ACCOUNTS ONLY**: The credentials below are supplied solely for local testing and demonstration purposes. Do NOT use these passwords or hardcode credentials in public production environments. Always set `SPRING_DATASOURCE_PASSWORD` and `JWT_SECRET` in environment variables.

| Username | Password | Role | Usage |
|:---|:---|:---:|:---|
| `testuser` | `Test@123` | Patient | Patient portal, vitals logging, predictions |
| `Chintu_77` | `Chintu@123` | Patient | Secondary patient profile |
| `doctor1` | `Doctor@123` | Doctor | Doctor dashboard & patient notes |

---

## 👨‍💻 Developer Profile

**Mekala Vigneshwar Reddy**  
🎓 B.Tech Computer Science Student — CVR College of Engineering  
☕ Backend & Machine Learning Developer (Java, Spring Boot, React, Python ML)  
🔗 GitHub: [@MEKALA-VIGNESHWAR](https://github.com/MEKALA-VIGNESHWAR)  

---

## ⭐ Support & Acknowledgments

If you found this project helpful or insightful for healthcare engineering, please consider giving the repository a **star**!