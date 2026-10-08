package com.cyberguard.cyberincident.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

import io.jsonwebtoken.JwtException;

class JwtServiceTest {

    private static final String SECRET = "unit-test-secret-that-is-long-enough-123";

    private final JwtService jwtService = new JwtService(SECRET);

    @Test
    void tokenRoundTripReturnsEmail() {
        String token = jwtService.generateToken("a@example.com", "USER");

        assertThat(jwtService.extractEmail(token)).isEqualTo("a@example.com");
    }

    @Test
    void tamperedTokenIsRejected() {
        String token = jwtService.generateToken("a@example.com", "USER");
        String tampered = token.substring(0, token.length() - 2)
                + (token.endsWith("AA") ? "BB" : "AA");

        assertThatThrownBy(() -> jwtService.extractEmail(tampered))
                .isInstanceOf(JwtException.class);
    }

    @Test
    void tokenSignedWithAnotherSecretIsRejected() {
        String foreign = new JwtService("another-secret-that-is-long-enough-456")
                .generateToken("a@example.com", "ADMIN");

        assertThatThrownBy(() -> jwtService.extractEmail(foreign))
                .isInstanceOf(JwtException.class);
    }

    @Test
    void shortSecretIsRejected() {
        assertThatThrownBy(() -> new JwtService("too-short"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("32");
    }
}
