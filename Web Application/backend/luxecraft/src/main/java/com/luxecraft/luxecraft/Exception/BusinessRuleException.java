package com.luxecraft.luxecraft.Exception;

/**
 * Thrown when the request is well formed but breaks a rule of the shop -
 * ordering more than the available stock, cancelling a delivered order,
 * reusing a coupon. Maps to HTTP 400.
 */
public class BusinessRuleException extends RuntimeException {

    public BusinessRuleException(String message) {
        super(message);
    }
}
