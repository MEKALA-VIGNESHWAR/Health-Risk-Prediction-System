package com.example.demo.ai.dto;

/**
 * Chat request from the client. `conversationId` scopes the server-side memory
 * so the assistant remembers context within a session; the client generates a
 * stable id per chat session.
 */
public record ChatRequest(String conversationId, String message) {
}
