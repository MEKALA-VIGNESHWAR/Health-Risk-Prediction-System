package com.example.demo.ai;

import com.example.demo.ai.dto.ChatRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.List;

/**
 * Orchestrates the AI health assistant: injects a safety-first system persona,
 * threads session memory, streams the reply, and records the exchange once the
 * stream completes.
 */
@Service
public class ChatService {

    private static final String SYSTEM_PROMPT = """
            You are AuraHealth, a warm, knowledgeable AI health assistant inside a personal
            health platform. You help users understand symptoms, medications, conditions,
            nutrition, exercise, sleep, and general wellness.

            Guidelines:
            - Be clear, empathetic and concise. Prefer short paragraphs and bullet points.
            - Use Markdown for structure (headings, bold, lists) when it aids readability.
            - Give practical, evidence-informed guidance a layperson can act on.
            - You are NOT a doctor and must NOT diagnose. Frame possibilities as "may" / "could".
            - For red-flag symptoms (e.g. chest pain, trouble breathing, stroke signs,
              severe bleeding, suicidal thoughts), advise seeking emergency care immediately.
            - Encourage consulting a qualified professional for personal medical decisions.
            - Never invent specific test results, prescriptions or dosages for the user.
            - Keep responses focused on health and wellbeing; politely redirect off-topic asks.

            End longer or clinical answers with a brief reminder that this is general
            information, not a medical diagnosis.
            """;

    private final OpenAiClient client;
    private final ConversationStore store;

    public ChatService(OpenAiClient client, ConversationStore store) {
        this.client = client;
        this.store = store;
    }

    public Flux<String> stream(String userKey, ChatRequest req) {
        String message = req.message() == null ? "" : req.message().trim();
        if (message.isEmpty()) {
            return Flux.error(new AiException("Please enter a message."));
        }

        List<AiMessage> messages = new ArrayList<>();
        messages.add(AiMessage.system(SYSTEM_PROMPT));
        messages.addAll(store.history(userKey, req.conversationId()));
        AiMessage userMsg = AiMessage.user(message);
        messages.add(userMsg);

        StringBuilder assistant = new StringBuilder();
        return client.streamChat(messages)
                .doOnNext(assistant::append)
                .doOnComplete(() -> {
                    if (assistant.length() > 0) {
                        store.record(userKey, req.conversationId(), userMsg,
                                AiMessage.assistant(assistant.toString()));
                    }
                });
    }

    public void reset(String userKey, String conversationId) {
        store.clear(userKey, conversationId);
    }
}
