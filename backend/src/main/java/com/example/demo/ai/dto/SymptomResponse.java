package com.example.demo.ai.dto;

import java.util.List;

/**
 * Structured, non-diagnostic symptom guidance returned to the client.
 * `urgency` is one of: LOW, MODERATE, URGENT, EMERGENCY.
 */
public record SymptomResponse(
        String summary,
        String urgency,
        String urgencyReason,
        List<Condition> possibleConditions,
        List<String> recommendedActions,
        List<String> selfCare,
        List<String> seekCareIf,
        String disclaimer,
        boolean aiGenerated
) {
    public record Condition(String name, String likelihood, String description) {
    }
}
