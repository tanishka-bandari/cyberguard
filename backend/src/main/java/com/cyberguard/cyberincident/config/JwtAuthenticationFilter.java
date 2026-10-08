package com.cyberguard.cyberincident.config;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.cyberguard.cyberincident.repository.UserRepository;
import com.cyberguard.cyberincident.service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserRepository userRepository) {

        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return request.getServletPath().startsWith("/api/auth/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String email = jwtService.extractEmail(authHeader.substring(7));

            userRepository.findByEmail(email).ifPresent(user -> {

                // The role comes from the database, not from the token, so a
                // role change applies to tokens that were issued earlier.
                // The user is kept in the details so AccessControl does not
                // have to load it again.
                var authentication = new UsernamePasswordAuthenticationToken(
                        user.getEmail(),
                        null,
                        List.of(new SimpleGrantedAuthority(
                                "ROLE_" + user.getRole().name())));
                authentication.setDetails(user);

                SecurityContextHolder.getContext().setAuthentication(authentication);
            });

        } catch (Exception e) {
            // Invalid or expired token: leave the request unauthenticated so
            // the security rules answer 401.
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}
