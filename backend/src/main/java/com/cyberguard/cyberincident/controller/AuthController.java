package com.cyberguard.cyberincident.controller;

import com.cyberguard.cyberincident.dto.LoginRequest;
import com.cyberguard.cyberincident.dto.LoginResponse;
import com.cyberguard.cyberincident.dto.UserResponseDto;
import com.cyberguard.cyberincident.model.User;
import com.cyberguard.cyberincident.service.JwtService;
import com.cyberguard.cyberincident.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;

    public AuthController(UserService userService,
                          JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponseDto> register(
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam String password) {

        User user = userService.registerUser(name, email, password);

        return ResponseEntity.ok(UserResponseDto.from(user));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request) {

        User user = userService.loginUser(
                request.email(),
                request.password()
        );

        return ResponseEntity.ok(
                LoginResponse.from(user, jwtService.generateToken(user.getEmail())));
    }
}