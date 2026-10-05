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

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {

        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

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

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .csrf(csrf ->
                        csrf.disable()
                )

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

                    // Authentication endpoints
                    auth.requestMatchers(
                            "/api/auth/**"
                    ).permitAll();

                    // CORS preflight
                    auth.requestMatchers(
                            HttpMethod.OPTIONS,
                            "/**"
                    ).permitAll();

                    // Incident creation
                    auth.requestMatchers(
                            HttpMethod.POST,
                            "/api/incidents"
                    ).authenticated();

                    // View incidents
                    auth.requestMatchers(
                            HttpMethod.GET,
                            "/api/incidents"
                    ).authenticated();

                    // View incidents reported by a specific user
                    auth.requestMatchers(
                            HttpMethod.GET,
                            "/api/incidents/user/**"
                    ).hasAnyRole(
                            "ANALYST",
                            "ADMIN"
                    );

                    // Update incident status
                    auth.requestMatchers(
                            HttpMethod.PUT,
                            "/api/incidents/*/status"
                    ).authenticated();

                    // Assign incident
                    auth.requestMatchers(
                            HttpMethod.PUT,
                            "/api/incidents/*/assign"
                    ).hasRole("ADMIN");

                    // Unassign incident
                    auth.requestMatchers(
                            HttpMethod.PUT,
                            "/api/incidents/*/unassign"
                    ).hasRole("ADMIN");

                    // Delete incident
                    auth.requestMatchers(
                            HttpMethod.DELETE,
                            "/api/incidents/*"
                    ).hasRole("ADMIN");

                    // Investigation notes
                    auth.requestMatchers(
                            HttpMethod.POST,
                            "/api/incidents/*/notes"
                    ).hasAnyRole(
                            "ANALYST",
                            "ADMIN"
                    );

                    // Evidence upload
                    auth.requestMatchers(
                            HttpMethod.POST,
                            "/api/incidents/*/evidence"
                    ).hasAnyRole(
                            "ANALYST",
                            "ADMIN"
                    );

                    // Dashboard
                    auth.requestMatchers(
                            "/api/dashboard"
                    ).authenticated();

                    // Audit logs
                    auth.requestMatchers(
                            "/api/audit-logs/**"
                    ).hasAnyRole(
                            "ANALYST",
                            "ADMIN"
                    );

                    // Staff users for assignment
                    auth.requestMatchers(
                            HttpMethod.GET,
                            "/api/users/staff"
                    ).hasRole("ADMIN");

                    // IMPORTANT:
                    // This is the ONLY anyRequest() in the configuration.
                    auth.anyRequest().authenticated();
                })

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}