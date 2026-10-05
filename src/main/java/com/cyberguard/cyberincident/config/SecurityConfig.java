package com.cyberguard.cyberincident.config;

import java.util.List;

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
                        "https://cyberguard-alx7cdhq-cyber-guard6.vercel.app"
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
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource()
                        )
                )

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> {

                    // =====================================================
                    // PUBLIC AUTHENTICATION
                    // =====================================================

                    auth.requestMatchers(
                            "/api/auth/**"
                    ).permitAll();

                    // CORS preflight
                    auth.requestMatchers(
                            HttpMethod.OPTIONS,
                            "/**"
                    ).permitAll();


                    // =====================================================
                    // INCIDENTS
                    // =====================================================

                    // Create incident - logged-in users
                    auth.requestMatchers(
                            HttpMethod.POST,
                            "/api/incidents"
                    ).authenticated();

                    // View incidents - logged-in users
                    auth.requestMatchers(
                            HttpMethod.GET,
                            "/api/incidents"
                    ).authenticated();

                    // View specific user's incidents
                    // Only ANALYST and ADMIN
                    auth.requestMatchers(
                            HttpMethod.GET,
                            "/api/incidents/user/**"
                    ).hasAnyRole(
                            "ANALYST",
                            "ADMIN"
                    );


                    // =====================================================
                    // INCIDENT STATUS
                    // =====================================================

                    // USER can update own incident.
                    // Ownership is checked inside IncidentService.
                    // ANALYST/ADMIN can update incidents.
                    auth.requestMatchers(
                            HttpMethod.PUT,
                            "/api/incidents/*/status"
                    ).authenticated();


                    // =====================================================
                    // INCIDENT ASSIGNMENT
                    // =====================================================

                    // Only ADMIN can assign an incident
                    auth.requestMatchers(
                            HttpMethod.PUT,
                            "/api/incidents/*/assign"
                    ).hasRole("ADMIN");

                    // Only ADMIN can remove an assignment
                    auth.requestMatchers(
                            HttpMethod.PUT,
                            "/api/incidents/*/unassign"
                    ).hasRole("ADMIN");


                    // =====================================================
                    // DELETE INCIDENT
                    // =====================================================

                    // ADMIN only
                    auth.requestMatchers(
                            HttpMethod.DELETE,
                            "/api/incidents/*"
                    ).hasRole("ADMIN");


                    // =====================================================
                    // INVESTIGATION NOTES
                    // =====================================================

                    // Only ANALYST/ADMIN can add investigation notes
                    auth.requestMatchers(
                            HttpMethod.POST,
                            "/api/incidents/*/notes"
                    ).hasAnyRole(
                            "ANALYST",
                            "ADMIN"
                    );


                    // =====================================================
                    // EVIDENCE
                    // =====================================================

                    // Only ANALYST/ADMIN can upload evidence
                    auth.requestMatchers(
                            HttpMethod.POST,
                            "/api/incidents/*/evidence"
                    ).hasAnyRole(
                            "ANALYST",
                            "ADMIN"
                    );


                    // =====================================================
                    // DASHBOARD
                    // =====================================================

                    auth.requestMatchers(
                            "/api/dashboard"
                    ).authenticated();


                    // =====================================================
                    // AUDIT LOGS
                    // =====================================================

                    auth.requestMatchers(
                            "/api/audit-logs/**"
                    ).hasAnyRole(
                            "ANALYST",
                            "ADMIN"
                    );

// Audit logs
auth.requestMatchers(
        "/api/audit-logs/**"
).hasAnyRole(
        "ANALYST",
        "ADMIN"
);

// Staff users for incident assignment
auth.requestMatchers(
        HttpMethod.GET,
        "/api/users/staff"
).hasRole("ADMIN");

// Everything else requires login
auth.anyRequest().authenticated();
                    // =====================================================
                    // EVERYTHING ELSE
                    // =====================================================

                    auth.anyRequest().authenticated();
                })

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}