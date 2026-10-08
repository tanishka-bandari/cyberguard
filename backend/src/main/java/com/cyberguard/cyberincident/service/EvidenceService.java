package com.cyberguard.cyberincident.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.cyberguard.cyberincident.model.Evidence;
import com.cyberguard.cyberincident.model.Incident;
import com.cyberguard.cyberincident.model.User;
import com.cyberguard.cyberincident.repository.EvidenceRepository;

@Service
@Transactional
public class EvidenceService {

    private static final Logger log =
            LoggerFactory.getLogger(EvidenceService.class);

    private static final int MAX_EXTENSION_LENGTH = 10;
    private static final int MAX_FILE_NAME_LENGTH = 255;

    private final EvidenceRepository evidenceRepository;
    private final AccessControl access;
    private final AuditLogService auditLogService;
    private final Path uploadDirectory;

    public EvidenceService(
            EvidenceRepository evidenceRepository,
            AccessControl access,
            AuditLogService auditLogService,
            @Value("${app.upload-dir}") String uploadDir) {

        this.evidenceRepository = evidenceRepository;
        this.access = access;
        this.auditLogService = auditLogService;
        this.uploadDirectory = Paths.get(uploadDir);
    }

    public Evidence uploadEvidence(
            Long incidentId,
            MultipartFile file,
            Authentication authentication) throws IOException {

        User user = access.currentUser(authentication);
        Incident incident = access.findIncident(incidentId);
        access.requireStaffOrReporter(user, incident);

        if (file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "File is empty");
        }

        String originalName = cleanFileName(file.getOriginalFilename());
        byte[] data = file.getBytes();

        // The name on disk contains nothing the client sent except
        // a short alphanumeric extension.
        Files.createDirectories(uploadDirectory);
        Path filePath = uploadDirectory.resolve(
                UUID.randomUUID() + extensionOf(originalName));
        Files.write(filePath, data);

        try {
            Evidence evidence = new Evidence();

            evidence.setFileName(originalName);
            evidence.setFileType(file.getContentType() != null
                    ? file.getContentType()
                    : "application/octet-stream");
            evidence.setFileSize(file.getSize());
            evidence.setSha256Hash(sha256(data));
            evidence.setFilePath(filePath.toString());
            evidence.setIncident(incident);
            evidence.setUploadedBy(user);
            evidence.setUploadedAt(LocalDateTime.now());

            evidence = evidenceRepository.save(evidence);

            auditLogService.log(user, incident, "EVIDENCE_UPLOADED",
                    "Uploaded " + originalName);

            return evidence;
        } catch (RuntimeException e) {
            // The transaction rolls back, so the file would be orphaned.
            deleteQuietly(filePath);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public List<Evidence> getEvidenceByIncident(
            Long incidentId,
            Authentication authentication) {

        User user = access.currentUser(authentication);
        access.requireStaffOrReporter(user, access.findIncident(incidentId));

        return evidenceRepository.findByIncidentId(incidentId);
    }

    @Transactional(readOnly = true)
    public Evidence getEvidenceForDownload(
            Long incidentId,
            Long evidenceId,
            Authentication authentication) {

        User user = access.currentUser(authentication);
        access.requireStaffOrReporter(user, access.findIncident(incidentId));

        return evidenceRepository.findById(evidenceId)
                .filter(e -> e.getIncident().getId().equals(incidentId))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Evidence not found"));
    }

    /**
     * Removes the evidence rows now and their files once the surrounding
     * transaction commits, so a rollback never leaves rows without files.
     */
    public void deleteByIncident(Long incidentId) {

        List<Evidence> items = evidenceRepository.findByIncidentId(incidentId);
        List<Path> files = items.stream()
                .map(item -> Paths.get(item.getFilePath()))
                .toList();

        evidenceRepository.deleteAll(items);

        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        files.forEach(EvidenceService::deleteQuietly);
                    }
                });
    }

    private static void deleteQuietly(Path file) {
        try {
            Files.deleteIfExists(file);
        } catch (IOException e) {
            log.warn("Could not delete evidence file {}", file, e);
        }
    }

    private static String cleanFileName(String name) {

        if (name == null) {
            return "file";
        }

        // Browsers send a bare name, but some clients send a full path.
        String bare = name.substring(
                Math.max(name.lastIndexOf('/'), name.lastIndexOf('\\')) + 1);

        if (bare.isBlank()) {
            return "file";
        }

        return bare.length() > MAX_FILE_NAME_LENGTH
                ? bare.substring(bare.length() - MAX_FILE_NAME_LENGTH)
                : bare;
    }

    private static String extensionOf(String fileName) {

        int dot = fileName.lastIndexOf('.');

        if (dot < 0) {
            return "";
        }

        String extension = fileName.substring(dot + 1)
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]", "");

        if (extension.isEmpty() || extension.length() > MAX_EXTENSION_LENGTH) {
            return "";
        }

        return "." + extension;
    }

    private static String sha256(byte[] data) {

        try {
            return HexFormat.of().formatHex(
                    MessageDigest.getInstance("SHA-256").digest(data));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
