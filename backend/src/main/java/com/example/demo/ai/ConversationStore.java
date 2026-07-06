package com.example.demo.ai;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Lightweight in-memory chat memory, scoped per (user, conversation). Keeps the
 * assistant context-aware within a session without a database. Bounded on both
 * axes so it can never grow unbounded: at most {@code MAX_TURNS} recent messages
 * per conversation and {@code MAX_CONVERSATIONS} total (oldest evicted).
 */
@Component
public class ConversationStore {

    private static final int MAX_TURNS = 20;
    private static final int MAX_CONVERSATIONS = 1000;

    // Access-ordered LRU map so the least-recently-used conversation is evicted.
    private final Map<String, List<AiMessage>> store = Collections.synchronizedMap(
            new java.util.LinkedHashMap<>(16, 0.75f, true) {
                @Override
                protected boolean removeEldestEntry(Map.Entry<String, List<AiMessage>> eldest) {
                    return size() > MAX_CONVERSATIONS;
                }
            });

    private final Map<String, Object> locks = new ConcurrentHashMap<>();

    private String key(String userKey, String conversationId) {
        return userKey + "::" + (conversationId == null || conversationId.isBlank() ? "default" : conversationId);
    }

    /** Returns a snapshot copy of the conversation history (never null). */
    public List<AiMessage> history(String userKey, String conversationId) {
        String k = key(userKey, conversationId);
        synchronized (locks.computeIfAbsent(k, x -> new Object())) {
            List<AiMessage> list = store.get(k);
            return list == null ? new ArrayList<>() : new ArrayList<>(list);
        }
    }

    /** Append a user+assistant exchange, trimming to the most recent turns. */
    public void record(String userKey, String conversationId, AiMessage userMsg, AiMessage assistantMsg) {
        String k = key(userKey, conversationId);
        synchronized (locks.computeIfAbsent(k, x -> new Object())) {
            List<AiMessage> list = store.computeIfAbsent(k, x -> new ArrayList<>());
            list.add(userMsg);
            list.add(assistantMsg);
            while (list.size() > MAX_TURNS) {
                list.remove(0);
            }
        }
    }

    public void clear(String userKey, String conversationId) {
        String k = key(userKey, conversationId);
        store.remove(k);
        locks.remove(k);
    }
}
