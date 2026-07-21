package com.example.demo.controller;

import com.example.demo.dto.DoctorNoteDTO;
import com.example.demo.entity.DoctorNote;
import com.example.demo.repository.DoctorNoteRepositoryJPA;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * DoctorNoteController - REST endpoints for doctor notes using DoctorNoteDTO
 */
@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class DoctorNoteController {

    private final DoctorNoteRepositoryJPA noteRepository;

    /**
     * POST /api/notes - Create a new doctor note
     */
    @PostMapping
    public ResponseEntity<?> createNote(@RequestBody NoteRequest request) {
        try {
            log.info("POST /api/notes - Creating note for patient {}", request.getPatientId());

            DoctorNote note = new DoctorNote();
            note.setPatientId(UUID.fromString(request.getPatientId()));
            note.setDoctorId(UUID.fromString(request.getDoctorId()));
            note.setContent(request.getContent());
            note.setNoteType(request.getNoteType() != null ? request.getNoteType() : "GENERAL");
            note.setDoctorName(request.getDoctorName());
            note.setPatientName(request.getPatientName());

            if (request.getPredictionId() != null && !request.getPredictionId().isBlank()) {
                note.setPredictionId(UUID.fromString(request.getPredictionId()));
            }

            DoctorNote saved = noteRepository.save(note);
            log.info("Note created: {}", saved.getId());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("status", "success", "message", "Note saved",
                            "note", DoctorNoteDTO.fromEntity(saved)));
        } catch (Exception e) {
            log.error("Error creating note: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", "Failed to save note: " + e.getMessage()));
        }
    }

    /**
     * GET /api/notes/patient/{patientId} - Get all notes for a patient
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getNotesForPatient(@PathVariable String patientId) {
        try {
            log.info("GET /api/notes/patient/{}", patientId);
            UUID uuid = UUID.fromString(patientId);
            List<DoctorNote> notes = noteRepository.findByPatientIdOrderByCreatedAtDesc(uuid);
            List<DoctorNoteDTO> dtos = notes.stream().map(DoctorNoteDTO::fromEntity).collect(Collectors.toList());
            return ResponseEntity.ok(Map.of("status", "success", "data", dtos, "count", dtos.size()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("status", "error", "message", "Invalid patient ID format"));
        } catch (Exception e) {
            log.error("Error fetching notes: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", "Failed to fetch notes"));
        }
    }

    /**
     * GET /api/notes/prediction/{predictionId} - Get notes for a prediction
     */
    @GetMapping("/prediction/{predictionId}")
    public ResponseEntity<?> getNotesForPrediction(@PathVariable String predictionId) {
        try {
            log.info("GET /api/notes/prediction/{}", predictionId);
            UUID uuid = UUID.fromString(predictionId);
            List<DoctorNote> notes = noteRepository.findByPredictionIdOrderByCreatedAtDesc(uuid);
            List<DoctorNoteDTO> dtos = notes.stream().map(DoctorNoteDTO::fromEntity).collect(Collectors.toList());
            return ResponseEntity.ok(Map.of("status", "success", "data", dtos));
        } catch (Exception e) {
            log.error("Error fetching notes: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", "Failed to fetch notes"));
        }
    }

    /**
     * DELETE /api/notes/{noteId} - Delete a note
     */
    @DeleteMapping("/{noteId}")
    public ResponseEntity<?> deleteNote(@PathVariable String noteId) {
        try {
            log.info("DELETE /api/notes/{}", noteId);
            UUID uuid = UUID.fromString(noteId);
            noteRepository.deleteById(uuid);
            return ResponseEntity.ok(Map.of("status", "success", "message", "Note deleted"));
        } catch (Exception e) {
            log.error("Error deleting note: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", "Failed to delete note"));
        }
    }

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    static class NoteRequest {
        private String patientId;
        private String doctorId;
        private String predictionId;
        private String content;
        private String noteType;
        private String doctorName;
        private String patientName;
    }
}
