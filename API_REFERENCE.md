# API Reference: AI Health Risk Prediction System 2.0 (AuraHealth)

All endpoints (except Authentication and Health Check) require a valid JWT passed in the HTTP header:
`Authorization: Bearer <JWT_TOKEN>`

---

## 🔑 Enhanced Authentication Endpoints

### 1. Request Password Reset
Sends instructions to the user's email.
- **URL**: `/api/auth/forgot-password`
- **Method**: `POST`
- **Request Body**:
  ```json
  { "email": "patient@example.com" }
  ```
- **Response (200 OK)**:
  ```json
  { "success": true, "message": "Password reset instructions sent." }
  ```

### 2. Complete Password Reset
Resets the password using a reset token.
- **URL**: `/api/auth/reset-password`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "token": "reset-token-12345",
    "newPassword": "NewSecurePassword@123"
  }
  ```
- **Response (200 OK)**:
  ```json
  { "success": true, "message": "Password updated successfully." }
  ```

---

## 🧠 Explainable AI Predictions

### 1. Retrieve Prediction Feature Importance
Gets the detailed SHAP-like coefficients for a specific prediction run.
- **URL**: `/api/predict/explain/{predictionId}`
- **Method**: `GET`
- **Response (200 OK)**:
  ```json
  {
    "predictionId": "e6a00a12-8c10-449e-8cfa-5517b6dc12a1",
    "riskPercentage": 74.0,
    "riskLevel": "HIGH",
    "featureContributions": [
      { "feature": "glucose", "contribution": 34.5, "effect": "INCREASES_RISK" },
      { "feature": "bmi", "contribution": 15.2, "effect": "INCREASES_RISK" },
      { "feature": "age", "contribution": 8.1, "effect": "INCREASES_RISK" },
      { "feature": "insulin", "contribution": -4.2, "effect": "DECREASES_RISK" }
    ]
  }
  ```

---

## 📋 Medical Report Analyzer

### 1. Upload & Analyze Document
Uploads a lab report (PDF/Image) for extraction and explanation.
- **URL**: `/api/reports/analyze`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Request Parameters**:
  - `file`: Binary file (PDF or Image)
- **Response (200 OK)**:
  ```json
  {
    "id": "c8a00b12-9c10-422e-8cfa-5517b6dc34a9",
    "fileName": "blood_test_july.pdf",
    "status": "COMPLETED",
    "abnormalities": [
      { "parameter": "Hemoglobin A1c", "value": "6.8%", "range": "4.0% - 5.6%", "notes": "Indicates diabetes range" }
    ],
    "recommendations": "Discuss your HbA1c value with your doctor. Focus on reducing simple carbohydrates.",
    "extractedParameters": {
      "HbA1c": "6.8%",
      "FastGlucose": "138 mg/dL",
      "TotalCholesterol": "190 mg/dL"
    }
  }
  ```

---

## 💊 Medicine Reminders

### 1. Create Medicine Reminder
- **URL**: `/api/reminders`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "medicineName": "Metformin",
    "dosage": "500 mg",
    "frequency": "DAILY",
    "times": "08:00, 20:00",
    "startDate": "2026-07-10",
    "endDate": "2026-10-10"
  }
  ```
- **Response (201 Created)**:
  ```json
  { "id": "m1122334-9c10-449e-8cfa-1234b6dc56a8", "medicineName": "Metformin", "active": true }
  ```

### 2. Log Medicine Intake Action
- **URL**: `/api/reminders/logs`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "reminderId": "m1122334-9c10-449e-8cfa-1234b6dc56a8",
    "scheduledTime": "2026-07-09T08:00:00",
    "status": "TAKEN"
  }
  ```
- **Response (200 OK)**:
  ```json
  { "success": true, "loggedTime": "2026-07-09T08:05:22", "status": "TAKEN" }
  ```

---

## 📅 Lifestyle Planners (Nutrition & Fitness)

### 1. Generate Nutrition Plan
Generates a meals list optimized for the current user's profile and constraints.
- **URL**: `/api/plans/nutrition/generate`
- **Method**: `POST`
- **Response (200 OK)**:
  ```json
  {
    "targetCalories": 1800,
    "meals": {
      "breakfast": { "item": "Oatmeal with chia seeds & almonds", "calories": 420, "protein": "15g" },
      "lunch": { "item": "Grilled chicken breast salad with olive oil", "calories": 550, "protein": "40g" },
      "dinner": { "item": "Baked salmon with steamed broccoli", "calories": 610, "protein": "35g" },
      "snacks": { "item": "Greek yogurt with mixed berries", "calories": 220, "protein": "12g" }
    }
  }
  ```

### 2. Generate Fitness Plan
- **URL**: `/api/plans/fitness/generate`
- **Method**: `POST`
- **Response (200 OK)**:
  ```json
  {
    "difficulty": "BEGINNER",
    "schedule": [
      { "day": "Monday", "routine": "Walking & light yoga stretch", "duration": "45 mins", "caloriesBurned": 200 },
      { "day": "Wednesday", "routine": "Bodyweight squats and core holds", "duration": "30 mins", "caloriesBurned": 150 }
    ]
  }
  ```

---

## 🔍 Global Search

### 1. Query Dashboard Elements
Performs an index-wide lookup of predictions, chats, and uploaded reports.
- **URL**: `/api/search`
- **Method**: `GET`
- **Query Parameter**: `q` (e.g. `q=glucose`)
- **Response (200 OK)**:
  ```json
  {
    "predictions": [
      { "id": "e6a00a12-8c10-449e-8cfa-5517b6dc12a1", "date": "2026-07-09", "matchSnippet": "Glucose level: 145" }
    ],
    "reports": [
      { "id": "c8a00b12-9c10-422e-8cfa-5517b6dc34a9", "fileName": "blood_test_july.pdf", "matchSnippet": "FastGlucose: 138" }
    ]
  }
  ```
