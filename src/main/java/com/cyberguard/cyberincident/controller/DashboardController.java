package com.cyberguard.cyberincident.controller;

import com.cyberguard.cyberincident.dto.DashboardResponseDto;
import com.cyberguard.cyberincident.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<DashboardResponseDto> getDashboard() {

        return ResponseEntity.ok(
                dashboardService.getDashboardData()
        );
    }
}