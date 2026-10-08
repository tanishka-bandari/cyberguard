package com.cyberguard.cyberincident.dto;

import java.time.LocalDateTime;

public class EvidenceResponseDto {

    private Long id;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private String sha256Hash;
    private Long incidentId;
    private Long uploadedById;
    private String uploadedByName;
    private LocalDateTime uploadedAt;

    public EvidenceResponseDto() {
    }

    public EvidenceResponseDto(
            Long id,
            String fileName,
            String fileType,
            Long fileSize,
            String sha256Hash,
            Long incidentId,
            Long uploadedById,
            String uploadedByName,
            LocalDateTime uploadedAt) {

        this.id = id;
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.sha256Hash = sha256Hash;
        this.incidentId = incidentId;
        this.uploadedById = uploadedById;
        this.uploadedByName = uploadedByName;
        this.uploadedAt = uploadedAt;
    }

    public Long getId() {
        return id;
    }

    public String getFileName() {
        return fileName;
    }

    public String getFileType() {
        return fileType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public String getSha256Hash() {
        return sha256Hash;
    }

    public Long getIncidentId() {
        return incidentId;
    }

    public Long getUploadedById() {
        return uploadedById;
    }

    public String getUploadedByName() {
        return uploadedByName;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }
}