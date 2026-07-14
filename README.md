# 🩺 PulseMind

<h1 align="center">PulseMind — Real-Time AI Clinical Healthcare Platform</h1>

<p align="center">
  A premium healthcare platform powered by Artificial Intelligence, Machine Learning, and real-time analytics.
</p>

<p align="center">

![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=springboot)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=for-the-badge&logo=postgresql)
![Machine Learning](https://img.shields.io/badge/Machine_Learning-KNN-red?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)

</p>

---

## ✨ Overview

PulseMind is a modern healthcare workspace that combines Artificial Intelligence, Machine Learning, and real-time health analytics into a single platform.

Users can:

- 🫀 Predict heart disease risk
- 🩸 Predict diabetes risk
- 📊 Monitor health vitals
- 🤖 Chat with an AI assistant
- 📄 Analyze medical reports
- 💊 Schedule medications
- 🚨 Receive health alerts

---

# 📸 Screenshots

> Add screenshots inside a `screenshots/` folder.

```text
screenshots/

├── dashboard.png
├── analytics.png
├── chatbot.png
├── predictions.png
└── reports.png
```

| Dashboard | AI Assistant |
|:---:|:---:|
| ![](screenshots/dashboard.png) | ![](screenshots/chatbot.png) |

| Analytics | Predictions |
|:---:|:---:|
| ![](screenshots/analytics.png) | ![](screenshots/predictions.png) |

---

# 🏗️ Architecture

```text
┌──────────────────────────────────────────┐
│             PulseMind React SPA          │
│   Analytics · Predictions · AI Chat      │
└────────────────────┬─────────────────────┘
                     │ REST API / JSON
┌────────────────────┴─────────────────────┐
│          Spring Boot Backend             │
│     JWT · Spring AI · Java KNN Engine    │
└────────────────────┬─────────────────────┘
                     │ JDBC
┌────────────────────┴─────────────────────┐
│         Supabase PostgreSQL              │
│ Users · Predictions · Reports · Vitals   │
└──────────────────────────────────────────┘
```

---

# 🚀 Features

## 🧠 Java-Powered KNN ML Engine

- Pure Java implementation of **K-Nearest Neighbors (KNN)**.
- Trains automatically using:

  - `diabetes.csv`
  - `heart_clean.csv`

- Performs:

  - Data cleaning
  - Median imputation
  - Feature scaling
  - Risk prediction

- Uses **K = 15 neighbors**.

Example output:

```text
Clinical Risk: POSITIVE

Healthy Probability: 27%
Disease Probability: 73%
```

---

## 📊 Health Analytics Dashboard

Track:

- Weight
- Blood pressure
- Blood sugar
- BMI
- Sleep
- Hydration
- Calories

Visualized using responsive Recharts dashboards.

---

## 📄 Medical Report Parser

Upload:

- Images
- PDFs
- Lab reports

The AI automatically:

- Extracts biomarkers
- Detects abnormal values
- Explains medical terms
- Generates summaries

---

## 🤖 AI Assistant & Symptom Checker

Features:

- Streaming AI chatbot
- Symptom triage
- Health FAQs
- Personalized suggestions
- Emergency recommendations

---

## 💊 Medication Scheduler

- Medicine reminders
- Frequency management
- Dashboard alerts
- Critical health warnings

---

# 🛠️ Tech Stack

| Layer | Technology |
|--------|--------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Spring Boot |
| Database | Supabase PostgreSQL |
| Authentication | JWT + Spring Security |
| Machine Learning | Java KNN |
| Charts | Recharts |
| AI | OpenAI API |
| Deployment | Docker |

---

# 📁 Project Structure

```text
PulseMind/

├── backend/
│   ├── src/
│   ├── pom.xml
│   └── resources/

├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts

├── data/
│   ├── diabetes.csv
│   └── heart_clean.csv

├── ml/

├── screenshots/

├── Dockerfile

└── README.md
```

---

# ⚙️ Running Locally

## Backend

```bash
cd backend

./mvnw spring-boot:run
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

Open:

```text
http://localhost:5173
```

---

# 🐳 Docker Setup

Build the container:

```bash
docker build -t pulsemind .
```

Run:

```bash
docker run -p 8080:8080 pulsemind
```

---

# 📈 Machine Learning Models

| Model | Dataset | Algorithm |
|--------|--------|--------|
| Diabetes Prediction | Pima Indians Dataset | KNN (K = 15) |
| Heart Disease Prediction | Clinical Dataset | KNN (K = 15) |

---

# 🔮 Future Roadmap

- [ ] Doctor Dashboard
- [ ] Appointment Booking
- [ ] Wearable Integration
- [ ] Voice Assistant
- [ ] Cloud Deployment
- [ ] Email Notifications

---

# 👥 Default Test Accounts

| Username | Password | Role |
|----------|----------|------|
| `testuser` | `Test@123` | Patient |
| `Chintu_77` | `Chintu@123` | Patient |
| `doctor1` | `Doctor@123` | Doctor |

---

# 👨‍💻 Developer

## Mekala Vigneshwar Reddy

🎓 B.Tech Student — CVR College of Engineering

☕ Java & Spring Boot Developer

📊 Data Science Enthusiast

💻 Passionate about AI, Healthcare, and Full-Stack Development

---

# ⭐ Support

If you found this project useful, consider giving it a star.

Made with ❤️ using Java, React, Spring Boot, and Machine Learning.