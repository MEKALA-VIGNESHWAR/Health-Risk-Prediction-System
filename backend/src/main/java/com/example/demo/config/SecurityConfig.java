package com.example.demo.config;

import com.example.demo.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * Security Configuration for REST API
 * Allows public access to key endpoints, secures others
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                // Allow static resources without authentication.
                // "/assets/**" covers the Vite/React build output (hashed JS/CSS chunks).
                .requestMatchers("/", "/*.html", "/assets/**", "/css/**", "/js/**", "/images/**", "/public/**", "/static/**",
                                "/*.css", "/*.js", "/*.ico", "/*.png", "/*.jpg", "/*.jpeg", "/*.svg", "/*.webp", "/*.woff",
                                "/*.woff2", "/*.ttf", "/*.eot", "/*.webmanifest").permitAll()
                
                // Swagger UI & OpenAPI 3 docs
                .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**", "/swagger-resources/**", "/webjars/**").permitAll()

                // Public API endpoints - no authentication required
                .requestMatchers("/api/health", "/api/ping", "/api/status").permitAll()
                .requestMatchers("/api/auth/register").permitAll()
                .requestMatchers("/api/auth/login").permitAll()
                .requestMatchers("/api/auth/verify").permitAll()
                .requestMatchers("/api/predict/**").permitAll()
                // AI status is a harmless read used by the UI to show demo/live state.
                // The paid endpoints (/api/ai/chat, /api/ai/symptoms) require a token —
                // they fall through to the "/api/**" authenticated rule below.
                .requestMatchers("/api/ai/status").permitAll()
                .requestMatchers("/api/alerts/**").permitAll()
                .requestMatchers("/api/doctor/**").permitAll()
                .requestMatchers("/api/dashboard/**").permitAll()
                .requestMatchers("/api/notes/**").permitAll()
                
                // Require authentication for other API endpoints
                .requestMatchers("/api/**").authenticated()
                
                // Allow other requests
                .anyRequest().permitAll()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .httpBasic(basic -> basic.disable())
            .formLogin(form -> form.disable());

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(false);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
