package com.cyberguard.cyberincident.service;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

final class Validation {

    private Validation() {
    }

    static ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    /** Returns the trimmed text, or throws 400 if it is blank or longer than maxLength. */
    static String requireText(String value, String field, int maxLength) {

        if (value == null || value.isBlank()) {
            throw badRequest(field + " is required");
        }

        String text = value.trim();

        if (text.length() > maxLength) {
            throw badRequest(field + " must be at most " + maxLength + " characters");
        }

        return text;
    }
}
