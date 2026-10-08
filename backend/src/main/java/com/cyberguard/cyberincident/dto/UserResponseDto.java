package com.cyberguard.cyberincident.dto;

import com.cyberguard.cyberincident.model.Role;
import com.cyberguard.cyberincident.model.User;

public record UserResponseDto(Long id, String name, String email, Role role) {

    public static UserResponseDto from(User user) {
        return new UserResponseDto(
                user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}
