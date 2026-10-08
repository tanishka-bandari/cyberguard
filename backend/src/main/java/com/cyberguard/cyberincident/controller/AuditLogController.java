package com.cyberguard.cyberincident.controller;

import com.cyberguard.cyberincident.dto.AuditLogResponseDto;
import com.cyberguard.cyberincident.model.AuditLog;
import com.cyberguard.cyberincident.service.AuditLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @PostMapping
    public ResponseEntity<AuditLogResponseDto> createLog(
            @RequestParam String action,
            @RequestParam String details,
            @RequestParam String email,
            @RequestParam(required = false) Long incidentId) {

        AuditLog log = auditLogService.createLog(
                action,
                details,
                email,
                incidentId
        );

        return ResponseEntity.ok(toDto(log));
    }

    @GetMapping("/incident/{incidentId}")
    public ResponseEntity<List<AuditLogResponseDto>> getLogs(
            @PathVariable Long incidentId) {

        List<AuditLogResponseDto> logs =
                auditLogService.getLogsByIncident(incidentId)
                        .stream()
                        .map(AuditLogController::toDto)
                        .toList();

        return ResponseEntity.ok(logs);
    }

    private static AuditLogResponseDto toDto(AuditLog log) {

        return new AuditLogResponseDto(
                log.getId(),
                log.getAction(),
                log.getDetails(),
                log.getUser().getId(),
                log.getUser().getName(),
                log.getUser().getEmail(),
                log.getIncident() != null
                        ? log.getIncident().getId()
                        : null,
                log.getCreatedAt()
        );
    }
}