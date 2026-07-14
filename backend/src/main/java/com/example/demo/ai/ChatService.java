package com.example.demo.ai;

import com.example.demo.ai.dto.ChatRequest;
import com.example.demo.entity.User;
import com.example.demo.entity.ChatSession;
import com.example.demo.entity.ChatMessageEntity;
import com.example.demo.entity.AiMemory;
import com.example.demo.repository.UserRepositoryJPA;
import com.example.demo.repository.ChatSessionRepositoryJPA;
import com.example.demo.repository.ChatMessageRepositoryJPA;
import com.example.demo.repository.AiMemoryRepositoryJPA;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Orchestrates the AI health assistant: injects a safety-first system persona,
 * threads session memory, streams the reply, and records the exchange once the
 * stream completes.
 */
@Service
public class ChatService {

    private static final String SYSTEM_PROMPT = """
            You are PulseMind, a warm, knowledgeable AI health assistant inside a personal
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
            information, not a medical diagnosis. Always append exactly 2 or 3 short, relevant
            follow-up questions the user might ask next, enclosed in a <suggestions>...</suggestions>
            tag (one question per line, no numbering). Example:
            <suggestions>
            What are the side effects of Metformin?
            How should I monitor my blood sugar?
            </suggestions>
            """;

    private final OpenAiClient client;
    private final UserRepositoryJPA userRepository;
    private final ChatSessionRepositoryJPA sessionRepository;
    private final ChatMessageRepositoryJPA messageRepository;
    private final AiMemoryRepositoryJPA aiMemoryRepository;

    public ChatService(OpenAiClient client,
                       UserRepositoryJPA userRepository,
                       ChatSessionRepositoryJPA sessionRepository,
                       ChatMessageRepositoryJPA messageRepository,
                       AiMemoryRepositoryJPA aiMemoryRepository) {
        this.client = client;
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
        this.messageRepository = messageRepository;
        this.aiMemoryRepository = aiMemoryRepository;
    }

    public Flux<String> stream(String userKey, ChatRequest req) {
        String message = req.message() == null ? "" : req.message().trim();
        if (message.isEmpty()) {
            return Flux.error(new AiException("Please enter a message."));
        }

        // 1. Resolve current user
        User user = resolveUser(userKey);
        UUID userId = user.getId();

        // 2. Resolve or create chat session
        String convIdStr = req.conversationId();
        UUID sessionId;
        try {
            sessionId = UUID.fromString(convIdStr);
        } catch (Exception e) {
            sessionId = UUID.randomUUID();
        }

        final UUID finalSessionId = sessionId;
        ChatSession session = sessionRepository.findById(sessionId)
                .orElseGet(() -> {
                    ChatSession newSession = new ChatSession();
                    newSession.setId(finalSessionId);
                    newSession.setUserId(userId);
                    newSession.setTitle(message.length() > 30 ? message.substring(0, 27) + "..." : message);
                    return sessionRepository.save(newSession);
                });

        // 3. Load message history from DB
        List<ChatMessageEntity> dbMsgs = messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);

        // 4. Build prompt list
        List<AiMessage> prompts = new ArrayList<>();
        prompts.add(AiMessage.system(buildSystemPrompt(user)));

        for (ChatMessageEntity dbMsg : dbMsgs) {
            if ("USER".equalsIgnoreCase(dbMsg.getSender())) {
                prompts.add(AiMessage.user(dbMsg.getContent()));
            } else {
                prompts.add(AiMessage.assistant(dbMsg.getContent()));
            }
        }
        prompts.add(AiMessage.user(message));

