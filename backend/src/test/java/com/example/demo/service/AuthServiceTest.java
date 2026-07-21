package com.example.demo.service;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.entity.User;
import com.example.demo.entity.UserRole;
import com.example.demo.repository.UserRepositoryJPA;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepositoryJPA userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(UUID.randomUUID());
        sampleUser.setUsername("testpatient");
        sampleUser.setEmail("patient@example.com");
        sampleUser.setPassword("hashed_pass");
        sampleUser.setRole(UserRole.PATIENT);
        sampleUser.setFirstName("Jane");
        sampleUser.setLastName("Doe");
    }

    @Test
    void register_SuccessfulPatientRegistration() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testpatient");
        request.setEmail("patient@example.com");
        request.setPassword("Secret@123");
        request.setConfirmPassword("Secret@123");
        request.setFirstName("Jane");
        request.setLastName("Doe");

        when(userRepository.existsByUsername("testpatient")).thenReturn(false);
        when(userRepository.existsByEmail("patient@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Secret@123")).thenReturn("hashed_pass");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);

        LoginResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("testpatient", response.getUsername());
        assertEquals("PATIENT", response.getRole());
        assertNotNull(response.getToken());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void register_ShouldFailWhenPasswordsDoNotMatch() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testpatient");
        request.setPassword("Secret@123");
        request.setConfirmPassword("Mismatch@123");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> authService.register(request));
        assertEquals("Passwords do not match", ex.getMessage());
    }

    @Test
    void register_ShouldDenyNonPatientRoleInPublicRegistration() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("fakeadmin");
        request.setPassword("Secret@123");
        request.setConfirmPassword("Secret@123");
        request.setRole("ADMIN");

        when(userRepository.existsByUsername("fakeadmin")).thenReturn(false);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> authService.register(request));
        assertTrue(ex.getMessage().contains("Public registration can only create PATIENT accounts"));
    }

    @Test
    void login_SuccessfulLogin() {
        LoginRequest request = new LoginRequest("testpatient", "Secret@123");

        when(userRepository.findByUsername("testpatient")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("Secret@123", "hashed_pass")).thenReturn(true);

        LoginResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("testpatient", response.getUsername());
        assertEquals("PATIENT", response.getRole());
        assertTrue(response.getToken().startsWith("TOKEN_"));
    }

    @Test
    void login_InvalidPasswordThrowsException() {
        LoginRequest request = new LoginRequest("testpatient", "WrongPassword");

        when(userRepository.findByUsername("testpatient")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("WrongPassword", "hashed_pass")).thenReturn(false);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> authService.login(request));
        assertEquals("Invalid username or password", ex.getMessage());
    }
}
