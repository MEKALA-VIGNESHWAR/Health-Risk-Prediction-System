package com.example.demo.ai;

/**
 * A single turn in a chat conversation, mirroring the OpenAI chat message shape.
 * role is one of: system, user, assistant.
 */
public record AiMessage(String role, String content) {
    public static AiMessage system(String content) {
        return new AiMessage("system", content);
    }

    public static AiMessage user(String content) {
        return new AiMessage("user", content);
    }

    public static AiMessage assistant(String content) {
        return new AiMessage("assistant", content);
    }
}
