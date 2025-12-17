package com.realestate.mlm.exception;

public class TreePlacementException extends RuntimeException {
    public TreePlacementException(String message) {
        super(message);
    }

    public TreePlacementException(String message, Throwable cause) {
        super(message, cause);
    }
}
