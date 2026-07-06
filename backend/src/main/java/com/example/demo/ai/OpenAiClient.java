package com.example.demo.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;
import java.util.Objects;

/**
 * Thin reactive wrapper over the OpenAI Chat Completions API. Handles both
 * streaming (token deltas) and single-shot JSON completions. When no API key is
 * configured, both paths fall back to clearly-labelled offline content so the UI
 * always works.
 */
@Service
public class OpenAiClient {

    private static final Logger log = LoggerFactory.getLogger(OpenAiClient.class);

    private final WebClient webClient;
    private final AiProperties props;
    private final ObjectMapper mapper;

    public OpenAiClient(@Qualifier("openAiWebClient") WebClient webClient,
                        AiProperties props,
                        ObjectMapper mapper) {
        this.webClient = webClient;
        this.props = props;
        this.mapper = mapper;
    }

    // ── Streaming chat ──────────────────────────────────────────────────────
    public Flux<String> streamChat(List<AiMessage> messages) {
        if (!props.isConfigured()) {
            return simulatedStream(offlineChatNotice());
        }
        ObjectNode body = buildBody(messages, props.getTemperature(), true, false);
        return webClient.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + props.getApiKey())
                .accept(MediaType.TEXT_EVENT_STREAM)
                .bodyValue(body)
                .retrieve()
                .bodyToFlux(new ParameterizedTypeReference<ServerSentEvent<String>>() {})
                .map(ServerSentEvent::data)
                .filter(Objects::nonNull)
                .takeWhile(data -> !"[DONE]".equals(data.trim()))
                .mapNotNull(this::extractDelta)
                .filter(s -> !s.isEmpty())
                .onErrorMap(WebClientResponseException.class, this::mapHttpError)
                .onErrorMap(ex -> !(ex instanceof AiException),
                        ex -> {
                            log.warn("OpenAI stream error: {}", ex.toString());
                            return new AiException("The AI service is temporarily unavailable. Please try again.");
                        });
    }

    // ── Single-shot completion (optionally JSON mode) ───────────────────────
    public Mono<String> complete(List<AiMessage> messages, double temperature, boolean jsonMode) {
        if (!props.isConfigured()) {
            return Mono.error(new AiException("AI is not configured."));
        }
        ObjectNode body = buildBody(messages, temperature, false, jsonMode);
        return webClient.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + props.getApiKey())
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .map(this::extractMessageContent)
                .onErrorMap(WebClientResponseException.class, this::mapHttpError)
                .onErrorMap(ex -> !(ex instanceof AiException),
                        ex -> new AiException("The AI service is temporarily unavailable.", ex));
    }

    // ── Helpers ─────────────────────────────────────────────────────────────
    private ObjectNode buildBody(List<AiMessage> messages, double temperature,
                                 boolean stream, boolean jsonMode) {
        ObjectNode body = mapper.createObjectNode();
        body.put("model", props.getModel());
        body.put("temperature", temperature);
        body.put("max_tokens", props.getMaxTokens());
        body.put("stream", stream);
        if (jsonMode) {
            ObjectNode fmt = body.putObject("response_format");
            fmt.put("type", "json_object");
        }
        ArrayNode msgs = body.putArray("messages");
        for (AiMessage m : messages) {
            ObjectNode node = msgs.addObject();
            node.put("role", m.role());
            node.put("content", m.content());
        }
        return body;
    }

    /** Extract choices[0].delta.content from a streaming chunk; null-safe. */
    private String extractDelta(String data) {
        try {
            JsonNode root = mapper.readTree(data);
            JsonNode content = root.path("choices").path(0).path("delta").path("content");
            return content.isTextual() ? content.asText() : "";
        } catch (Exception e) {
            return "";
        }
    }

    /** Extract choices[0].message.content from a full completion. */
    private String extractMessageContent(String json) {
        try {
            JsonNode root = mapper.readTree(json);
            JsonNode content = root.path("choices").path(0).path("message").path("content");
            if (content.isTextual()) return content.asText();
            throw new AiException("The AI returned an unexpected response.");
        } catch (AiException e) {
            throw e;
        } catch (Exception e) {
            throw new AiException("Could not read the AI response.", e);
        }
    }

    private AiException mapHttpError(WebClientResponseException e) {
        int code = e.getStatusCode().value();
        log.warn("OpenAI HTTP {}: {}", code, e.getResponseBodyAsString());
        return switch (code) {
            case 401 -> new AiException("The AI service key is invalid or missing.");
            case 429 -> new AiException("The AI service is rate-limited right now. Please try again shortly.");
            case 400 -> new AiException("The request could not be processed by the AI service.");
            default -> new AiException("The AI service returned an error (" + code + ").");
        };
    }

    /** Stream a fixed message word-by-word to mimic live typing in demo mode. */
    private Flux<String> simulatedStream(String text) {
        String[] parts = text.split(" ");
        return Flux.range(0, parts.length)
                .delayElements(Duration.ofMillis(16))
                .map(i -> i == 0 ? parts[i] : " " + parts[i]);
    }

    private String offlineChatNotice() {
        return "**AuraHealth AI is running in demo mode.** "
                + "To enable live, personalized answers, set the `OPENAI_API_KEY` environment variable on the server.\n\n"
                + "In the meantime, here's some general guidance: for everyday wellness, focus on balanced meals, "
                + "regular movement, good hydration, and 7–9 hours of sleep. For any concerning or persistent symptoms, "
                + "please consult a qualified healthcare professional.\n\n"
                + "_This is general information, not medical advice._";
    }
}
