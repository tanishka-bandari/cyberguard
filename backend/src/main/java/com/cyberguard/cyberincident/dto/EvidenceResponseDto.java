package com.cyberguard.cyberincident.dto;

import java.time.LocalDateTime;

import com.cyberguard.cyberincident.model.Evidence;

public record EvidenceResponseDto(
        Long id,
        String fileName,
        String fileType,
        Long fileSize,
        String sha256Hash,
        Long incidentId,
        Long uploadedById,
        String uploadedByName,
        LocalDateTime uploadedAt) {

    public static EvidenceResponseDto from(Evidence evidence) {
        return new EvidenceResponseDto(
                evidence.getId(),
                evidence.getFileName(),
                evidence.getFileType(),
                evidence.getFileSize(),
                evidence.getSha256Hash(),
                evidence.getIncident().getId(),
                evidence.getUploadedBy().getId(),
                evidence.getUploadedBy().getName(),
                evidence.getUploadedAt());
    }
}
