package com.example.demo.service;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.entity.User;
import com.example.demo.entity.UserRole;
import com.example.demo.repository.UserRepositoryJPA;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * AuthService - Authentication and authorization business logic (Supabase PostgreSQL)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepositoryJPA userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Register a new user
     */
    public LoginResponse register(RegisterRequest request) {
        log.info("Registering new user with username: {}", request.getUsername());

        // Validate input
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            log.warn("Username is empty");
            throw new IllegalArgumentException("Username cannot be empty");
        }

        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            log.warn("Password is empty");
            throw new IllegalArgumentException("Password cannot be empty");
        }

        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            log.warn("Username already exists: {}", request.getUsername());
            throw new IllegalArgumentException("Username already exists");
        }

        // Check if email already exists
        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
            log.warn("Email already exists: {}", request.getEmail());
            throw new IllegalArgumentException("Email already exists");
        }

        // Validate password confirmation
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            log.warn("Passwords do not match");
            throw new IllegalArgumentException("Passwords do not match");
        }

        // Validate password strength (minimum 6 characters)
        if (request.getPassword().length() < 6) {
            log.warn("Password too short");
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }

        // Enforce: Public registration can ONLY create PATIENT accounts
        // Any attempt to create DOCTOR or ADMIN through public registration is denied
        if (request.getRole() != null && !request.getRole().isBlank()) {
            String requestedRole = request.getRole().toUpperCase();
            if (!requestedRole.equals("PATIENT")) {
                log.warn("SECURITY: Registration attempt with restricted role {}: username {}", 
                        requestedRole, request.getUsername());
                throw new IllegalArgumentException("Public registration can only create PATIENT accounts. " +
                        "Contact administrator to create DOCTOR or ADMIN accounts.");
            }
        }

        // Create new user with hashed password
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // Hash password with BCrypt
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        
        // Enforce PATIENT role for public registration
        user.setRole(UserRole.PATIENT);
        
        user.setCreatedDate(System.currentTimeMillis());
        user.setUpdatedDate(System.currentTimeMillis());

        User savedUser = userRepository.save(user);
        log.info("User registered successfully with id: {}", savedUser.getId());

        // Generate token
        String token = generateToken(savedUser.getId().toString());

        return new LoginResponse(
                savedUser.getId().toString(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getFirstName(),
                savedUser.getLastName(),
                token,
                savedUser.getRole().toString(),
                "Registration successful"
        );
    }

    /**
     * Login user with username and password
     */
    public LoginResponse login(LoginRequest request) {
        log.info("Login attempt for user: {}", request.getUsername());

        if (request.getUsername() == null || request.getPassword() == null) {
            log.warn("Username or password is null");
            throw new IllegalArgumentException("Username and password are required");
        }

        // Find user by username
        Optional<User> userOptional = userRepository.findByUsername(request.getUsername());

        if (userOptional.isEmpty()) {
            log.warn("User not found: {}", request.getUsername());
            throw new IllegalArgumentException("Invalid username or password");
        }

        User user = userOptional.get();

        // Validate password using BCrypt
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Invalid password for user: {}", request.getUsername());
            throw new IllegalArgumentException("Invalid username or password");
        }

        log.info("User logged in successfully: {}", user.getUsername());

        // Generate token
        String token = generateToken(user.getId().toString());

        return new LoginResponse(
                user.getId().toString(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                token,
                user.getRole().toString(),
                "Login successful"
        );
    }

    /**
     * Verify user by token (simple UUID-based token)
     */
    public boolean verifyToken(String token) {
        // In production, use JWT library to verify token
        return token != null && !token.isEmpty();
    }

    /**
     * Generate authentication token (simple UUID, replace with JWT in production)
     */
    private String generateToken(String userId) {
        return "TOKEN_" + userId + "_" + UUID.randomUUID().toString();
    }

    /**
     * Create a new DOCTOR or ADMIN account (Admin-only operation)
     * 
     * This method allows administrators to create doctor and admin accounts
     * which cannot be created through public registration
     * 
     * @param request RegisterRequest with role = DOCTOR or ADMIN
     * @param adminUser The User object of the admin performing this operation
     * @return LoginResponse with new user details
     */
    public LoginResponse createAdminUser(RegisterRequest request, User adminUser) {
        log.info("Admin {} creating new user with role: {} (username: {})", 
                adminUser.getUsername(), request.getRole(), request.getUsername());

        // Verify that the requester is an admin
        if (adminUser.getRole() != UserRole.ADMIN) {
            log.warn("SECURITY: Non-admin user {} attempted to create admin account", adminUser.getUsername());
            throw new IllegalArgumentException("Only ADMIN users can create DOCTOR and ADMIN accounts");
        }

        // Validate input
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            throw new IllegalArgumentException("Username cannot be empty");
        }

        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Password cannot be empty");
        }

        // Check for duplicate username/email
        if (userRepository.existsByUsername(request.getUsername())) {
            log.warn("Username already exists: {}", request.getUsername());
            throw new IllegalArgumentException("Username already exists");
        }

        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
            log.warn("Email already exists: {}", request.getEmail());
            throw new IllegalArgumentException("Email already exists");
        }

        // Validate password
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        if (request.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }

        // Validate requested role
        String requestedRole = (request.getRole() != null) ? request.getRole().toUpperCase() : "PATIENT";
        if (!requestedRole.equals("DOCTOR") && !requestedRole.equals("ADMIN")) {
            log.warn("Invalid role for admin creation: {}", requestedRole);
            throw new IllegalArgumentException("Only DOCTOR and ADMIN roles can be created by admins");
        }

        // Create new user
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(UserRole.valueOf(requestedRole));
        user.setCreatedDate(System.currentTimeMillis());
        user.setUpdatedDate(System.currentTimeMillis());

        User savedUser = userRepository.save(user);
        log.info("Admin {} successfully created {} account: {}", 
                adminUser.getUsername(), requestedRole, savedUser.getId());

        // Generate token
        String token = generateToken(savedUser.getId().toString());

        return new LoginResponse(
                savedUser.getId().toString(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getFirstName(),
                savedUser.getLastName(),
                token,
                savedUser.getRole().toString(),
                savedUser.getRole() + " account created successfully by admin"
        );
    }

    /**
     * Get user by token
     */
    public User getUserFromToken(String token) {
        if (token == null || !token.startsWith("TOKEN_")) {
            return null;
        }

        try {
            // Extract userId from token (format: TOKEN_userId_uuid)
            String[] parts = token.split("_", 3);
            if (parts.length >= 2) {
                String userIdStr = parts[1];
                try {
                    UUID userId = UUID.fromString(userIdStr);
                    Optional<User> user = userRepository.findById(userId);
                    return user.orElse(null);
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid UUID format in token: {}", userIdStr);
                    return null;
                }
            }
        } catch (Exception e) {
            log.warn("Failed to parse token: {}", e.getMessage());
        }

        return null;
    }

    // Concurrent map to hold temporary reset tokens (token -> email)
    private final Map<String, String> resetTokens = new java.util.concurrent.ConcurrentHashMap<>();

    /**
     * Request a password reset token
     */
    public String forgotPassword(String email) {
        log.info("Password reset requested for email: {}", email);
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }

        Optional<User> userOpt = userRepository.findByEmail(email.trim());
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("No user found with this email address");
        }

        String token = UUID.randomUUID().toString();
        resetTokens.put(token, email.trim());
        log.info("Generated password reset token: {} for email: {}", token, email);
        return token;
    }

    /**
     * Reset password using token
     */
    public void resetPassword(String token, String newPassword) {
        log.info("Attempting password reset with token: {}", token);
        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException("Token is required");
        }
        if (newPassword == null || newPassword.trim().isEmpty() || newPassword.length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }

        String email = resetTokens.get(token.trim());
        if (email == null) {
            throw new IllegalArgumentException("Invalid or expired password reset token");
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User no longer exists");
        }

        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedDate(System.currentTimeMillis());
        userRepository.save(user);
        
        resetTokens.remove(token.trim());
        log.info("Password successfully updated for user: {}", user.getUsername());
    }

    /**
     * Verify email with a code
     */
    public boolean verifyEmail(String email, String code) {
        log.info("Email verification requested for email: {} with code: {}", email, code);
        if (email == null || email.trim().isEmpty() || code == null || code.trim().isEmpty()) {
            throw new IllegalArgumentException("Email and verification code are required");
        }
        
        // Simulating email verification - accept any 6-digit code or default "123456" for testing
        if (code.length() != 6) {
            throw new IllegalArgumentException("Verification code must be exactly 6 digits");
        }
        
        return true;
    }

    /**
     * Get user by username
     */
    public User getUserByUsername(String username) {
        if (username == null || username.trim().isEmpty()) {
            return null;
        }
        
        Optional<User> user = userRepository.findByUsername(username);
        return user.orElse(null);
    }
}

