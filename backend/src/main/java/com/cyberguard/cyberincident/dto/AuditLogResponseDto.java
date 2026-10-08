package com.cyberguard.cyberincident.dto;

import java.time.LocalDateTime;

public class AuditLogResponseDto {

    private Long id;
    private String action;
    private String details;
    private Long userId;
    private String userName;
    private String userEmail;
    private Long incidentId;
    private LocalDateTime createdAt;

    public AuditLogResponseDto() {
    }

    public AuditLogResponseDto(
            Long id,
            String action,
            String details,
            Long userId,
            String userName,
            String userEmail,
            Long incidentId,
            LocalDateTime createdAt) {

        this.id = id;
        this.action = action;
        this.details = details;
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.incidentId = incidentId;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getAction() {
        return action;
    }

    public String getDetails() {
        return details;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUserName() {
        return userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public Long getIncidentId() {
        return incidentId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}