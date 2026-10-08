package com.cyberguard.cyberincident.controller;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.InvalidMediaTypeException;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

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
            Authentication authentication) throws IOException {

        Evidence evidence = evidenceService.uploadEvidence(
                incidentId,
                file,
                authentication
        );

        return ResponseEntity.ok(toDto(evidence));
    }

    @GetMapping("/{incidentId}/evidence")
    public ResponseEntity<List<EvidenceResponseDto>> getEvidence(
            @PathVariable Long incidentId,
            Authentication authentication) {

        List<EvidenceResponseDto> evidenceList =
                evidenceService.getEvidenceByIncident(incidentId, authentication)
                        .stream()
                        .map(EvidenceController::toDto)
                        .toList();

        return ResponseEntity.ok(evidenceList);
    }

    @GetMapping("/{incidentId}/evidence/{evidenceId}/file")
    public ResponseEntity<Resource> downloadEvidence(
            @PathVariable Long incidentId,
            @PathVariable Long evidenceId,
            Authentication authentication) {

        Evidence evidence = evidenceService.getEvidenceForDownload(
                incidentId,
                evidenceId,
                authentication
        );

        Resource resource = new FileSystemResource(evidence.getFilePath());

        if (!resource.exists()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Evidence file is missing on the server");
        }

        return ResponseEntity.ok()
                .contentType(mediaTypeOf(evidence.getFileType()))
                .contentLength(evidence.getFileSize())
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename(evidence.getFileName(), StandardCharsets.UTF_8)
                                .build()
                                .toString())
                .body(resource);
    }

    private static MediaType mediaTypeOf(String fileType) {

        try {
            return MediaType.parseMediaType(fileType);
        } catch (InvalidMediaTypeException e) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
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
