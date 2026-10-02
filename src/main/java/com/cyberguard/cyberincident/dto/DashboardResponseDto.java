package com.cyberguard.cyberincident.dto;

public class DashboardResponseDto {

    private long totalIncidents;
    private long reportedIncidents;
    private long underInvestigation;
    private long resolvedIncidents;
    private long criticalIncidents;
    private long highSeverityIncidents;

    public DashboardResponseDto() {
    }

    public DashboardResponseDto(
            long totalIncidents,
            long reportedIncidents,
            long underInvestigation,
            long resolvedIncidents,
            long criticalIncidents,
            long highSeverityIncidents) {

        this.totalIncidents = totalIncidents;
        this.reportedIncidents = reportedIncidents;
        this.underInvestigation = underInvestigation;
        this.resolvedIncidents = resolvedIncidents;
        this.criticalIncidents = criticalIncidents;
        this.highSeverityIncidents = highSeverityIncidents;
    }

    public long getTotalIncidents() {
        return totalIncidents;
    }

    public long getReportedIncidents() {
        return reportedIncidents;
    }

    public long getUnderInvestigation() {
        return underInvestigation;
    }

    public long getResolvedIncidents() {
        return resolvedIncidents;
    }

    public long getCriticalIncidents() {
        return criticalIncidents;
    }

    public long getHighSeverityIncidents() {
        return highSeverityIncidents;
    }
}