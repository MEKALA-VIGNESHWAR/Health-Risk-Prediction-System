package com.example.demo.ai.dto;

/**
 * Free-text symptom description plus optional light context. Everything except
 * `text` is optional and may be null.
 */
public record SymptomRequest(String text, Integer age, String sex, String duration) {
}
