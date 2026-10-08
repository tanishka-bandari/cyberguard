package com.cyberguard.cyberincident.dto;

import java.time.LocalDateTime;

import com.cyberguard.cyberincident.model.AuditLog;

public record AuditLogResponseDto(
        Long id,
        String action,
        String details,
        Long userId,
        String userName,
        String userEmail,
        Long incidentId,
        LocalDateTime createdAt) {

    public static AuditLogResponseDto from(AuditLog log, boolean includeEmail) {
        return new AuditLogResponseDto(
                log.getId(),
                log.getAction(),
                log.getDetails(),
                log.getUser().getId(),
                log.getUser().getName(),
                includeEmail ? log.getUser().getEmail() : null,
                log.getIncident() != null ? log.getIncident().getId() : null,
                log.getCreatedAt());
    }
}
