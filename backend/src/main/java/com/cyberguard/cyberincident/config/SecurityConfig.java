package com.cyberguard.cyberincident.config;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final List<String> allowedOrigins;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            @Value("${app.cors.allowed-origins}") List<String> allowedOrigins) {

        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.allowedOrigins = allowedOrigins;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(allowedOrigins);

        configuration.setAllowedMethods(
                List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        configuration.setAllowedHeaders(
                List.of("Authorization", "Content-Type", "Accept", "Origin"));

        // The frontend reads the download file name from Content-Disposition.
        configuration.setExposedHeaders(
                List.of("Authorization", "Content-Disposition"));

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

                .cors(cors -> cors.configurationSource(
                        corsConfigurationSource()
                ))

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // Missing or expired token -> 401, wrong role -> 403.
                .exceptionHandling(errors -> errors
                        .authenticationEntryPoint((request, response, e) ->
                                writeError(response, 401,
                                        "Authentication required"))
                        .accessDeniedHandler((request, response, e) ->
                                writeError(response, 403, "Access denied"))
                )

                // Role-only rules live here. Rules that depend on who
                // reported an incident are checked in the services.
                .authorizeHttpRequests(auth -> {

                    auth.requestMatchers("/api/auth/**").permitAll();

                    auth.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll();

                    auth.requestMatchers(HttpMethod.GET, "/api/incidents/user/**")
                            .hasAnyRole("ANALYST", "ADMIN");

                    auth.requestMatchers(HttpMethod.PUT, "/api/incidents/*/status")
                            .hasAnyRole("ANALYST", "ADMIN");

                    auth.requestMatchers(HttpMethod.PUT,
                            "/api/incidents/*/assign",
                            "/api/incidents/*/unassign")
                            .hasRole("ADMIN");

                    auth.requestMatchers(HttpMethod.DELETE, "/api/incidents/*")
                            .hasRole("ADMIN");

                    auth.requestMatchers(HttpMethod.POST, "/api/incidents/*/notes")
                            .hasAnyRole("ANALYST", "ADMIN");

                    auth.requestMatchers("/api/dashboard", "/api/audit-logs/recent")
                            .hasAnyRole("ANALYST", "ADMIN");

                    auth.requestMatchers(HttpMethod.GET, "/api/users/staff")
                            .hasAnyRole("ANALYST", "ADMIN");

                    auth.requestMatchers("/api/users", "/api/users/**")
                            .hasRole("ADMIN");

                    auth.anyRequest().authenticated();
                })

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    private static void writeError(
            HttpServletResponse response,
            int status,
            String message) throws IOException {

        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(
                "{\"status\":" + status + ",\"message\":\"" + message + "\"}");
    }
}
