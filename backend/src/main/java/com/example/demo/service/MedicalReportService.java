package com.example.demo.service;

import com.example.demo.ai.OpenAiClient;
import com.example.demo.entity.MedicalReport;
import com.example.demo.repository.MedicalReportRepositoryJPA;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MedicalReportService {

    private final MedicalReportRepositoryJPA reportRepository;
    private final OpenAiClient openAiClient;
    private final ObjectMapper objectMapper;

    private static final String VISION_PROMPT =
            "You are an expert clinical lab report parser. Analyze the provided lab report image.\n" +
            "Extract the patient name, date of report, and lab name. Identify the list of test parameters, " +
            "their values, their reference normal ranges, their status (e.g. NORMAL, ELEVATED, HIGH, LOW, CRITICAL), " +
            "and comments explaining the results. Also identify any specific flags/abnormalities and " +
            "generate clear, actionable clinical recommendations for the patient.\n\n" +
            "You MUST respond ONLY with a single JSON object in the following format:\n" +
            "{\n" +
            "  \"patientName\": \"...\",\n" +
            "  \"reportDate\": \"...\",\n" +
            "  \"labName\": \"...\",\n" +
            "  \"summary\": \"General overview summary of the report...\",\n" +
            "  \"parameters\": [\n" +
            "    {\n" +
            "      \"name\": \"Glucose\",\n" +
            "      \"value\": \"105 mg/dL\",\n" +
            "      \"normalRange\": \"70-100 mg/dL\",\n" +
            "      \"status\": \"ELEVATED\",\n" +
            "      \"comments\": \"Fasting blood sugar is slightly elevated.\"\n" +
            "    }\n" +
            "  ],\n" +
            "  \"abnormalities\": [\n" +
            "    {\n" +
            "      \"name\": \"Glucose\",\n" +
            "      \"value\": \"105 mg/dL\",\n" +
            "      \"status\": \"ELEVATED\"\n" +
            "    }\n" +
            "  ],\n" +
            "  \"guidelines\": [\n" +
            "    \"Follow a healthy low-sugar diet.\",\n" +
            "    \"Monitor blood glucose levels regularly.\"\n" +
            "  ],\n" +
            "  \"status\": \"WARNING\" // NORMAL, WARNING, CRITICAL\n" +
            "}\n\n" +
            "Do not include any markdown framing or markdown code blocks (like ```json). Respond only with raw JSON.";

    public MedicalReport analyzeReport(String fileName, String fileType, byte[] fileBytes, UUID userId) {
        log.info("Analyzing report: {}, fileType: {}, userId: {}", fileName, fileType, userId);

        // Create a processing report record
        MedicalReport report = new MedicalReport();
        report.setUserId(userId);
        report.setFileName(fileName);
        report.setFileType(fileType);
        report.setStatus("PROCESSING");
        MedicalReport savedReport = reportRepository.save(report);

        try {
            String base64Image = Base64.getEncoder().encodeToString(fileBytes);
            String mimeType = fileType != null ? fileType : "image/jpeg";

            // Query Vision completions
            String responseJson = openAiClient.completeWithImage(VISION_PROMPT, base64Image, mimeType, 0.1).block();

            if (responseJson == null || responseJson.trim().isEmpty()) {
                throw new RuntimeException("No response from AI Vision service");
            }

            // Clean markdown blocks if returned
            String cleanJson = responseJson.trim();
            if (cleanJson.startsWith("```")) {
                int firstLineEnd = cleanJson.indexOf('\n');
                int lastBackticks = cleanJson.lastIndexOf("```");
                if (firstLineEnd != -1 && lastBackticks != -1 && lastBackticks > firstLineEnd) {
                    cleanJson = cleanJson.substring(firstLineEnd, lastBackticks).trim();
                }
            }

            // Parse json to verify correctness
            JsonNode rootNode = objectMapper.readTree(cleanJson);
            
            savedReport.setExtractedText(rootNode.path("summary").asText("No summary provided."));
            savedReport.setStructuredData(objectMapper.writeValueAsString(rootNode.path("parameters")));
            savedReport.setAbnormalities(objectMapper.writeValueAsString(rootNode.path("abnormalities")));
            savedReport.setRecommendations(objectMapper.writeValueAsString(rootNode.path("guidelines")));
            
            savedReport.setStatus("COMPLETED");
            
            log.info("Successfully completed report parsing for: {}", fileName);
            return reportRepository.save(savedReport);

        } catch (Exception e) {
            log.error("Failed to analyze medical report: {}", e.getMessage(), e);
            savedReport.setStatus("FAILED");
            savedReport.setExtractedText("Parsing failed: " + e.getMessage());
            return reportRepository.save(savedReport);
        }
    }

    public List<MedicalReport> getReportsByUserId(UUID userId) {
        log.info("Fetching reports for user: {}", userId);
        return reportRepository.findByUserId(userId);
    }
}
