package com.example.demo.controller;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AuthController - REST endpoints for authentication (login, register)
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final AuthService authService;

    /**
     * Register a new user
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            log.info("Received registration request for username: {}", request.getUsername());
            
            if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("Username is required", HttpStatus.BAD_REQUEST.value()));
            }

            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("Password is required", HttpStatus.BAD_REQUEST.value()));
            }

            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("Email is required", HttpStatus.BAD_REQUEST.value()));
            }

            LoginResponse response = authService.register(request);
            log.info("User registered successfully: {}", request.getUsername());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException e) {
            log.warn("Registration failed: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        } catch (Exception e) {
            log.error("Registration error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Registration failed: " + e.getMessage(), 
                            HttpStatus.INTERNAL_SERVER_ERROR.value()));
        }
    }

    /**
     * Login user
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            log.info("Received login request for username: {}", request.getUsername());

            if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("Username is required", HttpStatus.BAD_REQUEST.value()));
            }

            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("Password is required", HttpStatus.BAD_REQUEST.value()));
            }

            LoginResponse response = authService.login(request);
            log.info("User logged in successfully: {}", request.getUsername());
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.warn("Login failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.UNAUTHORIZED.value()));
        } catch (Exception e) {
            log.error("Login error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Login failed: " + e.getMessage(), 
                            HttpStatus.INTERNAL_SERVER_ERROR.value()));
        }
    }

    /**
     * Verify token
     * GET /api/auth/verify
     */
    @GetMapping("/verify")
    public ResponseEntity<?> verify(@RequestHeader(value = "Authorization", required = false) String token) {
        try {
            if (token == null || token.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Token is required", HttpStatus.UNAUTHORIZED.value()));
            }

            // Remove "Bearer " prefix if present
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            boolean isValid = authService.verifyToken(token);
            if (isValid) {
                return ResponseEntity.ok(new SuccessResponse("Token is valid", true));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Invalid token", HttpStatus.UNAUTHORIZED.value()));
            }

        } catch (Exception e) {
            log.error("Token verification error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Verification failed: " + e.getMessage(), 
                            HttpStatus.INTERNAL_SERVER_ERROR.value()));
        }
    }

    /**
     * Create DOCTOR or ADMIN account (Admin-only)
     * POST /api/auth/admin/create-user
     * 
     * Request Header: Authorization: Bearer TOKEN_userId_uuid
     * 
     * Request Body:
     * {
     *   "firstName": "Dr. Jane",
     *   "lastName": "Smith",
     *   "username": "dr_smith",
     *   "email": "jane@hospital.com",
     *   "password": "secure123",
     *   "confirmPassword": "secure123",
     *   "role": "DOCTOR" or "ADMIN"
     * }
     * 
     * Response:
     * {
     *   "id": "uuid",
     *   "username": "dr_smith",
     *   "email": "jane@hospital.com",
     *   "firstName": "Dr. Jane",
     *   "lastName": "Smith",
     *   "token": "TOKEN_...",
     *   "role": "DOCTOR",
     *   "message": "DOCTOR account created successfully by admin"
     * }
     */
    @PostMapping("/admin/create-user")
    public ResponseEntity<?> createAdminUser(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody RegisterRequest request) {
        try {
            log.info("Admin user creation request for role: {}, username: {}", request.getRole(), request.getUsername());

            // Extract token from Authorization header
            if (authHeader == null || authHeader.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Authorization token is required", HttpStatus.UNAUTHORIZED.value()));
            }

            String token = authHeader;
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            // Get admin user from token
            com.example.demo.entity.User adminUser = authService.getUserFromToken(token);
            if (adminUser == null) {
                log.warn("Invalid token for admin user creation");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Invalid or expired token", HttpStatus.UNAUTHORIZED.value()));
            }

            // Verify admin role
            if (adminUser.getRole() != com.example.demo.entity.UserRole.ADMIN) {
                log.warn("Non-admin user {} attempted to create admin account", adminUser.getUsername());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Only ADMIN users can create DOCTOR and ADMIN accounts", 
                                HttpStatus.FORBIDDEN.value()));
            }

            // Validate request
            if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("Username is required", HttpStatus.BAD_REQUEST.value()));
            }

            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("Password is required", HttpStatus.BAD_REQUEST.value()));
            }

            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("Email is required", HttpStatus.BAD_REQUEST.value()));
            }

            if (request.getRole() == null || request.getRole().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("Role is required (DOCTOR or ADMIN)", HttpStatus.BAD_REQUEST.value()));
            }

            // Create the new admin/doctor user
            LoginResponse response = authService.createAdminUser(request, adminUser);
            log.info("Admin user created successfully by {}: {}", adminUser.getUsername(), request.getUsername());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException e) {
            log.warn("Admin user creation failed: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        } catch (Exception e) {
            log.error("Admin user creation error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("User creation failed: " + e.getMessage(), 
                            HttpStatus.INTERNAL_SERVER_ERROR.value()));
        }
    }

    /**
     * Forgot Password
     * POST /api/auth/forgot-password
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody java.util.Map<String, String> request) {
        try {
            String email = request.get("email");
            String token = authService.forgotPassword(email);
            return ResponseEntity.ok(java.util.Map.of(
                    "success", true, 
                    "message", "Password reset instructions sent.",
                    "token", token
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to send reset link: " + e.getMessage(), 
                            HttpStatus.INTERNAL_SERVER_ERROR.value()));
        }
    }

    /**
     * Reset Password
     * POST /api/auth/reset-password
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody java.util.Map<String, String> request) {
        try {
            String token = request.get("token");
            String newPassword = request.get("newPassword");
            authService.resetPassword(token, newPassword);
            return ResponseEntity.ok(java.util.Map.of(
                    "success", true, 
                    "message", "Password updated successfully."
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to reset password: " + e.getMessage(), 
                            HttpStatus.INTERNAL_SERVER_ERROR.value()));
        }
    }

    /**
     * Email Verification
     * POST /api/auth/verify-email
     */
    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody java.util.Map<String, String> request) {
        try {
            String email = request.get("email");
            String code = request.get("code");
            authService.verifyEmail(email, code);
            return ResponseEntity.ok(java.util.Map.of(
                    "success", true, 
                    "message", "Email verified successfully."
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Verification failed: " + e.getMessage(), 
                            HttpStatus.INTERNAL_SERVER_ERROR.value()));
        }
    }

    /**
     * Error response class
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    static class ErrorResponse {
        private String error;
        private int status;
    }

    /**
     * Success response class
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    static class SuccessResponse {
        private String message;
        private boolean valid;
    }
}
