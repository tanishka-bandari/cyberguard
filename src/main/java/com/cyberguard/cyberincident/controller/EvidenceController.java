package com.cyberguard.cyberincident.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.cyberguard.cyberincident.dto.EvidenceResponseDto;
import com.cyberguard.cyberincident.model.Evidence;
import com.cyberguard.cyberincident.service.EvidenceService;

@RestController
@RequestMapping("/api/incidents")
public class EvidenceController {

    private final EvidenceService evidenceService;

    public EvidenceController(EvidenceService evidenceService) {
        this.evidenceService = evidenceService;
    }

    @PostMapping("/{incidentId}/evidence")
    public ResponseEntity<EvidenceResponseDto> uploadEvidence(
            @PathVariable Long incidentId,
            @RequestParam("file") MultipartFile file,
            @RequestParam String email) throws Exception {

        Evidence evidence = evidenceService.uploadEvidence(
                incidentId,
                file,
                email
        );

        return ResponseEntity.ok(toDto(evidence));
    }

    @GetMapping("/{incidentId}/evidence")
    public ResponseEntity<List<EvidenceResponseDto>> getEvidence(
            @PathVariable Long incidentId) {

        List<EvidenceResponseDto> evidenceList =
                evidenceService.getEvidenceByIncident(incidentId)
                        .stream()
                        .map(EvidenceController::toDto)
                        .toList();

        return ResponseEntity.ok(evidenceList);
    }

    private static EvidenceResponseDto toDto(Evidence evidence) {

        return new EvidenceResponseDto(
                evidence.getId(),
                evidence.getFileName(),
                evidence.getFileType(),
                evidence.getFileSize(),
                evidence.getSha256Hash(),
                evidence.getIncident().getId(),
                evidence.getUploadedBy().getId(),
                evidence.getUploadedBy().getName(),
                evidence.getUploadedAt()
        );
    }
}