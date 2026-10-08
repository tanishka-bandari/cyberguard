package com.cyberguard.cyberincident.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import com.cyberguard.cyberincident.model.Incident;
import com.cyberguard.cyberincident.model.Role;
import com.cyberguard.cyberincident.model.User;
import com.cyberguard.cyberincident.repository.IncidentRepository;
import com.cyberguard.cyberincident.repository.UserRepository;

/** The role and ownership rules shared by all services. */
@Component
public class AccessControl {

    private final UserRepository userRepository;
    private final IncidentRepository incidentRepository;

    public AccessControl(
            UserRepository userRepository,
            IncidentRepository incidentRepository) {

        this.userRepository = userRepository;
        this.incidentRepository = incidentRepository;
    }

    public User currentUser(Authentication authentication) {

        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        // Set by JwtAuthenticationFilter; other callers fall back to a lookup.
        if (authentication.getDetails() instanceof User user) {
            return user;
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated user no longer exists"));
    }

    public static boolean isStaff(User user) {
        return user.getRole() == Role.ADMIN
                || user.getRole() == Role.ANALYST;
    }

    public User requireStaff(Authentication authentication) {

        User user = currentUser(authentication);

        if (!isStaff(user)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only ANALYST or ADMIN can do this");
        }

        return user;
    }

    public User requireAdmin(Authentication authentication) {

        User user = currentUser(authentication);

        if (user.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Only ADMIN can do this");
        }

        return user;
    }

    public Incident findIncident(Long incidentId) {

        return incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Incident not found"));
    }

    public void requireStaffOrReporter(User user, Incident incident) {

        if (!isStaff(user)
                && !incident.getReportedBy().getId().equals(user.getId())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You do not have access to this incident");
        }
    }
}
