package com.cyberguard.cyberincident.service;

import com.cyberguard.cyberincident.dto.DashboardResponseDto;
import com.cyberguard.cyberincident.model.IncidentStatus;
import com.cyberguard.cyberincident.model.Severity;
import com.cyberguard.cyberincident.repository.IncidentRepository;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final IncidentRepository incidentRepository;

    public DashboardService(IncidentRepository incidentRepository) {
        this.incidentRepository = incidentRepository;
    }

    public DashboardResponseDto getDashboardData() {

        long total =
                incidentRepository.count();

        long reported =
                incidentRepository.countByStatus(
                        IncidentStatus.REPORTED
                );

        long investigating =
                incidentRepository.countByStatus(
                        IncidentStatus.UNDER_INVESTIGATION
                );

        long resolved =
                incidentRepository.countByStatus(
                        IncidentStatus.RESOLVED
                );

        long critical =
                incidentRepository.countBySeverity(
                        Severity.CRITICAL
                );

        long high =
                incidentRepository.countBySeverity(
                        Severity.HIGH
                );

        return new DashboardResponseDto(
                total,
                reported,
                investigating,
                resolved,
                critical,
                high
        );
    }
}