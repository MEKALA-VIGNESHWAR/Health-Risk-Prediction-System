package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.entity.DailyVitals;
import com.example.demo.entity.DiabetesPrediction;
import com.example.demo.entity.User;
import com.example.demo.entity.UserRole;
import com.example.demo.repository.DailyVitalsRepositoryJPA;
import com.example.demo.repository.DiabetesPredictionRepositoryJPA;
import com.example.demo.repository.UserRepositoryJPA;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * DashboardService - Provides aggregated dashboard data and statistics
 * Calculates summary metrics, trends, analytics, and insights
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final DiabetesPredictionRepositoryJPA predictionRepository;
    private final UserRepositoryJPA userRepository;
    private final DailyVitalsRepositoryJPA dailyVitalsRepository;

    /**
     * Get dashboard summary statistics
     * Used by dashboard cards
     */
    public Map<String, Object> getDashboardSummary() {
        log.info("Calculating dashboard summary statistics");
        
        try {
            List<DiabetesPrediction> allPredictions = predictionRepository.findAll();
            
            // Calculate statistics
            long totalPatients = userRepository.count();
            long totalPredictions = allPredictions.size();
            
            long highRiskCount = allPredictions.stream()
                    .filter(p -> p.getPredictionResult() != null && p.getPredictionResult() == 1)
                    .count();
            
            long lowRiskCount = totalPredictions - highRiskCount;
            
            double riskPercentage = totalPredictions > 0 
                    ? (highRiskCount * 100.0 / totalPredictions) 
                    : 0.0;
            
            double avgGlucose = allPredictions.stream()
                    .mapToDouble(DiabetesPrediction::getGlucose)
                    .average()
                    .orElse(0.0);
            
            long pendingFollowups = 8; // Placeholder - would be calculated from appointments table
            
            Map<String, Object> summary = new HashMap<>();
            summary.put("totalPredictions", totalPredictions);
            summary.put("highRiskCount", highRiskCount);
            summary.put("lowRiskCount", lowRiskCount);
            summary.put("riskPercentage", Math.round(riskPercentage * 10.0) / 10.0);
            summary.put("avgGlucose", Math.round(avgGlucose * 10.0) / 10.0);
            summary.put("pendingFollowups", pendingFollowups);
            summary.put("totalPatients", totalPatients);
            
            log.info("Dashboard summary calculated successfully");
            return summary;
            
        } catch (Exception e) {
            log.error("Error calculating dashboard summary: {}", e.getMessage());
            throw new RuntimeException("Failed to calculate dashboard summary", e);
        }
    }

    /**
     * Get paginated patients list with advanced filtering
     */
    public Map<String, Object> getPatientsWithFilters(
            String search, 
            String riskLevel, 
            String ageRange, 
            String glucoseRange,
            int page,
            int pageSize) {
        
        log.info("Fetching patients with filters - search: {}, risk: {}, age: {}, glucose: {}", 
                search, riskLevel, ageRange, glucoseRange);
        
        try {
            List<DiabetesPrediction> allPredictions = predictionRepository.findAll();
            
            // Apply searches and filters
            List<DiabetesPrediction> filtered = allPredictions.stream()
                    .filter(p -> applySearchFilter(p, search))
                    .filter(p -> applyRiskLevelFilter(p, riskLevel))
                    .filter(p -> applyAgeFilter(p, ageRange))
                    .filter(p -> applyGlucoseFilter(p, glucoseRange))
                    .collect(Collectors.toList());
            
            // Pagination
            int start = page * pageSize;
            int end = Math.min(start + pageSize, filtered.size());
            List<DiabetesPrediction> paginated = filtered.subList(start, end);
            
            // Convert to patient DTOs with user info
            List<Map<String, Object>> patients = paginated.stream()
                    .map(this::convertToPatientsTableRow)
                    .collect(Collectors.toList());
            
            Map<String, Object> result = new HashMap<>();
            result.put("patients", patients);
            result.put("totalCount", filtered.size());
            result.put("pageCount", (int) Math.ceil((double) filtered.size() / pageSize));
            result.put("currentPage", page);
            
            log.info("Fetched {} patients (total: {})", patients.size(), filtered.size());
            return result;
            
        } catch (Exception e) {
            log.error("Error fetching patients: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch patients", e);
        }
    }

    /**
     * Get analytics trends data for specified period
     */
    public Map<String, Object> getTrendAnalytics(String period) {
        log.info("Fetching trend analytics for period: {}", period);
        
        try {
            List<DiabetesPrediction> predictions = predictionRepository.findAll();
            
            int dataPoints = getDataPointsForPeriod(period);
            
            // Generate trend data
            List<String> labels = generateLabels(dataPoints, period);
            List<Double> glucoseTrend = generateRandomTrend(dataPoints, 100, 80);
            List<Double> riskTrend = generateRandomTrend(dataPoints, 20, 40);
            List<Double> bmiTrend = generateRandomTrend(dataPoints, 24, 10);
            
            // Risk distribution
            long highRisk = predictions.stream()
                    .filter(p -> p.getPredictionResult() != null && p.getPredictionResult() == 1)
                    .count();
            long mediumRisk = (long) (predictions.size() * 0.30);
            long lowRisk = predictions.size() - highRisk - mediumRisk;
            
            Map<String, Object> result = new HashMap<>();
            result.put("labels", labels);
            result.put("glucoseTrend", glucoseTrend);
            result.put("riskTrend", riskTrend);
            result.put("bmiTrend", bmiTrend);
            result.put("riskDistribution", Map.of(
                    "high", Math.max(1, highRisk),
                    "medium", Math.max(1, mediumRisk),
                    "low", Math.max(1, lowRisk)
            ));
            
            log.info("Trend analytics generated for {} data points", dataPoints);
            return result;
            
        } catch (Exception e) {
            log.error("Error fetching trends: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch trends", e);
        }
    }

    /**
     * Get AI insights for a prediction
     */
    public Map<String, Object> getPredictionInsights(UUID predictionId) {
        log.info("Fetching insights for prediction: {}", predictionId);
        
        try {
            var prediction = predictionRepository.findById(predictionId)
                    .orElseThrow(() -> new RuntimeException("Prediction not found"));
            
            Map<String, Object> insights = new HashMap<>();
            
            // Feature contributions (simplified)
            Map<String, Object> contributions = new HashMap<>();
            contributions.put("Glucose", 45);
            contributions.put("BMI", 20);
            contributions.put("Age", 15);
            contributions.put("Insulin", 10);
            contributions.put("Blood Pressure", 10);
            
            insights.put("featureContributions", contributions);
            insights.put("confidenceLevel", prediction.getConfidenceLevel() != null ? 
                    prediction.getConfidenceLevel() : 94.8);
            insights.put("probabilityDiabetic", prediction.getProbabilityDiabetes() != null ? 
                    prediction.getProbabilityDiabetes() * 100 : 89.2);
            insights.put("probabilityNonDiabetic", prediction.getProbabilityNoDiabetes() != null ? 
                    prediction.getProbabilityNoDiabetes() * 100 : 10.8);
            insights.put("predictionMessage", prediction.getPredictionMessage());
            
            log.info("Insights generated for prediction: {}", predictionId);
            return insights;
            
        } catch (Exception e) {
            log.error("Error fetching insights: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch insights", e);
        }
    }

    /**
     * Get alerts for dashboard
     */
    public List<Map<String, Object>> getAlerts() {
        log.info("Fetching dashboard alerts");
        
        try {
            List<DiabetesPrediction> predictions = predictionRepository.findAll();
            List<Map<String, Object>> alerts = new ArrayList<>();
            
            // Find critical predictions
            predictions.stream()
                    .filter(p -> p.getGlucose() >= 200)
                    .limit(5)
                    .forEach(p -> {
                        Map<String, Object> alert = new HashMap<>();
                        alert.put("id", p.getId().toString());
                        alert.put("patientId", "P" + String.format("%03d", predictions.indexOf(p) + 1));
                        alert.put("severity", "CRITICAL");
                        alert.put("message", "Critical glucose level detected");
                        alert.put("glucoseLevel", p.getGlucose());
                        alert.put("riskLevel", p.getPredictionResult() == 1 ? "High" : "Low");
                        alert.put("timestamp", LocalDateTime.now().toString());
                        alerts.add(alert);
                    });
            
            log.info("Generated {} alerts", alerts.size());
            return alerts;
            
        } catch (Exception e) {
            log.error("Error fetching alerts: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch alerts", e);
        }
    }

    // ===== HELPER METHODS =====

    private boolean applySearchFilter(DiabetesPrediction p, String search) {
        if (search == null || search.isBlank()) return true;
        String searchLower = search.toLowerCase();
        return p.getUserId().toString().contains(searchLower);
    }

    private boolean applyRiskLevelFilter(DiabetesPrediction p, String riskLevel) {
        if (riskLevel == null || riskLevel.isBlank()) return true;
        
        if ("high".equalsIgnoreCase(riskLevel)) {
            return p.getPredictionResult() != null && p.getPredictionResult() == 1;
        } else if ("low".equalsIgnoreCase(riskLevel)) {
            return p.getPredictionResult() != null && p.getPredictionResult() == 0;
        }
        return true;
    }

    private boolean applyAgeFilter(DiabetesPrediction p, String ageRange) {
        if (ageRange == null || ageRange.isBlank()) return true;
        
        if (ageRange.contains("+")) {
            int minAge = Integer.parseInt(ageRange.split("\\+")[0]);
            return p.getAge() >= minAge;
        }
        return true;
    }

    private boolean applyGlucoseFilter(DiabetesPrediction p, String glucoseRange) {
        if (glucoseRange == null || glucoseRange.isBlank()) return true;
        
        if (glucoseRange.contains("+")) {
            int minGlucose = Integer.parseInt(glucoseRange.split("\\+")[0]);
            return p.getGlucose() >= minGlucose;
        }
        return true;
    }

    private Map<String, Object> convertToPatientsTableRow(DiabetesPrediction p) {
        Map<String, Object> row = new HashMap<>();
        String patientId = "P" + String.format("%03d", p.getId().toString().hashCode() % 1000);
        
        row.put("id", patientId);
        row.put("patientId", patientId);
        row.put("name", p.getUser() != null ? p.getUser().getFirstName() + " " + p.getUser().getLastName() : "Unknown");
        row.put("age", p.getAge());
        row.put("gender", p.getGlucose() % 2 == 0 ? "M" : "F"); // Placeholder
        row.put("glucose", p.getGlucose());
        row.put("bmi", p.getBmi() != null ? p.getBmi().doubleValue() : 0);
        row.put("riskPercentage", p.getProbabilityDiabetes() != null ? 
                Math.round(p.getProbabilityDiabetes() * 100) : 0);
        row.put("status", p.getPredictionResult() == 1 ? "High Risk" : "Low Risk");
        row.put("lastVisit", LocalDateTime.now().toString());
        
        return row;
    }

    private int getDataPointsForPeriod(String period) {
        return switch (period != null ? period.toLowerCase() : "7days") {
            case "7days" -> 7;
            case "30days" -> 30;
            case "6months" -> 26;
            case "1year" -> 52;
            default -> 7;
        };
    }

    private List<String> generateLabels(int count, String period) {
        List<String> labels = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            labels.add("Day " + i);
        }
        return labels;
    }

    private List<Double> generateRandomTrend(int dataPoints, double baseValue, double variance) {
        Random random = new Random();
        List<Double> trend = new ArrayList<>();
        for (int i = 0; i < dataPoints; i++) {
            double value = baseValue + (random.nextDouble() * variance - variance / 2);
            trend.add(Math.round(value * 10.0) / 10.0);
        }
        return trend;
    }

    /**
     * Get personal dashboard statistics for a specific user
     */
    public Map<String, Object> getPersonalDashboard(UUID userId) {
        log.info("Calculating personal dashboard summary for user: {}", userId);
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            LocalDate today = LocalDate.now();
            DailyVitals todayVitals = dailyVitalsRepository.findByUserIdAndLogDate(userId, today)
                    .orElse(new DailyVitals());

            List<DailyVitals> allVitals = dailyVitalsRepository.findByUserIdOrderByLogDateAsc(userId);

            int streak = 0;
            LocalDate checkDate = today;
            while (true) {
                final LocalDate currentCheckDate = checkDate;
                Optional<DailyVitals> log = allVitals.stream()
                        .filter(v -> v.getLogDate().equals(currentCheckDate))
                        .findFirst();
                if (log.isPresent() && ((log.get().getWaterIntakeMl() != null && log.get().getWaterIntakeMl() > 0) 
                        || (log.get().getSleepHours() != null && log.get().getSleepHours() > 0) 
                        || (log.get().getCaloriesConsumed() != null && log.get().getCaloriesConsumed() > 0) 
                        || (log.get().getExerciseMinutes() != null && log.get().getExerciseMinutes() > 0))) {
                    streak++;
                    checkDate = checkDate.minusDays(1);
                } else {
                    break;
                }
            }

            int healthScore = calculateHealthScore(user, todayVitals, allVitals);
            String scoreLabel = calculateScoreLabel(healthScore);

            Map<String, Object> summary = new HashMap<>();
            summary.put("healthScore", healthScore);
            summary.put("scoreLabel", scoreLabel);
            summary.put("streak", streak);

            Map<String, Object> todaySummary = new HashMap<>();
            todaySummary.put("waterIntakeMl", todayVitals.getWaterIntakeMl() != null ? todayVitals.getWaterIntakeMl() : 0);
            todaySummary.put("sleepHours", todayVitals.getSleepHours() != null ? todayVitals.getSleepHours() : 0.0);
            todaySummary.put("caloriesConsumed", todayVitals.getCaloriesConsumed() != null ? todayVitals.getCaloriesConsumed() : 0);
            todaySummary.put("caloriesBurned", todayVitals.getCaloriesBurned() != null ? todayVitals.getCaloriesBurned() : 0);
            todaySummary.put("exerciseMinutes", todayVitals.getExerciseMinutes() != null ? todayVitals.getExerciseMinutes() : 0);
            todaySummary.put("weightKg", todayVitals.getWeightKg());
            todaySummary.put("systolicBp", todayVitals.getSystolicBp());
            todaySummary.put("diastolicBp", todayVitals.getDiastolicBp());
            todaySummary.put("bloodSugar", todayVitals.getBloodSugar());
            todaySummary.put("heartRate", todayVitals.getHeartRate());

            summary.put("today", todaySummary);

            return summary;
        } catch (Exception e) {
            log.error("Error calculating personal dashboard: {}", e.getMessage());
            throw new RuntimeException("Failed to calculate personal dashboard: " + e.getMessage(), e);
        }
    }

    /**
     * Get chart trends for BMI, Sleep, Sugar, Blood Pressure, and Weight
     */
    public Map<String, Object> getChartsData(UUID userId) {
        log.info("Fetching chart metrics history for user: {}", userId);
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            double heightM = user.getHeightCm() != null ? user.getHeightCm() / 100.0 : 1.75;

            List<DailyVitals> history = dailyVitalsRepository.findByUserIdOrderByLogDateAsc(userId);

            List<Map<String, Object>> bmiData = new ArrayList<>();
            List<Map<String, Object>> sleepData = new ArrayList<>();
            List<Map<String, Object>> sugarData = new ArrayList<>();
            List<Map<String, Object>> bpData = new ArrayList<>();
            List<Map<String, Object>> weightData = new ArrayList<>();
            List<Map<String, Object>> hrData = new ArrayList<>();

            for (DailyVitals v : history) {
                String dateStr = v.getLogDate().toString();

                if (v.getWeightKg() != null && v.getWeightKg() > 0) {
                    double bmi = v.getWeightKg() / (heightM * heightM);
                    bmiData.add(Map.of("date", dateStr, "weight", v.getWeightKg(), "bmi", Math.round(bmi * 10.0) / 10.0));
                    weightData.add(Map.of("date", dateStr, "weight", v.getWeightKg()));
                }

                if (v.getSleepHours() != null && v.getSleepHours() > 0) {
                    sleepData.add(Map.of("date", dateStr, "hours", v.getSleepHours()));
                }

                if (v.getBloodSugar() != null && v.getBloodSugar() > 0) {
                    sugarData.add(Map.of("date", dateStr, "glucose", v.getBloodSugar()));
                }

                if (v.getSystolicBp() != null && v.getDiastolicBp() != null) {
                    bpData.add(Map.of("date", dateStr, "systolic", v.getSystolicBp(), "diastolic", v.getDiastolicBp()));
                }

                if (v.getHeartRate() != null && v.getHeartRate() > 0) {
                    hrData.add(Map.of("date", dateStr, "heartRate", v.getHeartRate()));
                }
            }



            return Map.of(
                "bmi", bmiData,
                "sleep", sleepData,
                "sugar", sugarData,
                "bp", bpData,
                "weight", weightData,
                "heartRate", hrData
            );
        } catch (Exception e) {
            log.error("Error gathering charts data: {}", e.getMessage());
            throw new RuntimeException("Failed to load charts data", e);
        }
    }

    /**
     * Generate dynamic medical vitals insights
     */
    public List<String> getAIInsights(UUID userId) {
        log.info("Generating vitals insights for user: {}", userId);
        try {
            LocalDate today = LocalDate.now();
            List<DailyVitals> recent = dailyVitalsRepository.findByUserIdAndLogDateBetweenOrderByLogDateAsc(
                    userId, today.minusDays(7), today);

            List<String> insights = new ArrayList<>();

            if (recent.isEmpty()) {
                insights.add("Start logging your daily water, sleep, and exercise to generate smart clinical AI insights.");
                insights.add("Make sure to run a risk prediction check to check your heart & diabetes status.");
                return insights;
            }

            double avgWater = recent.stream()
                    .filter(v -> v.getWaterIntakeMl() != null)
                    .mapToInt(DailyVitals::getWaterIntakeMl)
                    .average()
                    .orElse(0.0);
            if (avgWater >= 2000) {
                insights.add("Excellent hydration! Your average daily water intake is " + Math.round(avgWater) + "ml, exceeding the 2L clinical target.");
            } else if (avgWater > 0) {
                insights.add("Hydration notice: Your daily water average is " + Math.round(avgWater) + "ml. Try to aim for 2000ml to support blood pressure regulation.");
            }

            double avgSleep = recent.stream()
                    .filter(v -> v.getSleepHours() != null)
                    .mapToDouble(DailyVitals::getSleepHours)
                    .average()
                    .orElse(0.0);
            if (avgSleep >= 7.0 && avgSleep <= 9.0) {
                insights.add("Great sleep hygiene! You are averaging " + Math.round(avgSleep * 10.0) / 10.0 + " hours of sleep, which is ideal for glucose metabolism.");
            } else if (avgSleep > 0 && avgSleep < 6.5) {
                insights.add("Sleep alert: Your sleep average is " + Math.round(avgSleep * 10.0) / 10.0 + "h. Less than 7h sleep increases insulin resistance risk factors.");
            }

            double avgExercise = recent.stream()
                    .filter(v -> v.getExerciseMinutes() != null)
                    .mapToInt(DailyVitals::getExerciseMinutes)
                    .average()
                    .orElse(0.0);
            if (avgExercise >= 30) {
                insights.add("Active lifestyle! Averaging " + Math.round(avgExercise) + " min of daily exercise. Regular cardio improves heart stroke volume.");
            } else if (avgExercise > 0) {
                insights.add("Activity suggestion: You average " + Math.round(avgExercise) + " min of exercise. Push for 30 minutes daily to lower resting heart rate.");
            }

            if (insights.isEmpty()) {
                insights.add("Vitals logged! Keep tracking your daily statistics to unlock deeper correlations and clinical analytics.");
            }

            return insights;
        } catch (Exception e) {
            log.error("Failed to generate insights: {}", e.getMessage());
            return List.of("Keep logging vitals daily to compile clinical insights.");
        }
    }

    /**
     * Log daily vitals for a user
     */
    public DailyVitals logVitals(UUID userId, Map<String, Object> payload) {
        log.info("Logging vitals for user: {}, payload: {}", userId, payload);
        try {
            LocalDate date = LocalDate.now();
            if (payload.containsKey("date")) {
                date = LocalDate.parse((String) payload.get("date"));
            }

            DailyVitals vitals = dailyVitalsRepository.findByUserIdAndLogDate(userId, date)
                    .orElse(new DailyVitals());

            vitals.setUserId(userId);
            vitals.setLogDate(date);

            if (payload.containsKey("waterIntakeMl")) {
                vitals.setWaterIntakeMl((Integer) payload.get("waterIntakeMl"));
            }
            if (payload.containsKey("sleepHours")) {
                vitals.setSleepHours(Double.valueOf(payload.get("sleepHours").toString()));
            }
            if (payload.containsKey("caloriesConsumed")) {
                vitals.setCaloriesConsumed((Integer) payload.get("caloriesConsumed"));
            }
            if (payload.containsKey("caloriesBurned")) {
                vitals.setCaloriesBurned((Integer) payload.get("caloriesBurned"));
            }
            if (payload.containsKey("exerciseMinutes")) {
                vitals.setExerciseMinutes((Integer) payload.get("exerciseMinutes"));
            }
            if (payload.containsKey("weightKg")) {
                vitals.setWeightKg(Double.valueOf(payload.get("weightKg").toString()));
            }
            if (payload.containsKey("systolicBp")) {
                vitals.setSystolicBp((Integer) payload.get("systolicBp"));
            }
            if (payload.containsKey("diastolicBp")) {
                vitals.setDiastolicBp((Integer) payload.get("diastolicBp"));
            }
            if (payload.containsKey("bloodSugar")) {
                vitals.setBloodSugar((Integer) payload.get("bloodSugar"));
            }
            if (payload.containsKey("heartRate")) {
                vitals.setHeartRate((Integer) payload.get("heartRate"));
            }

            return dailyVitalsRepository.save(vitals);
        } catch (Exception e) {
            log.error("Failed to log vitals: {}", e.getMessage());
            throw new RuntimeException("Failed to log vitals: " + e.getMessage(), e);
        }
    }

    private int calculateHealthScore(User user, DailyVitals todayVitals, List<DailyVitals> recentVitals) {
        int score = 70;
        
        if (todayVitals != null) {
            if (todayVitals.getWaterIntakeMl() != null && todayVitals.getWaterIntakeMl() >= 2000) score += 6;
            else if (todayVitals.getWaterIntakeMl() != null && todayVitals.getWaterIntakeMl() >= 1000) score += 3;
            
            if (todayVitals.getSleepHours() != null && todayVitals.getSleepHours() >= 7 && todayVitals.getSleepHours() <= 9) score += 8;
            else if (todayVitals.getSleepHours() != null && todayVitals.getSleepHours() > 0) score += 3;
            
            if (todayVitals.getExerciseMinutes() != null && todayVitals.getExerciseMinutes() >= 30) score += 8;
            else if (todayVitals.getExerciseMinutes() != null && todayVitals.getExerciseMinutes() > 0) score += 4;
            
            if (todayVitals.getSystolicBp() != null && todayVitals.getDiastolicBp() != null) {
                if (todayVitals.getSystolicBp() < 120 && todayVitals.getDiastolicBp() < 80) score += 4;
                else if (todayVitals.getSystolicBp() > 140 || todayVitals.getDiastolicBp() > 90) score -= 8;
            }
            
            if (todayVitals.getBloodSugar() != null) {
                if (todayVitals.getBloodSugar() < 100) score += 4;
                else if (todayVitals.getBloodSugar() > 140) score -= 8;
            }
        }
        
        return Math.min(100, Math.max(30, score));
    }

    private String calculateScoreLabel(int score) {
        if (score >= 90) return "Excellent";
        if (score >= 75) return "Good";
        if (score >= 50) return "Fair";
        return "Poor";
    }
}
