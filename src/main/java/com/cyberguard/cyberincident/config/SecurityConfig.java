package com.cyberguard.cyberincident.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:5173",
                        "https://cyberguard-alx7cdhq4-cyber-guard6.vercel.app"
                )
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of("*")
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .cors(cors ->
                        cors.configurationSource(corsConfigurationSource())
                )

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> {

                    // Public authentication endpoints
                    auth.requestMatchers(
                            "/api/auth/**"
                    ).permitAll();

                    // Allow CORS preflight requests
                    auth.requestMatchers(
                            HttpMethod.OPTIONS,
                            "/**"
                    ).permitAll();

                    // Create incident - logged-in users only
                    auth.requestMatchers(
                            HttpMethod.POST,
                            "/api/incidents"
                    ).authenticated();

                    // Update incident status - Analyst/Admin only
                    auth.requestMatchers(
                            HttpMethod.PUT,
                            "/api/incidents/*/status"
                    ).hasAnyRole(
                            "ANALYST",
                            "ADMIN"
                    );

                    // Audit logs - Analyst/Admin only
                    auth.requestMatchers(
                            "/api/audit-logs/**"
                    ).hasAnyRole(
                            "ANALYST",
                            "ADMIN"
                    );

                    // Dashboard - logged-in users only
                    auth.requestMatchers(
                            "/api/dashboard"
                    ).authenticated();

                    // Everything else requires authentication
                    auth.anyRequest().authenticated();
                })

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}