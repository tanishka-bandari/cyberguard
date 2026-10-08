package com.cyberguard.cyberincident.dto;

import com.cyberguard.cyberincident.model.Role;
import com.cyberguard.cyberincident.model.User;

public record LoginResponse(
        String token, Long id, String name, String email, Role role) {

    public static LoginResponse from(User user, String token) {
        return new LoginResponse(
                token, user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}
