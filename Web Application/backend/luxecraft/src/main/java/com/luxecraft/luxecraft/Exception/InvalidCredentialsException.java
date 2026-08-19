package com.luxecraft.luxecraft.Exception;

/** Wrong email or password on a login / password-change attempt. Maps to HTTP 401. */
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException(String message) {
        super(message);
    }
}
