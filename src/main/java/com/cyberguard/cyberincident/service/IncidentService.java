package com.cyberguard.cyberincident.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.cyberguard.cyberincident.model.Incident;
import com.cyberguard.cyberincident.model.IncidentStatus;
import com.cyberguard.cyberincident.model.User;
import com.cyberguard.cyberincident.repository.IncidentRepository;
import com.cyberguard.cyberincident.repository.UserRepository;

@Service
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final UserRepository userRepository;

    public IncidentService(IncidentRepository incidentRepository,
                           UserRepository userRepository) {
        this.incidentRepository = incidentRepository;
        this.userRepository = userRepository;
    }

    public Incident createIncident(
            String title,
            String description,
            String type,
            String severity,
            Integer riskScore,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Incident incident = new Incident();

        incident.setTitle(title);
        incident.setDescription(description);

        incident.setType(
                com.cyberguard.cyberincident.model.IncidentType.valueOf(type)
        );

        incident.setSeverity(
                com.cyberguard.cyberincident.model.Severity.valueOf(severity)
        );

        incident.setRiskScore(riskScore);
        incident.setStatus(IncidentStatus.REPORTED);
        incident.setReportedBy(user);
        incident.setReportedAt(LocalDateTime.now());

        return incidentRepository.save(incident);
    }

    public List<Incident> getAllIncidents() {
        return incidentRepository.findAll();
    }

    public List<Incident> getIncidentsByUser(Long userId) {
        return incidentRepository.findByReportedById(userId);
    }

    public Incident updateStatus(Long incidentId, String status) {

        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() ->
                        new RuntimeException("Incident not found"));

        incident.setStatus(
                IncidentStatus.valueOf(status)
        );

        return incidentRepository.save(incident);
    }
}