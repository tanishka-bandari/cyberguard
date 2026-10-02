package com.cyberguard.cyberincident.service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cyberguard.cyberincident.model.Evidence;
import com.cyberguard.cyberincident.model.Incident;
import com.cyberguard.cyberincident.model.User;
import com.cyberguard.cyberincident.repository.EvidenceRepository;
import com.cyberguard.cyberincident.repository.IncidentRepository;
import com.cyberguard.cyberincident.repository.UserRepository;

@Service
public class EvidenceService {

    private final EvidenceRepository evidenceRepository;
    private final IncidentRepository incidentRepository;
    private final UserRepository userRepository;

    private final Path uploadDirectory =
            Paths.get("uploads/evidence");

    public EvidenceService(
            EvidenceRepository evidenceRepository,
            IncidentRepository incidentRepository,
            UserRepository userRepository) {

        this.evidenceRepository = evidenceRepository;
        this.incidentRepository = incidentRepository;
        this.userRepository = userRepository;
    }

    public Evidence uploadEvidence(
            Long incidentId,
            MultipartFile file,
            String email) throws Exception {

        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() ->
                        new RuntimeException("Incident not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        Files.createDirectories(uploadDirectory);

        String fileName = System.currentTimeMillis()
                + "_" + file.getOriginalFilename();

        Path filePath = uploadDirectory.resolve(fileName);

        Files.copy(file.getInputStream(), filePath);

        String hash = calculateSHA256(file.getBytes());

        Evidence evidence = new Evidence();

        evidence.setFileName(file.getOriginalFilename());
        evidence.setFileType(file.getContentType());
        evidence.setFileSize(file.getSize());
        evidence.setSha256Hash(hash);
        evidence.setFilePath(filePath.toString());
        evidence.setIncident(incident);
        evidence.setUploadedBy(user);
        evidence.setUploadedAt(LocalDateTime.now());

        return evidenceRepository.save(evidence);
    }

    public List<Evidence> getEvidenceByIncident(Long incidentId) {
        return evidenceRepository.findByIncidentId(incidentId);
    }

    private String calculateSHA256(byte[] data)
            throws Exception {

        MessageDigest digest =
                MessageDigest.getInstance("SHA-256");

        byte[] hashBytes = digest.digest(data);

        StringBuilder hash = new StringBuilder();

        for (byte b : hashBytes) {
            hash.append(String.format("%02x", b));
        }

        return hash.toString();
    }
}