package com.cyberguard.cyberincident.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cyberguard.cyberincident.dto.UserResponseDto;
import com.cyberguard.cyberincident.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // ANALYST and ADMIN users, used to pick an assignee.
    @GetMapping("/staff")
    public ResponseEntity<List<UserResponseDto>> getStaffUsers(
            Authentication authentication) {

        return ResponseEntity.ok(
                userService.getStaffUsers(authentication).stream()
                        .map(UserResponseDto::from)
                        .toList());
    }

    @GetMapping
    public ResponseEntity<List<UserResponseDto>> getAllUsers(
            Authentication authentication) {

        return ResponseEntity.ok(
                userService.getAllUsers(authentication).stream()
                        .map(UserResponseDto::from)
                        .toList());
    }

    @PutMapping("/{userId}/role")
    public ResponseEntity<UserResponseDto> changeRole(
            @PathVariable Long userId,
            @RequestParam String role,
            Authentication authentication) {

        return ResponseEntity.ok(
                UserResponseDto.from(
                        userService.changeRole(userId, role, authentication)));
    }
}
