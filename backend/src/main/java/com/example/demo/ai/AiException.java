package com.example.demo.ai;

/** Raised when the upstream AI provider fails; carries a user-safe message. */
public class AiException extends RuntimeException {
    public AiException(String message) {
        super(message);
    }

    public AiException(String message, Throwable cause) {
        super(message, cause);
    }
}
