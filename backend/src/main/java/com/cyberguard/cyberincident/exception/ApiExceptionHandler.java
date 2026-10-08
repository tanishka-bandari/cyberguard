package com.cyberguard.cyberincident.exception;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * Turns every error into {"status": 4xx, "message": "..."}.
 * ResponseEntityExceptionHandler already maps Spring MVC exceptions
 * (missing parameter, bad type, ResponseStatusException, upload too large)
 * to the right status; only the body shape is replaced here.
 */
@RestControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log =
            LoggerFactory.getLogger(ApiExceptionHandler.class);

    @Override
    protected ResponseEntity<Object> handleExceptionInternal(
            Exception ex,
            Object body,
            HttpHeaders headers,
            HttpStatusCode statusCode,
            WebRequest request) {

        String message = null;

        if (ex instanceof ResponseStatusException statusException) {
            message = statusException.getReason();
        } else if (body instanceof ProblemDetail problem) {
            message = problem.getDetail();
        }

        if (message == null || message.isBlank()) {
            message = HttpStatus.valueOf(statusCode.value()).getReasonPhrase();
        }

        return ResponseEntity
                .status(statusCode)
                .headers(headers)
                .body(Map.of("status", statusCode.value(), "message", message));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleUnexpected(Exception ex) {

        log.error("Unhandled exception", ex);

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "status", 500,
                        "message", "Unexpected server error"));
    }
}
