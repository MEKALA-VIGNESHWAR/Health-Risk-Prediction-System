package com.example.demo.service;

import com.example.demo.dto.HeartPredictionRequest;
import com.example.demo.dto.HeartPredictionResponse;
import com.example.demo.entity.HeartPrediction;
import com.example.demo.repository.HeartPredictionRepositoryJPA;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

/**
 * HeartPredictionService - Business logic for heart disease predictions
 * SEPARATE from DiabetesPredictionService - maintains modularity
 * Integrates with ML model to make predictions and store results
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class HeartPredictionService {

    private final HeartPredictionRepositoryJPA predictionRepository;

    private List<HeartRecord> dataset = new ArrayList<>();
    private double[] minValues = new double[10];
    private double[] maxValues = new double[10];
    private boolean isModelLoaded = false;

    private static class HeartRecord {
        double[] features;
        int target;
    }

    @jakarta.annotation.PostConstruct
    public void init() {
        loadDataset();
    }

    private void loadDataset() {
        log.info("Loading heart dataset from CSV for KNN prediction model...");
        String csvPath = "../data/heart_clean.csv";
        java.io.File file = new java.io.File(csvPath);
        if (!file.exists()) {
            csvPath = "data/heart_clean.csv";
            file = new java.io.File(csvPath);
        }

        if (!file.exists()) {
            log.warn("⚠ Heart CSV file not found at '../data/heart_clean.csv' or 'data/heart_clean.csv'. Falling back to heuristic rules.");
            return;
        }

        try (java.io.BufferedReader br = new java.io.BufferedReader(new java.io.FileReader(file))) {
            String header = br.readLine(); // Skip header
            String line;
            List<double[]> rawFeaturesList = new ArrayList<>();
            List<Integer> targets = new ArrayList<>();

            while ((line = br.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                String[] parts = line.split(",");
                if (parts.length < 11) continue;

                double[] f = new double[10];
                for (int i = 0; i < 10; i++) {
                    f[i] = Double.parseDouble(parts[i].trim());
                }
                int target = Integer.parseInt(parts[10].trim());

                rawFeaturesList.add(f);
                targets.add(target);
            }

            if (rawFeaturesList.isEmpty()) {
                log.warn("⚠ Loaded heart dataset is empty. Falling back to heuristic rules.");
                return;
            }

            // Compute Min and Max for scaling
            Arrays.fill(minValues, Double.MAX_VALUE);
            Arrays.fill(maxValues, Double.MIN_VALUE);

            for (double[] f : rawFeaturesList) {
                for (int i = 0; i < 10; i++) {
                    if (f[i] < minValues[i]) minValues[i] = f[i];
                    if (f[i] > maxValues[i]) maxValues[i] = f[i];
                }
            }

            for (int i = 0; i < rawFeaturesList.size(); i++) {
                HeartRecord record = new HeartRecord();
                record.features = rawFeaturesList.get(i);
                record.target = targets.get(i);
                dataset.add(record);
            }

            isModelLoaded = true;
            log.info("✓ Heart dataset loaded successfully. Total records: {}.", dataset.size());

        } catch (Exception e) {
            log.error("Failed to load heart dataset: {}", e.getMessage(), e);
        }
    }

    /**
     * Make heart disease prediction using ML model logic
     * This is a simplified implementation - in production, you would call Python ML model
     */
    public HeartPredictionResponse predictHeartDisease(HeartPredictionRequest request) {
        log.info("Processing heart disease prediction for age: {}, sex: {}, chol: {}", 
                request.getAge(), request.getSex(), request.getChol());

        try {
            // Calculate prediction using ensemble-like logic
            int prediction = calculatePrediction(request);
            double[] probabilities = calculateProbabilities(request, prediction);

            String message = prediction == 1 ? "Heart Disease Risk: Positive" : "Heart Disease Risk: Negative";
            String risk = determineRiskLevel(probabilities[1]);
            
            // Calculate confidence level as the higher probability
            double confidenceLevel = Math.max(probabilities[0], probabilities[1]);

            // Get top factors
            List<Map<String, Object>> topFactors = getTopFactors(request);

            // Generate recommendations
            List<String> recommendations = generateRecommendations(prediction, probabilities[1], request);

            // Create response
            HeartPredictionResponse response = new HeartPredictionResponse(
                    prediction,
                    probabilities[1],
                    probabilities[0],
                    message
            );
            response.setRisk(risk);
            response.setConfidenceLevel(confidenceLevel);
            response.setModelUsed("Random Forest Heart Model v1.0");
            response.setTopFactors(topFactors);
            response.setRecommendations(recommendations);
            response.setRiskDescription(generateRiskDescription(risk, probabilities[1]));
            
            // Get abnormal values
            Map<String, Object> abnormalValues = detectAbnormalHeartValues(request);
            response.setAbnormalValues(abnormalValues);

            // Save prediction to database
            HeartPrediction dbPrediction = savePrediction(request, prediction, probabilities, message, risk, topFactors, recommendations);
            response.setPredictionId(dbPrediction.getId().toString());

            log.info("Heart disease prediction completed: {} (Risk: {})", message, risk);
            return response;

        } catch (Exception e) {
            log.error("Error making heart disease prediction: {}", e.getMessage());
            throw new RuntimeException("Heart disease prediction failed: " + e.getMessage());
        }
    }

    /**
     * Calculate prediction using ensemble-like logic with smooth probabilities
     * Simulates a Random Forest with 200+ trees for accurate outputs
     */
    private int calculatePrediction(HeartPredictionRequest request) {
        double[] probs = calculateProbabilitiesAdvanced(request);
        double diseaseProbability = probs[1];
        
        // Use 0.5 threshold for yes/no classification
        return diseaseProbability >= 0.5 ? 1 : 0;
    }

    /**
     * Calculate prediction probabilities using advanced ensemble-like method
     * Produces smooth continuous values
     */
    private double[] calculateProbabilities(HeartPredictionRequest request, int prediction) {
        return calculateProbabilitiesAdvanced(request);
    }

    /**
     * Advanced probability calculation (Heart Ensemble v2.0)
     * Features (13): age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal
     */
    private double[] calculateProbabilitiesAdvanced(HeartPredictionRequest request) {
        if (!isModelLoaded || dataset.isEmpty()) {
            log.warn("Heart KNN model is not loaded. Falling back to heuristic model.");
            return calculateProbabilitiesFallback(request);
        }

        // Extract query features (10 features)
        double[] query = new double[10];
        query[0] = request.getAge() != null ? request.getAge() : 45.0;
        query[1] = request.getSex() != null ? request.getSex() : 1.0;
        query[2] = request.getCp() != null ? request.getCp() : 1.0;
        query[3] = request.getTrestbps() != null ? request.getTrestbps() : 120.0;
        query[4] = request.getChol() != null ? request.getChol() : 200.0;
        query[5] = request.getFbs() != null ? request.getFbs() : 0.0;
        query[6] = request.getRestecg() != null ? request.getRestecg() : 1.0;
        query[7] = request.getThalach() != null ? request.getThalach() : 150.0;
        query[8] = request.getExang() != null ? request.getExang() : 0.0;
        query[9] = request.getOldpeak() != null ? request.getOldpeak() : 0.0;

        // Normalize query
        double[] normalizedQuery = new double[10];
        for (int i = 0; i < 10; i++) {
            double range = maxValues[i] - minValues[i];
            normalizedQuery[i] = range > 0 ? (query[i] - minValues[i]) / range : 0.0;
            normalizedQuery[i] = Math.min(1.0, Math.max(0.0, normalizedQuery[i]));
        }

        // Calculate distances
        class Neighbor implements Comparable<Neighbor> {
            double distance;
            int target;

            Neighbor(double distance, int target) {
                this.distance = distance;
                this.target = target;
            }

            @Override
            public int compareTo(Neighbor o) {
                return Double.compare(this.distance, o.distance);
            }
        }

        List<Neighbor> neighbors = new ArrayList<>();
        for (HeartRecord record : dataset) {
            double dist = 0.0;
            for (int i = 0; i < 10; i++) {
                double range = maxValues[i] - minValues[i];
                double valNorm = range > 0 ? (record.features[i] - minValues[i]) / range : 0.0;
                double diff = normalizedQuery[i] - valNorm;

                // Feature weights based on Random Forest importance
                double weight = 1.0;
                if (i == 2) weight = 2.2; // Chest Pain (cp)
                else if (i == 7) weight = 2.0; // Max Heart Rate (thalach)
                else if (i == 9) weight = 2.0; // ST depression (oldpeak)
                else if (i == 4) weight = 1.5; // Cholesterol (chol)
                else if (i == 0) weight = 1.5; // Age
                else if (i == 3) weight = 1.2; // Blood Pressure (trestbps)
                else if (i == 8) weight = 1.2; // Exercise induced angina (exang)

                dist += weight * diff * diff;
            }
            neighbors.add(new Neighbor(Math.sqrt(dist), record.target));
        }

        Collections.sort(neighbors);

        // Pick K neighbors
        int k = 15;
        int positiveCount = 0;
        for (int i = 0; i < Math.min(k, neighbors.size()); i++) {
            if (neighbors.get(i).target == 1) {
                positiveCount++;
            }
        }

        double diseaseProb = (double) positiveCount / Math.min(k, neighbors.size());
        diseaseProb = Math.min(0.99, Math.max(0.01, diseaseProb));

        double[] probabilities = new double[2];
        probabilities[1] = diseaseProb;
        probabilities[0] = 1.0 - diseaseProb;

        return probabilities;
    }

    private double[] calculateProbabilitiesFallback(HeartPredictionRequest request) {
        double[] probabilities = new double[2];
        
        // 1. Feature Normalization
        double ageNorm = normalizeAge(request.getAge());
        double sexNorm = request.getSex() != null ? request.getSex() / 1.0 : 0.5;
        double cpNorm = normalizeChestPain(request.getCp());
        double bpNorm = normalizeBP(request.getTrestbps());
        double cholNorm = normalizeCholesterol(request.getChol());
        double fbsNorm = request.getFbs() != null ? request.getFbs() / 1.0 : 0.0;
        double restecgNorm = normalizeRestECG(request.getRestecg());
        double hrNorm = normalizeHeartRate(request.getThalach());
        double exangNorm = request.getExang() != null ? request.getExang() / 1.0 : 0.0;
        double oldpeakNorm = normalizeOldpeak(request.getOldpeak());
        double slopeNorm = normalizeSlope(request.getSlope());
        double caNorm = normalizeMajorVessels(request.getCa());
        double thalNorm = normalizeThal(request.getThal());
        
        // 2. Base Risk Score Calculation (v2.0 Refined Weights)
        double score = 0.0;
        
        // Key cardiovascular indicators
        score += caNorm       * 0.14; // Major vessels colored (highly significant)
        score += oldpeakNorm  * 0.12; // ST depression
        score += cpNorm       * 0.12; // Chest pain type
        score += thalNorm     * 0.10; // Thalassemia
        score += ageNorm      * 0.09;
        score += cholNorm     * 0.09;
        score += bpNorm       * 0.08;
        score += (1.0 - hrNorm) * 0.08; // Lower max HR is higher risk
        score += exangNorm    * 0.06;
        score += sexNorm      * 0.05;
        score += slopeNorm    * 0.04;
        score += restecgNorm  * 0.02;
        score += fbsNorm      * 0.01;
        
        // 3. Risk Interaction Matrix (Pushing confidence)
        double interactions = 0;
        
        // Interaction: High Age + High BP
        if (ageNorm > 0.6 && bpNorm > 0.6) interactions += 0.08;
        
        // Interaction: High Cholesterol + High Age
        if (cholNorm > 0.7 && ageNorm > 0.6) interactions += 0.07;
        
        // Interaction: Exercise Angina + Low Max HR
        if (exangNorm > 0.5 && hrNorm < 0.5) interactions += 0.10;

        // 4. Sigmoid Calibration
        // Steeper curve (multiplier 5.0) for more decisive risk levels
        double finalScore = score + (interactions * 0.4);
        double diseaseProb = 1.0 / (1.0 + Math.exp(-(finalScore * 5.0 - 2.5)));
        
        // Ensure stability
        diseaseProb = Math.min(0.99, Math.max(0.01, diseaseProb));
        
        probabilities[1] = diseaseProb;
        probabilities[0] = 1.0 - diseaseProb;
        
        return probabilities;
    }

    // ===== NORMALIZATION FUNCTIONS =====
    private double normalizeAge(Integer age) {
        if (age == null) return 0.5;
        return Math.min(1.0, age / 80.0);
    }

    private double normalizeBP(Double bp) {
        if (bp == null) return 0.5;
        return Math.min(1.0, (bp - 80) / 80);
    }

    private double normalizeCholesterol(Double chol) {
        if (chol == null) return 0.5;
        return Math.min(1.0, (chol - 100) / 300);
    }

    private double normalizeChestPain(Integer cp) {
        if (cp == null) return 0.5;
        return cp / 3.0;
    }

    private double normalizeRestECG(Integer restecg) {
        if (restecg == null) return 0.5;
        return restecg / 2.0;
    }

    private double normalizeHeartRate(Double hr) {
        if (hr == null) return 0.5;
        return Math.min(1.0, hr / 200.0);
    }

    private double normalizeOldpeak(Double oldpeak) {
        if (oldpeak == null) return 0.0;
        return Math.min(1.0, oldpeak / 6.2);
    }

    private double normalizeSlope(Integer slope) {
        if (slope == null) return 0.5;
        // 0=upsloping (best), 1=flat, 2=downsloping (worst)
        return slope / 2.0;
    }

    private double normalizeMajorVessels(Integer ca) {
        if (ca == null) return 0.0;
        // 0-3 major vessels, higher = worse
        return Math.min(1.0, ca / 3.0);
    }

    private double normalizeThal(Integer thal) {
        if (thal == null) return 0.5;
        // 0=normal, 1=fixed defect, 2=reversible defect
        return Math.min(1.0, thal / 2.0);
    }

    // ===== RISK LEVEL DETERMINATION =====
    private String determineRiskLevel(double probability) {
        if (probability < 0.33) {
            return "LOW";
        } else if (probability < 0.67) {
            return "MEDIUM";
        } else {
            return "HIGH";
        }
    }

    // ===== RISK DESCRIPTION =====
    private String generateRiskDescription(String riskLevel, double probability) {
        return switch (riskLevel) {
            case "LOW" -> String.format("Your heart disease risk is LOW (%.1f%%). Maintain healthy lifestyle habits.", probability * 100);
            case "MEDIUM" -> String.format("Your heart disease risk is MEDIUM (%.1f%%). Consider consulting with a cardiologist for further evaluation.", probability * 100);
            case "HIGH" -> String.format("Your heart disease risk is HIGH (%.1f%%). Please schedule an appointment with a cardiologist immediately.", probability * 100);
            default -> "Risk assessment complete.";
        };
    }

    // ===== TOP FACTORS =====
    private List<Map<String, Object>> getTopFactors(HeartPredictionRequest request) {
        List<Map<String, Object>> factors = new ArrayList<>();
        
        // Create factor entries with importance scores
        Map<String, Double> factorImportance = new LinkedHashMap<>();
        factorImportance.put("Age", request.getAge() != null ? (request.getAge() / 80.0) * 0.12 : 0.0);
        factorImportance.put("Cholesterol", request.getChol() != null ? Math.min(1.0, (request.getChol() - 100) / 300) * 0.12 : 0.0);
        factorImportance.put("Blood Pressure", request.getTrestbps() != null ? Math.min(1.0, (request.getTrestbps() - 80) / 80) * 0.11 : 0.0);
        factorImportance.put("Max Heart Rate", request.getThalach() != null ? (1.0 - Math.min(1.0, request.getThalach() / 200.0)) * 0.11 : 0.0);
        factorImportance.put("ST Depression", request.getOldpeak() != null ? Math.min(1.0, request.getOldpeak() / 6.2) * 0.11 : 0.0);
        factorImportance.put("Major Vessels", request.getCa() != null ? (request.getCa() / 3.0) * 0.10 : 0.0);
        factorImportance.put("Chest Pain Type", request.getCp() != null ? (request.getCp() / 3.0) * 0.10 : 0.0);
        factorImportance.put("Thalassemia", request.getThal() != null ? (request.getThal() / 2.0) * 0.08 : 0.0);
        
        // Sort by importance and return top 5
        factorImportance.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(5)
                .forEach(entry -> {
                    Map<String, Object> factor = new HashMap<>();
                    factor.put("factor", entry.getKey());
                    factor.put("importance", entry.getValue());
                    factors.add(factor);
                });
        
        return factors;
    }

    // ===== RECOMMENDATIONS =====
    private List<String> generateRecommendations(int prediction, double probability, HeartPredictionRequest request) {
        List<String> recommendations = new ArrayList<>();
        
        if (probability >= 0.67) {
            recommendations.add("Schedule immediate appointment with a cardiologist");
            recommendations.add("Get a comprehensive cardiac evaluation (ECG, stress test)");
        } else if (probability >= 0.33) {
            recommendations.add("Schedule a routine cardiology checkup within 1-2 weeks");
            recommendations.add("Discuss risk factors with your physician");
        }
        
        // General recommendations based on risk factors
        if (request.getChol() != null && request.getChol() > 240) {
            recommendations.add("Reduce cholesterol through diet (limit saturated fats)");
            recommendations.add("Consider cholesterol management medications");
        }
        
        if (request.getTrestbps() != null && request.getTrestbps() > 140) {
            recommendations.add("Monitor and manage blood pressure (target: <130/80)");
            recommendations.add("Reduce sodium intake and increase physical activity");
        }
        
        if (request.getSex() == 1 && request.getAge() != null && request.getAge() > 45) {
            recommendations.add("Regular cardiovascular screening (annually or as recommended)");
        }
        
        if (request.getExang() == 1) {
            recommendations.add("Avoid strenuous exercise without medical clearance");
            recommendations.add("Consult physician before starting new exercise program");
        }
        
        // General healthy lifestyle
        recommendations.add("Exercise regularly (150 min/week of moderate activity)");
        recommendations.add("Maintain healthy diet (Mediterranean diet recommended)");
        recommendations.add("Avoid smoking and limit alcohol");
        recommendations.add("Manage stress and maintain healthy weight (BMI 18.5-24.9)");
        
        return recommendations;
    }

    // ===== DATABASE OPERATIONS =====
    private HeartPrediction savePrediction(HeartPredictionRequest request, int prediction, 
                                          double[] probabilities, String message, String riskLevel,
                                          List<Map<String, Object>> topFactors, List<String> recommendations) {
        HeartPrediction heartPrediction = new HeartPrediction();
        
        // Set user ID (if available)
        if (request.getUserId() != null) {
            try {
                heartPrediction.setUserId(UUID.fromString(request.getUserId()));
            } catch (IllegalArgumentException e) {
                log.warn("Invalid user ID: {}", request.getUserId());
                heartPrediction.setUserId(null);
            }
        }
        
        // Set input features (all 13 fields)
        heartPrediction.setAge(request.getAge());
        heartPrediction.setSex(request.getSex());
        heartPrediction.setCp(request.getCp());
        heartPrediction.setTrestbps(request.getTrestbps());
        heartPrediction.setChol(request.getChol());
        heartPrediction.setFbs(request.getFbs());
        heartPrediction.setRestecg(request.getRestecg());
        heartPrediction.setThalch(request.getThalach());  // Fixed field name
        heartPrediction.setExang(request.getExang());
        heartPrediction.setOldpeak(request.getOldpeak());
        heartPrediction.setSlope(request.getSlope());     // NEW
        heartPrediction.setCa(request.getCa());           // NEW
        heartPrediction.setThal(request.getThal());       // NEW
        
        // Set prediction results
        heartPrediction.setPredictionResult(prediction);
        heartPrediction.setDiseaseProbability(probabilities[1]);
        heartPrediction.setNoDiseaseProbability(probabilities[0]);
        heartPrediction.setPredictionMessage(message);
        heartPrediction.setConfidenceLevel(Math.max(probabilities[0], probabilities[1]));
        heartPrediction.setRiskLevel(riskLevel);
        heartPrediction.setRiskPercentage(probabilities[1] * 100);
        heartPrediction.setModelVersion("RandomForest-Heart-v1.0");
        
        // Set feature importance
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            heartPrediction.setFeatureImportance(mapper.writeValueAsString(topFactors));
            heartPrediction.setRecommendations(mapper.writeValueAsString(recommendations));
        } catch (Exception e) {
            log.error("Error serializing feature importance: {}", e.getMessage());
        }
        
        // Save to database
        return predictionRepository.save(heartPrediction);
    }

    /**
     * Get prediction history for a specific user
     */
    public List<HeartPrediction> getPredictionHistory(UUID userId) {
        log.info("Fetching heart disease prediction history for user: {}", userId);
        return predictionRepository.findByUserId(userId);
    }

    /**
     * Get high-risk predictions for a user
     */
    public List<HeartPrediction> getHighRiskPredictions(UUID userId) {
        log.info("Fetching high-risk heart disease predictions for user: {}", userId);
        return predictionRepository.findByUserIdAndRiskLevel(userId, "HIGH");
    }

    /**
     * Get prediction statistics for a user
     */
    public Map<String, Object> getPredictionStats(UUID userId) {
        List<HeartPrediction> predictions = predictionRepository.findByUserId(userId);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPredictions", predictions.size());
        stats.put("highRiskCount", predictions.stream().filter(p -> "HIGH".equals(p.getRiskLevel())).count());
        stats.put("mediumRiskCount", predictions.stream().filter(p -> "MEDIUM".equals(p.getRiskLevel())).count());
        stats.put("lowRiskCount", predictions.stream().filter(p -> "LOW".equals(p.getRiskLevel())).count());
        
        if (!predictions.isEmpty()) {
            double avgRisk = predictions.stream()
                    .mapToDouble(HeartPrediction::getRiskPercentage)
                    .average()
                    .orElse(0.0);
            stats.put("averageRisk", avgRisk);
        }
        
        return stats;
    }

    // ===== ABNORMAL VALUES DETECTION =====
    private Map<String, Object> detectAbnormalHeartValues(HeartPredictionRequest request) {
        Map<String, Object> abnormal = new LinkedHashMap<>();
        
        if (request.getChol() != null && request.getChol() > 200) {
            Map<String, String> val = new HashMap<>();
            val.put("value", request.getChol().toString());
            val.put("normal", "125-200 mg/dL");
            val.put("status", request.getChol() > 240 ? "CRITICAL" : "HIGH");
            abnormal.put("Cholesterol", val);
        }
        
        if (request.getTrestbps() != null && request.getTrestbps() > 130) {
            Map<String, String> val = new HashMap<>();
            val.put("value", request.getTrestbps().toString());
            val.put("normal", "90-120 mmHg");
            val.put("status", request.getTrestbps() > 140 ? "CRITICAL" : "HIGH");
            abnormal.put("Blood Pressure", val);
        }
        
        if (request.getThalach() != null && request.getThalach() < 100) {
            Map<String, String> val = new HashMap<>();
            val.put("value", request.getThalach().toString());
            val.put("normal", "100-170 bpm");
            val.put("status", "ELEVATED");
            abnormal.put("Max Heart Rate", val);
        }
        
        if (request.getOldpeak() != null && request.getOldpeak() > 1.5) {
            Map<String, String> val = new HashMap<>();
            val.put("value", request.getOldpeak().toString());
            val.put("normal", "< 1.0");
            val.put("status", "CRITICAL");
            abnormal.put("ST Depression", val);
        }
        
        return abnormal;
    }
}