        // 5. Stream response and save once complete
        StringBuilder assistantResponse = new StringBuilder();
        return client.streamChat(prompts)
                .doOnNext(assistantResponse::append)
                .doOnComplete(() -> {
                    if (assistantResponse.length() > 0) {
                        // Save user message
                        ChatMessageEntity userMsg = new ChatMessageEntity();
                        userMsg.setSessionId(finalSessionId);
                        userMsg.setSender("USER");
                        userMsg.setContent(message);
                        messageRepository.save(userMsg);

                        // Save assistant message
                        ChatMessageEntity assistantMsg = new ChatMessageEntity();
                        assistantMsg.setSessionId(finalSessionId);
                        assistantMsg.setSender("ASSISTANT");
                        assistantMsg.setContent(assistantResponse.toString());
                        messageRepository.save(assistantMsg);

                        // Perform memory extraction checks in background (local regex logic)
                        extractVitalsFacts(userId, message);
                    }
                });
    }

    public void reset(String userKey, String conversationId) {
        try {
            UUID sessionId = UUID.fromString(conversationId);
            messageRepository.deleteBySessionId(sessionId);
            sessionRepository.deleteById(sessionId);
        } catch (Exception e) {
            /* ignore invalid UUID resets */
        }
    }

    private User resolveUser(String userKey) {
        Optional<User> userOpt = userRepository.findByUsername(userKey);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(userKey);
        }
        if (userOpt.isEmpty()) {
            List<User> list = userRepository.findAll();
            if (list.isEmpty()) throw new RuntimeException("No users registered in database");
            return list.get(0);
        }
        return userOpt.get();
    }

    private String buildSystemPrompt(User user) {
        StringBuilder sb = new StringBuilder(SYSTEM_PROMPT);
        sb.append("\n\nUser Health Context:\n");
        sb.append("- Name: ").append(user.getFirstName()).append(" ").append(user.getLastName()).append("\n");
        
        if (user.getDateOfBirth() != null) {
            int age = java.time.Period.between(user.getDateOfBirth(), java.time.LocalDate.now()).getYears();
            sb.append("- Age: ").append(age).append(" years\n");
        }
        if (user.getWeightKg() != null) {
            sb.append("- Weight: ").append(user.getWeightKg()).append(" kg\n");
        }
        if (user.getHeightCm() != null) {
            sb.append("- Height: ").append(user.getHeightCm()).append(" cm\n");
        }
        if (user.getAllergies() != null && !user.getAllergies().isBlank()) {
            sb.append("- Allergies: ").append(user.getAllergies()).append("\n");
        }
        if (user.getMedicalHistory() != null && !user.getMedicalHistory().isBlank()) {
            sb.append("- Medical History / Conditions: ").append(user.getMedicalHistory()).append("\n");
        }
        if (user.getCurrentMedications() != null && !user.getCurrentMedications().isBlank()) {
            sb.append("- Current Medications: ").append(user.getCurrentMedications()).append("\n");
        }

        // Append dynamic saved preferences
        List<AiMemory> dynamicMemory = aiMemoryRepository.findByUserId(user.getId());
        if (!dynamicMemory.isEmpty()) {
            sb.append("- Saved Preferences/Notes:\n");
            for (AiMemory mem : dynamicMemory) {
                sb.append("  * ").append(mem.getMemoryKey()).append(": ").append(mem.getMemoryValue()).append("\n");
            }
        }
        
        return sb.toString();
    }

    private void extractVitalsFacts(UUID userId, String userMsg) {
        String msgLower = userMsg.toLowerCase();
        
        // Simple regex/keyword extractions for allergies
        if (msgLower.contains("allergic to")) {
            saveMemoryFact(userId, "allergy", userMsg);
        }
        // Medications
        if (msgLower.contains("taking") || msgLower.contains("prescribed")) {
            saveMemoryFact(userId, "medication", userMsg);
        }
        // Diagnosis
        if (msgLower.contains("diagnosed with") || msgLower.contains("have history of")) {
            saveMemoryFact(userId, "condition", userMsg);
        }
    }

    private void saveMemoryFact(UUID userId, String type, String rawFact) {
        try {
            AiMemory mem = aiMemoryRepository.findByUserIdAndMemoryKey(userId, type)
                    .orElse(new AiMemory());
            
            mem.setUserId(userId);
            mem.setMemoryKey(type);
            
            String oldVal = mem.getMemoryValue();
            String newVal = (oldVal == null || oldVal.isBlank()) ? rawFact : oldVal + "; " + rawFact;
            
            // Cap fact length
            if (newVal.length() > 500) {
                newVal = newVal.substring(newVal.length() - 480);
            }
            
            mem.setMemoryValue(newVal);
            aiMemoryRepository.save(mem);
        } catch (Exception e) {
            /* ignore memory errors */
        }
    }
}
