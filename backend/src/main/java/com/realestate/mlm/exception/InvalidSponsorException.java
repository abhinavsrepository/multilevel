package com.realestate.mlm.exception;

public class InvalidSponsorException extends RuntimeException {
    public InvalidSponsorException(String message) {
        super(message);
    }

    public InvalidSponsorException(String message, Throwable cause) {
        super(message, cause);
    }
}
