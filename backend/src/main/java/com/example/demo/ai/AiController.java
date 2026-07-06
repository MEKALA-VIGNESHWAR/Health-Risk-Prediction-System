package com.example.demo.ai;

import com.example.demo.ai.dto.ChatRequest;
import com.example.demo.ai.dto.SymptomRequest;
import com.example.demo.ai.dto.SymptomResponse;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Map;

/**
 * AI endpoints: streaming health-assistant chat and structured symptom triage.
 * Additive and self-contained — does not touch existing controllers/services.
 * Everything degrades gracefully when no OPENAI_API_KEY is configured.
 */
@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AiController {

    private final ChatService chatService;
    private final SymptomService symptomService;
    private final AiProperties props;
    private final ObjectMapper mapper;

    public AiController(ChatService chatService, SymptomService symptomService,
                        AiProperties props, ObjectMapper mapper) {
        this.chatService = chatService;
        this.symptomService = symptomService;
        this.props = props;
        this.mapper = mapper;
    }

    @GetMapping("/status")
    public Map<String, Object> status() {
        return Map.of(
                "configured", props.isConfigured(),
                "model", props.getModel());
    }

    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> chat(@RequestBody ChatRequest request, Authentication auth) {
        String userKey = userKey(auth);
        return chatService.stream(userKey, request)
                .map(delta -> sse(Map.of("delta", delta)))
                .concatWith(Mono.just(done()))
                .onErrorResume(err -> Flux.just(
                        sse(Map.of("error", safeMessage(err))),
                        done()));
    }

    @PostMapping("/chat/reset")
    public Map<String, Object> resetChat(@RequestBody ChatRequest request, Authentication auth) {
        chatService.reset(userKey(auth), request.conversationId());
        return Map.of("ok", true);
    }

    @PostMapping("/symptoms")
    public Mono<SymptomResponse> symptoms(@RequestBody SymptomRequest request) {
        return symptomService.analyze(request);
    }

    // ── helpers ─────────────────────────────────────────────────────────────
    private String userKey(Authentication auth) {
        return (auth != null && auth.getName() != null) ? auth.getName() : "anon";
    }

    private ServerSentEvent<String> sse(Map<String, String> payload) {
        try {
            return ServerSentEvent.<String>builder().data(mapper.writeValueAsString(payload)).build();
        } catch (JsonProcessingException e) {
            return ServerSentEvent.<String>builder().data("{\"delta\":\"\"}").build();
        }
    }

    private ServerSentEvent<String> done() {
        return ServerSentEvent.<String>builder().data("[DONE]").build();
    }

    private String safeMessage(Throwable err) {
        return (err instanceof AiException && err.getMessage() != null)
                ? err.getMessage()
                : "Something went wrong with the AI service.";
    }
}
