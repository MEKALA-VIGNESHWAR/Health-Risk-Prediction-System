# Project Overview
**PulseMind** (formerly AuraHealth) is an industry-level, real-time clinical AI health risk prediction and tracking SaaS platform. It leverages calibrated Machine Learning models (K-Nearest Neighbors implemented in pure Java) and Generative AI (OpenAI API) to help users check cardiovascular and diabetes risks, track key health metrics, analyze lab reports, schedule medicine reminders, and chat with a specialized medical assistant.

---

# Tech Stack
- **Backend**: Spring Boot 3.2.4 (Java 21), Maven build system, Spring Data JPA / Hibernate
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Framer Motion (page animations), Recharts (data visualizations)
- **Database**: Supabase PostgreSQL (Managed instance)
- **Authentication**: JWT stateless authentication with custom login, registration, password recovery, and email verification workflows
- **AI Engine**: OpenAI API client (GPT-4o-mini & Vision API) for medical assistant responses, natural language symptom checking, and lab report parsing
- **ML Engine**: Custom high-performance K-Nearest Neighbors (KNN) classifier implemented in pure Java, loading and training on `diabetes.csv` and `heart_clean.csv` clinical datasets at application startup

---

# Folder Structure
```
├── backend/                  # Spring Boot application workspace
│   ├── src/main/java/        # Java source code (controllers, entities, repositories, services, DTOs)
│   ├── src/main/resources/   # Application properties, static folders, SQL migrations
│   ├── pom.xml               # Maven configuration and dependencies
│   └── mvnw                  # Maven wrapper script
├── frontend/                 # React SPA workspace
│   ├── src/                  # React components, pages, hooks, styling, utility modules
│   ├── index.html            # Main entry template
│   ├── package.json          # Node dependencies and build scripts
│   └── vite.config.ts        # Vite configuration with proxy settings
├── data/                     # Data module containing CSV datasets for ML training
│   ├── diabetes.csv          # Pima Indians Diabetes dataset
│   └── heart_clean.csv       # Cleaned Heart Disease clinical dataset
├── ml/                       # Python ML model prototypes (Random Forest)
└── Dockerfile                # Root multi-stage Docker builder (builds React & Spring Boot together)
```

---

# APIs
### Authentication (`/api/auth`)
* `POST /api/auth/register` - Create a new user profile
* `POST /api/auth/login` - Authenticate user and retrieve JWT token
* `POST /api/auth/logout` - Invalidate session
* `POST /api/auth/forgot-password` - Request password reset link (mocked)
* `POST /api/auth/reset-password` - Reset account password

### Clinical Predictions (`/api/predict`)
* `POST /api/predict/diabetes` - Run KNN prediction model for diabetes risk
* `POST /api/predict/heart` - Run KNN prediction model for cardiovascular risk
* `GET /api/predict/history/user/{userId}` - Retrieve historical predictions for a user

### Health Dashboard & Vitals (`/api/dashboard`)
* `GET /api/dashboard` - Get dashboard stats (health score, streak, daily metrics)
* `GET /api/dashboard/charts` - Fetch historical vitals data for Recharts (BMI, weight, sleep, blood pressure, blood sugar, heart rate)
* `POST /api/dashboard/log` - Log daily vitals

### Lab Reports (`/api/reports`)
* `POST /api/reports/upload` - Upload PDF/image report and parse parameters using OpenAI Vision API
* `GET /api/reports/user/{userId}` - Retrieve uploaded reports history

### AI Assistant & Symptoms (`/api/assistant`, `/api/symptom`)
* `POST /api/assistant/chat` - Chat with PulseMind streaming AI agent (persists session history in database)
* `POST /api/symptom/check` - Assess symptoms using AI and render triage urgency levels

---

# Database Tables
All tables are mapped as JPA entities in `/backend/src/main/java/com/example/demo/entity/`:
1. **`users`** (`User.java`): User registration details, roles, profile metrics, lifestyle preferences, and health goals.
2. **`daily_vitals`** (`DailyVitals.java`): Historical tracker for water intake, sleep, calories, weight, BP, sugar, and heart rate.
3. **`diabetes_predictions`** (`DiabetesPrediction.java`): Records of diabetes prediction runs including parameters, class, probability, confidence level, SHAP contribution factors, and recommendations.
4. **`heart_predictions`** (`HeartPrediction.java`): Records of cardiovascular prediction runs mapping the 13 clinical inputs, risk level, disease probability, and recommendations.
5. **`medical_reports`** (`MedicalReport.java`): Uploaded files metadata, extracted raw text, and structured analysis of abnormal biomarkers.
6. **`alerts`** (`Alert.java`): Warnings triggered when a prediction risk or tracked vital exceeds clinical thresholds.
7. **`notifications`** (`Notification.java`): Dynamic alerts pushed to the user interface.
8. **`chat_sessions`** & **`chat_messages`** (`ChatSession.java`, `ChatMessageEntity.java`): Conversational history storage for the PulseMind Assistant.
9. **`medicine_reminders`** & **`medicine_logs`** (`MedicineReminder.java`, `MedicineLog.java`): Prescribed medication schedules, dosage, intake logging, and missed doses.

---

# Current Progress
- **Branding Upgrade [COMPLETED]**: AuraHealth has been fully renamed to **PulseMind** globally, including local storage keys (`pulse-theme`), SVG logo gradients, assistant persona, and metadata.
- **Java KNN ML Engine [COMPLETED]**: Replaced heuristic calculation code with dynamic K-Nearest Neighbors (KNN) algorithms reading directly from the `data/` folder CSVs at startup, with median-based zero value imputation and min-max feature scaling.
- **Diagnostic Verdict Display [COMPLETED]**: Enhanced prediction output to clearly show a binary verdict (`Clinical Risk: POSITIVE` or `Clinical Risk: NEGATIVE`) and a detailed side-by-side split probability meter.
- **Chunk Loading Navigation Protection [COMPLETED]**: Wrapped lazy routes in `lazyWithRetry` to automatically catch dynamic asset loading failures and force page reloads seamlessly.
- **Render Setup [COMPLETED]**: Configured `Dockerfile` to copy the `data/` directory into the final runner image stage for live dataset-backed clinical predictions.

---

# Pending Tasks
- **Integrate Real Email Service**: Replace mock email verification and password reset mailer stubs with AWS SES or SendGrid.
- **Third-Party OAuth**: Integrate social login providers (Google, Apple, Microsoft) into the auth flow.
- **Extended ML Models**: Build backend options to toggle between KNN, Naive Bayes, and remote Python Random Forest microservice.
- **Offline LLM alternative**: Support local Ollama endpoints in `application.properties` for the streaming AI chatbot to reduce OpenAI API cost.
