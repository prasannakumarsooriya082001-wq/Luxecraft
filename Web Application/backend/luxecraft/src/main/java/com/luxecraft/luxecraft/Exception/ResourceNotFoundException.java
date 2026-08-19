package com.luxecraft.luxecraft.Exception;

/** Thrown when a requested record does not exist. Maps to HTTP 404. */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String what, Object id) {
        super(what + " not found with id " + id);
    }
}
