package com.example.demo.service;

import com.example.demo.ai.OpenAiClient;
import com.example.demo.ai.AiMessage;
import com.example.demo.ai.AiProperties;
import com.example.demo.entity.User;
import com.example.demo.entity.NutritionPlan;
import com.example.demo.entity.FitnessPlan;
import com.example.demo.repository.UserRepositoryJPA;
import com.example.demo.repository.NutritionPlanRepositoryJPA;
import com.example.demo.repository.FitnessPlanRepositoryJPA;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlannerService {

    private final UserRepositoryJPA userRepository;
    private final NutritionPlanRepositoryJPA nutritionRepository;
    private final FitnessPlanRepositoryJPA fitnessRepository;
    private final OpenAiClient openAiClient;
    private final AiProperties aiProperties;
    private final ObjectMapper objectMapper;

    public NutritionPlan generateNutritionPlan(UUID userId) {
        log.info("Generating nutrition plan for user: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        NutritionPlan plan = new NutritionPlan();
        plan.setUserId(userId);

        if (!aiProperties.isConfigured()) {
            String mockJson = simulatedNutritionPlan(user);
            populateNutritionPlanFromJson(plan, mockJson);
            return nutritionRepository.save(plan);
        }

        String prompt = "You are an expert sports nutritionist and medical clinical dietitian. Generate a custom daily nutrition plan for the following patient:\n" +
                "- Name: " + user.getFirstName() + " " + user.getLastName() + "\n" +
                "- Height: " + (user.getHeightCm() != null ? user.getHeightCm() + " cm" : "Not specified") + "\n" +
                "- Weight: " + (user.getWeightKg() != null ? user.getWeightKg() + " kg" : "Not specified") + "\n" +
                "- Gender: " + (user.getGender() != null ? user.getGender() : "Not specified") + "\n" +
                "- Medical History: " + (user.getMedicalHistory() != null ? user.getMedicalHistory() : "None") + "\n" +
                "- Current Medications: " + (user.getCurrentMedications() != null ? user.getCurrentMedications() : "None") + "\n" +
                "- Allergies: " + (user.getAllergies() != null ? user.getAllergies() : "None") + "\n" +
                "- Exercise Level: " + (user.getExerciseLevel() != null ? user.getExerciseLevel() : "Sedentary") + "\n" +
                "- Smoking: " + (user.getSmokingStatus() != null ? user.getSmokingStatus() : "Never") + "\n" +
                "- Alcohol: " + (user.getAlcoholUse() != null ? user.getAlcoholUse() : "None") + "\n" +
                "- Water Intake Target: " + (user.getWaterIntakeLiters() != null ? user.getWaterIntakeLiters() + "L" : "2L") + "\n" +
                "- Sleep Target: " + (user.getSleepHours() != null ? user.getSleepHours() + "h" : "8h") + "\n\n" +
                "You MUST respond ONLY with a single JSON object in the following format:\n" +
                "{\n" +
                "  \"targetCalories\": 2000,\n" +
                "  \"targetProtein\": 130,\n" +
                "  \"targetCarbs\": 220,\n" +
                "  \"targetFats\": 65,\n" +
                "  \"meals\": [\n" +
                "    { \"type\": \"Breakfast\", \"time\": \"08:00\", \"calories\": 450, \"name\": \"...\", \"description\": \"...\" },\n" +
                "    { \"type\": \"Lunch\", \"time\": \"13:00\", \"calories\": 650, \"name\": \"...\", \"description\": \"...\" },\n" +
                "    { \"type\": \"Dinner\", \"time\": \"19:00\", \"calories\": 550, \"name\": \"...\", \"description\": \"...\" },\n" +
                "    { \"type\": \"Snack\", \"time\": \"16:00\", \"calories\": 350, \"name\": \"...\", \"description\": \"...\" }\n" +
                "  ]\n" +
                "}\n\n" +
                "Do not include any markdown framing or markdown code blocks (like ```json). Respond only with raw JSON.";

        try {
            String responseJson = openAiClient.complete(List.of(new AiMessage("user", prompt)), 0.4, true).block();
            String cleanJson = cleanJsonWrapper(responseJson);
            populateNutritionPlanFromJson(plan, cleanJson);
        } catch (Exception e) {
            log.error("Failed to generate nutrition plan using AI: {}", e.getMessage());
            populateNutritionPlanFromJson(plan, simulatedNutritionPlan(user));
        }

        return nutritionRepository.save(plan);
    }

    public FitnessPlan generateFitnessPlan(UUID userId) {
        log.info("Generating fitness plan for user: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        FitnessPlan plan = new FitnessPlan();
        plan.setUserId(userId);

        String difficulty = "Sedentary".equalsIgnoreCase(user.getExerciseLevel()) ? "BEGINNER" :
                "Light".equalsIgnoreCase(user.getExerciseLevel()) ? "BEGINNER" :
                "Moderate".equalsIgnoreCase(user.getExerciseLevel()) ? "INTERMEDIATE" : "ADVANCED";

        if (!aiProperties.isConfigured()) {
            String mockJson = simulatedFitnessPlan(user);
            populateFitnessPlanFromJson(plan, mockJson, difficulty);
            return fitnessRepository.save(plan);
        }

        String prompt = "You are an expert clinical exercise physiologist and personal trainer. Generate a custom weekly workout routine plan for the following patient:\n" +
                "- Name: " + user.getFirstName() + " " + user.getLastName() + "\n" +
                "- Height: " + (user.getHeightCm() != null ? user.getHeightCm() + " cm" : "Not specified") + "\n" +
                "- Weight: " + (user.getWeightKg() != null ? user.getWeightKg() + " kg" : "Not specified") + "\n" +
                "- Medical History: " + (user.getMedicalHistory() != null ? user.getMedicalHistory() : "None") + "\n" +
                "- Exercise Level: " + (user.getExerciseLevel() != null ? user.getExerciseLevel() : "Sedentary") + "\n" +
                "- Target Difficulty Level: " + difficulty + "\n\n" +
                "You MUST respond ONLY with a single JSON object in the following format:\n" +
                "{\n" +
                "  \"difficulty\": \"" + difficulty + "\",\n" +
                "  \"weeklyFrequency\": 4,\n" +
                "  \"routines\": [\n" +
                "    { \"day\": \"Monday\", \"workoutName\": \"...\", \"durationMinutes\": 45, \"caloriesBurned\": 350, \"exercises\": [\"...\", \"...\"] },\n" +
                "    { \"day\": \"Wednesday\", \"workoutName\": \"...\", \"durationMinutes\": 50, \"caloriesBurned\": 400, \"exercises\": [\"...\", \"...\"] },\n" +
                "    { \"day\": \"Friday\", \"workoutName\": \"...\", \"durationMinutes\": 40, \"caloriesBurned\": 300, \"exercises\": [\"...\", \"...\"] },\n" +
                "    { \"day\": \"Saturday\", \"workoutName\": \"...\", \"durationMinutes\": 60, \"caloriesBurned\": 500, \"exercises\": [\"...\", \"...\"] }\n" +
                "  ]\n" +
                "}\n\n" +
                "Do not include any markdown framing or markdown code blocks (like ```json). Respond only with raw JSON.";

        try {
            String responseJson = openAiClient.complete(List.of(new AiMessage("user", prompt)), 0.4, true).block();
            String cleanJson = cleanJsonWrapper(responseJson);
            populateFitnessPlanFromJson(plan, cleanJson, difficulty);
        } catch (Exception e) {
            log.error("Failed to generate fitness plan using AI: {}", e.getMessage());
            populateFitnessPlanFromJson(plan, simulatedFitnessPlan(user), difficulty);
        }

        return fitnessRepository.save(plan);
    }

    public Optional<NutritionPlan> getLatestNutritionPlan(UUID userId) {
        return nutritionRepository.findTopByUserIdOrderByCreatedAtDesc(userId);
    }

    public Optional<FitnessPlan> getLatestFitnessPlan(UUID userId) {
        return fitnessRepository.findTopByUserIdOrderByCreatedAtDesc(userId);
    }

    // Helpers
    private String cleanJsonWrapper(String responseJson) {
        if (responseJson == null) return "{}";
        String cleanJson = responseJson.trim();
        if (cleanJson.startsWith("```")) {
            int firstLineEnd = cleanJson.indexOf('\n');
            int lastBackticks = cleanJson.lastIndexOf("```");
            if (firstLineEnd != -1 && lastBackticks != -1 && lastBackticks > firstLineEnd) {
                cleanJson = cleanJson.substring(firstLineEnd, lastBackticks).trim();
            }
        }
        return cleanJson;
    }

    private void populateNutritionPlanFromJson(NutritionPlan plan, String json) {
        try {
            JsonNode rootNode = objectMapper.readTree(json);
            plan.setTargetCalories(rootNode.path("targetCalories").asInt(2000));
            plan.setTargetProtein(rootNode.path("targetProtein").asInt(120));
            plan.setTargetCarbs(rootNode.path("targetCarbs").asInt(220));
            plan.setTargetFats(rootNode.path("targetFats").asInt(65));
            plan.setMealsJson(objectMapper.writeValueAsString(rootNode.path("meals")));
        } catch (Exception e) {
            log.error("Failed to parse nutrition plan JSON: {}", e.getMessage());
            plan.setTargetCalories(2000);
            plan.setTargetProtein(120);
            plan.setTargetCarbs(220);
            plan.setTargetFats(65);
            plan.setMealsJson("[]");
        }
    }

    private void populateFitnessPlanFromJson(FitnessPlan plan, String json, String fallbackDifficulty) {
        try {
            JsonNode rootNode = objectMapper.readTree(json);
            plan.setDifficulty(rootNode.path("difficulty").asText(fallbackDifficulty));
            plan.setWeeklyFrequency(rootNode.path("weeklyFrequency").asInt(4));
            plan.setRoutinesJson(objectMapper.writeValueAsString(rootNode.path("routines")));
        } catch (Exception e) {
            log.error("Failed to parse fitness plan JSON: {}", e.getMessage());
            plan.setDifficulty(fallbackDifficulty);
            plan.setWeeklyFrequency(4);
            plan.setRoutinesJson("[]");
        }
    }

    private String simulatedNutritionPlan(User user) {
        int calories = 2000;
        int protein = 120;
        int carbs = 220;
        int fats = 65;

        if (user.getWeightKg() != null && user.getWeightKg() > 90) {
            calories = 2400;
            protein = 150;
            carbs = 260;
            fats = 75;
        }

        boolean hasDiabetes = user.getMedicalHistory() != null && user.getMedicalHistory().toLowerCase().contains("diabet");
        if (hasDiabetes) {
            carbs = (int)(carbs * 0.55);
            calories = (int)(calories * 0.85);
            protein = (int)(protein * 1.1);
        }

        return "{\n" +
                "  \"targetCalories\": " + calories + ",\n" +
                "  \"targetProtein\": " + protein + ",\n" +
                "  \"targetCarbs\": " + carbs + ",\n" +
                "  \"targetFats\": " + fats + ",\n" +
                "  \"meals\": [\n" +
                "    { \"type\": \"Breakfast\", \"time\": \"08:00\", \"calories\": " + (int)(calories * 0.25) + ", \"name\": \"Oatmeal with Almonds & Berries\", \"description\": \"Organic rolled oats, unsweetened almond milk, topped with fresh blueberries, chia seeds, and protein scoop.\" },\n" +
                "    { \"type\": \"Lunch\", \"time\": \"13:00\", \"calories\": " + (int)(calories * 0.35) + ", \"name\": \"Grilled Chicken Breast Salad\", \"description\": \"Grilled chicken fillet over organic spinach, cucumbers, cherry tomatoes, and light olive oil dressing.\" },\n" +
                "    { \"type\": \"Dinner\", \"time\": \"19:00\", \"calories\": " + (int)(calories * 0.30) + ", \"name\": \"Baked Salmon with Quinoa & Asparagus\", \"description\": \"Wild-caught salmon baked with garlic and herbs, served with asparagus and seasoned quinoa.\" },\n" +
                "    { \"type\": \"Snack\", \"time\": \"16:00\", \"calories\": " + (int)(calories * 0.10) + ", \"name\": \"Greek Yogurt with Walnuts\", \"description\": \"Plain non-fat Greek yogurt mixed with crushed walnuts and cinnamon.\" }\n" +
                "  ]\n" +
                "}";
    }

    private String simulatedFitnessPlan(User user) {
        String diff = "Sedentary".equalsIgnoreCase(user.getExerciseLevel()) ? "BEGINNER" :
                "Light".equalsIgnoreCase(user.getExerciseLevel()) ? "BEGINNER" :
                "Moderate".equalsIgnoreCase(user.getExerciseLevel()) ? "INTERMEDIATE" : "ADVANCED";

        return "{\n" +
                "  \"difficulty\": \"" + diff + "\",\n" +
                "  \"weeklyFrequency\": 4,\n" +
                "  \"routines\": [\n" +
                "    { \"day\": \"Monday\", \"workoutName\": \"Full Body Functional Strength\", \"durationMinutes\": 45, \"caloriesBurned\": 350, \"exercises\": [\"Bodyweight Squats: 3 sets of 12 reps\", \"Incline Push-ups: 3 sets of 10 reps\", \"Plank Hold: 3 sets of 45 seconds\", \"Dumbbell Row: 3 sets of 12 reps\"] },\n" +
                "    { \"day\": \"Wednesday\", \"workoutName\": \"Low-Impact Steady State Cardio\", \"durationMinutes\": 40, \"caloriesBurned\": 280, \"exercises\": [\"Brisk Walking or Cycling: 30 minutes at moderate intensity\", \"Dynamic Stretching: 10 minutes\"] },\n" +
                "    { \"day\": \"Friday\", \"workoutName\": \"Core and Stability Control\", \"durationMinutes\": 35, \"caloriesBurned\": 220, \"exercises\": [\"Bird-Dog: 3 sets of 10 reps per side\", \"Glute Bridges: 3 sets of 15 reps\", \"Deadbug Exercise: 3 sets of 12 reps\"] },\n" +
                "    { \"day\": \"Saturday\", \"workoutName\": \"Active Recovery & Mobility Flow\", \"durationMinutes\": 30, \"caloriesBurned\": 150, \"exercises\": [\"Yoga Sun Salutations: 15 minutes\", \"Full Body Foam Rolling: 15 minutes\"] }\n" +
                "  ]\n" +
                "}";
    }
}
