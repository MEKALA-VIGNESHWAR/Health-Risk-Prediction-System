# 🏥 PulseMind: Real-Time AI Clinical Healthcare Platform

PulseMind is a premium, real-time clinical AI health risk prediction and tracking SaaS platform. Designed like a modern digital healthcare workspace, it enables patients to evaluate cardiovascular and diabetes risks, monitor key vitals (BMI, blood pressure, sleep, blood sugar), parse medical lab reports automatically, schedule medicine reminders, and consult a streaming AI assistant.

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────┐
│             PulseMind React SPA          │
│       Vitals Tracking · ML Predictions   │
└────────────────────┬─────────────────────┘
                     │ REST API / JSON
┌────────────────────┴─────────────────────┐
│          Spring Boot REST API            │
│      JWT Auth · Spring AI · Java KNN     │
└────────────────────┬─────────────────────┘
                     │ JDBC
┌────────────────────┴─────────────────────┐
│          Supabase PostgreSQL             │
│      Users · Predictions · Daily Logs    │
└──────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
PulseMind/
├── backend/                  # Spring Boot REST Backend
│   ├── src/main/java/        # Java source code
│   │   └── com/example/demo/
│   │       ├── ai/           # AI services (OpenAI client, Chat, Symptoms)
│   │       ├── config/       # Spring Security, JPA, & CORS configuration
│   │       ├── controller/   # API controllers (Auth, Predict, Reports, Dashboard)
│   │       ├── dto/          # Data Transfer Objects
│   │       ├── entity/       # JPA Database entities (User, Alerts, Vitals)
│   │       ├── repository/   # JPA Repositories
│   │       └── service/      # Core business logic (KNN engine, Auth)
│   ├── src/main/resources/   # Application config & properties
│   └── pom.xml               # Maven configuration
├── frontend/                 # React SPA Workspace
│   ├── src/                  # React components, pages, hooks, state, and styles
│   ├── index.html            # Main template entry
│   ├── vite.config.ts        # Vite configuration & proxy settings
│   └── package.json          # Frontend npm scripts & dependencies
├── data/                     # ML clinical training datasets
│   ├── diabetes.csv          # Pima Indians Diabetes database
│   └── heart_clean.csv       # Clinical Heart Disease dataset
├── ml/                       # Legacy ML prototypes (Python)
└── Dockerfile                # Multi-stage production Docker builder
```

---

## 🚀 Key Features

### 1. Java-Powered KNN ML Engine
Replaced standard rule-based heuristics with a high-performance, pure Java **K-Nearest Neighbors (KNN)** model:
- Automatically loads, cleans, scales, and trains on `diabetes.csv` and `heart_clean.csv` clinical datasets at application startup.
- Imputes invalid zero values for vital statistics (Glucose, Blood Pressure, BMI, etc.) using median imputation of the training dataset.
- Executes $K=15$ neighbors searches to determine risk levels.
- Produces a clear diagnostic verdict (`Clinical Risk: POSITIVE` or `Clinical Risk: NEGATIVE`) along with a detailed dual-probability meter (Healthy vs. Disease Risk %).

### 2. Interactive Health Analytics
- Logs daily vitals (weight, blood pressure, glucose, sleep, hydration, calories).
- Features interactive, responsive **Recharts** displaying historical trends across weekly, monthly, and yearly intervals.

### 3. Medical Report Parser
- Drop image or PDF lab reports directly.
- The **OpenAI Vision API** parses and extracts biomarkers, flags outliers, and provides plain-English clinical explanations of abnormalities.

### 4. Chat & Triage Assistant
- A stateful streaming chatbot answering health FAQs with system prompt constraints.
- A symptom triager highlighting recommended urgency steps and warnings.

### 5. Medicine Scheduler
- Set doses, times, and frequencies.
- Automatically flags emergency alerts on the dashboard if logged vitals cross critical clinical thresholds.

---

## 🐳 Running the Platform

### Prerequisites
- **Java 21** (Eclipse Temurin JRE)
- **Node.js** (v18+)
- **Maven** (optional, included `./mvnw` wrapper can be used)

### Local Dev Mode (Mono-Repo Running)
To start both backend and frontend dynamically during local development:

1. **Start Backend (API on Port 8080):**
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```
2. **Start Frontend (Vite Dev Server on Port 5173):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. Open **http://localhost:5173** to access the application.

---

## 🏗️ Production Build & Render Deployment

To compile and package the entire app into a single deployable artifact (Vite assets bundled statically inside Spring Boot):

```bash
# In the root workspace directory
mvn clean package -DskipTests
```
This produces `backend/target/realtime-app-1.0.0.jar`.

### Running the JAR:
```bash
java -jar backend/target/realtime-app-1.0.0.jar
```
Navigate to **http://localhost:8080** to access the production build.

### Dockerized Setup:
```bash
# Build the Docker container
docker build -t pulsemind .

# Run the container
docker run -p 8080:8080 pulsemind
```
*Note: The Dockerfile is pre-configured to bundle and copy the training CSV files from the `data/` directory into the final runtime container so predictions execute seamlessly.*

---

## 👥 Default Test Accounts
On first database initialization, the backend provisions the following credential templates:

| Username | Password | Role |
|----------|----------|------|
| `testuser` | `Test@123` | Patient |
| `Chintu_77` | `Chintu@123` | Patient |
| `doctor1` | `Doctor@123` | Doctor |
