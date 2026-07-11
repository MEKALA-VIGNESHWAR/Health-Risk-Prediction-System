package com.example.demo.controller;

import com.example.demo.service.SearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    public ResponseEntity<?> search(
            @RequestParam("q") String query,
            @RequestParam("userId") String userId) {
        log.info("REST search request for query: '{}', user: {}", query, userId);
        try {
            if (query == null || query.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Query parameter 'q' is required");
            }
            if (userId == null || userId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("User ID parameter is required");
            }
            Map<String, Object> results = searchService.compositeSearch(
                    UUID.fromString(userId),
                    query.trim()
            );
            return ResponseEntity.ok(results);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid User ID format");
        } catch (Exception e) {
            log.error("Search endpoint error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
