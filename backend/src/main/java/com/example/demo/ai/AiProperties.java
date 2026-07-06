package com.example.demo.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Central AI configuration. Values come from env vars (see application.properties).
 * When no API key is present the app runs in a graceful "demo" mode: the AI
 * endpoints still respond with helpful, clearly-labelled fallback content, so
 * the whole product is usable and demoable without a key — and lights up the
 * moment OPENAI_API_KEY is set.
 */
@Component
public class AiProperties {

    @Value("${openai.api-key:}")
    private String apiKey;

    @Value("${openai.base-url:https://api.openai.com/v1}")
    private String baseUrl;

    @Value("${openai.model:gpt-4o-mini}")
    private String model;

    @Value("${openai.temperature:0.4}")
    private double temperature;

    @Value("${openai.max-tokens:900}")
    private int maxTokens;

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    public String getApiKey() {
        return apiKey;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public String getModel() {
        return model;
    }

    public double getTemperature() {
        return temperature;
    }

    public int getMaxTokens() {
        return maxTokens;
    }
}
