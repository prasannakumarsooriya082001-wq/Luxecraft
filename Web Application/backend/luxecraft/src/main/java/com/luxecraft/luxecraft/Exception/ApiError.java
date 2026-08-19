package com.luxecraft.luxecraft.Exception;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * The single JSON shape every failed request comes back in, so the frontend
 * can always read error.message instead of guessing.
 */
public record ApiError(
        int status,
        String error,
        String message,
        String path,
        Map<String, String> fieldErrors,
        LocalDateTime timestamp) {

    public static ApiError of(int status, String error, String message, String path) {
        return new ApiError(status, error, message, path, null, LocalDateTime.now());
    }

    public static ApiError withFields(
            int status, String error, String message, String path,
            Map<String, String> fieldErrors) {
        return new ApiError(status, error, message, path, fieldErrors, LocalDateTime.now());
    }
}
