# Database Schema: AI Health Risk Prediction System 2.0 (AuraHealth)

AuraHealth utilizes a **Supabase PostgreSQL** instance. This document catalogs all system tables, columns, indexes, and primary/foreign key relationships.

---

## 🗂️ Database ERD (Logical Flow)

```
  ┌──────────────┐           ┌──────────────────────┐
  │    users     ├──────────►│ diabetes_predictions │
  │ (Patient/Dr) │           └──────────────────────┘
  └──────┬───────┤           ┌──────────────────────┐
         │       ├──────────►│  heart_predictions   │
         │       │           └──────────────────────┘
         │       │           ┌──────────────────────┐
         │       ├──────────►│        alerts        │
         │       │           └──────────────────────┘
         │       │           ┌──────────────────────┐
         │       ├──────────►│     doctor_notes     │
         │       │           └──────────────────────┘
         │       │           ┌──────────────────────┐
         │       ├──────────►│    notifications     │
         │       │           └──────────────────────┘
         │       │           ┌──────────────────────┐
         │       ├──────────►│   medical_reports    │
         │       │           └──────────────────────┘
         │       │           ┌──────────────────────┐
         │       ├──────────►│  medicine_reminders  │
         │       │           └──────────────────────┘
         │       │           ┌──────────────────────┐
         │       ├──────────►│   nutrition_plans    │
         │       │           └──────────────────────┘
         │       │           ┌──────────────────────┐
         │       └──────────►│    fitness_plans     │
         └───────────────────┴──────────────────────┘
```

---

## 💾 Core Tables (Production Schema)

### 1. `users`
Profile configuration, lifestyle metrics, and security.
- **Primary Key**: `id` UUID
- **Indexes**:
  - `idx_users_username` on `username` (unique)
  - `idx_users_email` on `email` (unique)
- **Columns**: (See v1.0 layout, maintaining backwards compatibility). Role supports `PATIENT`, `DOCTOR`, `ADMIN`.

### 2. `diabetes_predictions`
Inputs and outputs for diabetes risk assessments.
- **Primary Key**: `id` UUID
- **Foreign Key**: `user_id` -> `users.id`
- **Columns**: (See v1.0 layout. Custom field `feature_importance` stores JSON string of SHAP-like coefficients).

### 3. `heart_predictions`
Inputs and outputs for cardiovascular evaluations.
- **Primary Key**: `id` UUID
- **Foreign Key**: `user_id` -> `users.id`
- **Columns**: (See v1.0 layout. Recommendations stored in a JSON-encoded text block).

### 4. `alerts`
Triggers when clinical safety parameters are breached.
- **Primary Key**: `id` UUID
- **Foreign Key**: `patient_id` -> `users.id`
- **Columns**: (See v1.0 layout. Tracks metrics like `severity`, `alert_type`, `trigger_value`).

### 5. `doctor_notes`
Clinical annotations made by medical practitioners.
- **Primary Key**: `id` UUID
- **Columns**: (See v1.0 layout. Tracks note details and authors).

### 6. `notifications`
System alerts and instructions.
- **Primary Key**: `id` UUID
- **Columns**: (See v1.0 layout. Read status is tracked via `is_read` boolean).

---

## 💾 Upgraded 2.0 Tables

### 7. `medical_reports`
Stores parsed medical documents, lab results, and extracted recommendations.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PRIMARY KEY | Generated UUID |
| `user_id` | `UUID` | NOT NULL, FK(`users.id`)| Associated Patient ID |
| `file_name` | `VARCHAR(255)`| NOT NULL | Uploaded file name |
| `file_type` | `VARCHAR(100)`| | MIME type (e.g. `application/pdf`) |
| `extracted_text` | `TEXT` | | Raw text extracted via OCR |
| `structured_data` | `TEXT` | | JSON string representing parameters & values |
| `abnormalities` | `TEXT` | | JSON list of abnormal metrics found |
| `recommendations` | `TEXT` | | AI-generated clinical suggestions |
| `status` | `VARCHAR(50)` | NOT NULL | e.g. `PROCESSING`, `COMPLETED`, `FAILED` |
| `created_at` | `TIMESTAMP` | NOT NULL | Datetime uploaded |
| `updated_at` | `TIMESTAMP` | | Datetime updated |

*Indexes:*
- `idx_reports_user_id` on `user_id`
- `idx_reports_status` on `status`

---

### 8. `medicine_reminders`
Dosage tracking schedule and logs.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PRIMARY KEY | Generated UUID |
| `user_id` | `UUID` | NOT NULL, FK(`users.id`)| Associated Patient ID |
| `medicine_name` | `VARCHAR(255)`| NOT NULL | Name of the medicine |
| `dosage` | `VARCHAR(100)`| NOT NULL | e.g., `1 tablet`, `5ml` |
| `frequency` | `VARCHAR(100)`| NOT NULL | e.g., `DAILY`, `WEEKLY`, `ONCE` |
| `times` | `VARCHAR(255)`| NOT NULL | Comma-separated times (e.g., `08:00, 20:00`)|
| `start_date` | `DATE` | NOT NULL | Start of schedule |
| `end_date` | `DATE` | | End of schedule |
| `active` | `BOOLEAN` | NOT NULL | Active status (Default `true`) |
| `created_at` | `TIMESTAMP` | NOT NULL | Datetime created |

*Indexes:*
- `idx_reminders_user_id` on `user_id`
- `idx_reminders_active` on `active`

---

### 9. `medicine_logs`
Logs whether patients took or missed scheduled dosages.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PRIMARY KEY | Generated UUID |
| `reminder_id` | `UUID` | NOT NULL, FK(`medicine_reminders.id`)| Linked schedule ID |
| `scheduled_time` | `TIMESTAMP` | NOT NULL | When it should have been taken |
| `logged_time` | `TIMESTAMP` | | When user actioned the log |
| `status` | `VARCHAR(50)` | NOT NULL | `TAKEN`, `MISSED`, `SNOOZED` |

*Indexes:*
- `idx_med_logs_reminder` on `reminder_id`
- `idx_med_logs_status` on `status`

---

### 10. `nutrition_plans`
Stores customized breakfast, lunch, dinner, and snack layouts.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PRIMARY KEY | Generated UUID |
| `user_id` | `UUID` | NOT NULL, FK(`users.id`)| Associated Patient ID |
| `target_calories` | `INTEGER` | NOT NULL | Target daily calorie allowance |
| `target_protein` | `INTEGER` | | Target protein (grams) |
| `target_carbs` | `INTEGER` | | Target carbohydrates (grams) |
| `target_fats` | `INTEGER` | | Target fats (grams) |
| `meals_json` | `TEXT` | NOT NULL | JSON payload with meal lists and timings |
| `created_at` | `TIMESTAMP` | NOT NULL | Date plan was generated |

---

### 11. `fitness_plans`
Stores customized workout schedules, levels, and routines.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PRIMARY KEY | Generated UUID |
| `user_id` | `UUID` | NOT NULL, FK(`users.id`)| Associated Patient ID |
| `difficulty` | `VARCHAR(50)` | NOT NULL | `BEGINNER`, `INTERMEDIATE`, `ADVANCED` |
| `weekly_frequency`| `INTEGER` | NOT NULL | Recommended workouts per week |
| `routines_json` | `TEXT` | NOT NULL | JSON layout of exercises and times |
| `created_at` | `TIMESTAMP` | NOT NULL | Date plan was generated |
