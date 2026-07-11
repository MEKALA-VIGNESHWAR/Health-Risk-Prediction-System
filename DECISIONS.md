# Architecture Decisions Log: AI Health Risk Prediction System 2.0 (AuraHealth)

This document tracks the technical and design decisions, rationales, and consequences of architectural choices made during the Version 2.0 AuraHealth upgrade.

---

## 🎨 ADR 6: Premium Tailwind Design System with Theme Variables
- **Context**: The client requires a polished SaaS feel matching Linear or Stripe, deviating from traditional clinical templates.
- **Decision**: Define a custom palette in [tailwind.config.js](file:///c:/Users/mekal/OneDrive/Documents/My%20Projects/healthrisk/frontend/tailwind.config.js) using CSS variables mapped to theme ranges (Emerald, Cream, Sage backgrounds). Transitions are configured via Tailwind's dynamic classes and animated via Framer Motion.
- **Consequences**: Developers can style components directly using design tokens. Ensures unified hover, focus, contrast, and dark mode structures.

---

## 📄 ADR 7: OpenAI Vision API for Document OCR & Processing
- **Context**: Patients upload files/images of blood reports. Running local OCR servers (e.g. Tesseract OCR) on container environments like Render is memory-intensive and prone to missing key formatted grids.
- **Decision**: Send file uploads directly to OpenAI's Vision Model (GPT-4o / GPT-4o-mini) with a system prompt specifying strict JSON outputs.
- **Consequences**: Resolves the document extraction step with zero backend runtime footprint, extracting parameters with high accuracy without managing local native libraries.

---

## ⚡ ADR 8: Server-Sent Events (SSE) for AI Conversations
- **Context**: Health assistant chats require streaming text to emulate realistic typing, but standard WebSocket endpoints introduce additional server framing overhead.
- **Decision**: Expose the chat endpoint using `MediaType.TEXT_EVENT_STREAM_VALUE` (SSE) returning a `Flux<ServerSentEvent<String>>`.
- **Consequences**: Enables responsive, memory-efficient streaming over HTTP without needing full duplex WebSocket channels.

---

## 📊 ADR 9: Mathematical SHAP Approximation for Explanations
- **Context**: Running authentic SHAP models (SHapley Additive exPlanations) requires intensive Python execution environments (e.g. PySpark, Python runtime) that slow down response times.
- **Decision**: Compute feature importance scores on the Java service layer by finding the normalized deviation of a patient's vital metrics against standard reference limits.
- **Consequences**: Returns instant, explainable metrics to the dashboard, rendering positive and negative contributor charts instantly.

---

## 📅 ADR 10: In-Memory vs. Database Chat History Storage
- **Context**: AI chat needs conversation context memory to handle follow-up queries. Storing entire histories in PostgreSQL for every request adds significant query overhead.
- **Decision**: Cache active chat history context in an in-memory `ConversationStore` mapped to the user's login session. Implement a database sync job only when users explicitly request to archive their history.
- **Consequences**: Ensures fast assistant chat performance and minimizes database write bottlenecks.
