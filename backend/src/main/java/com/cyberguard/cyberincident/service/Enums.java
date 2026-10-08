package com.cyberguard.cyberincident.service;

import java.util.Arrays;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

final class Enums {

    private Enums() {
    }

    static <E extends Enum<E>> E parse(
            Class<E> type, String value, String field) {

        try {
            return Enum.valueOf(type, value == null ? "" : value.trim());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid " + field + ". Allowed values: "
                            + Arrays.toString(type.getEnumConstants()));
        }
    }
}
