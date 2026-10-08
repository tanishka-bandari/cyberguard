package com.cyberguard.cyberincident.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cyberguard.cyberincident.dto.AuditLogResponseDto;
import com.cyberguard.cyberincident.service.AuditLogService;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping("/incident/{incidentId}")
    public ResponseEntity<List<AuditLogResponseDto>> getLogs(
            @PathVariable Long incidentId,
            Authentication authentication) {

        return ResponseEntity.ok(
                auditLogService.getLogsByIncident(incidentId, authentication));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<AuditLogResponseDto>> getRecent(
            @RequestParam(defaultValue = "50") int limit,
            Authentication authentication) {

        return ResponseEntity.ok(
                auditLogService.getRecentLogs(limit, authentication)
                        .stream()
                        .map(log -> AuditLogResponseDto.from(log, true))
                        .toList());
    }
}
