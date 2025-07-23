package com.example.HotelBooking.exceptions;

import com.example.HotelBooking.dtos.Response;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.sql.SQLException;
import java.sql.SQLIntegrityConstraintViolationException;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Response> handleAllUnknowExceptions(Exception ex) {
        Response response = Response.builder()
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .message(ex.getMessage())
                .build();
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<Response> handleNotFoundException(NotFoundException ex) {
        Response response = Response.builder()
                .status(HttpStatus.NOT_FOUND.value())
                .message(ex.getMessage())
                .build();
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }


    @ExceptionHandler(NameValueRequiredException.class)
    public ResponseEntity<Response> handleNameValueRequiredException(NameValueRequiredException ex) {
        Response response = Response.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message(ex.getMessage())
                .build();
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(InvalidCredentialException.class)
    public ResponseEntity<Response> handleInvalidCredentialException(InvalidCredentialException ex) {
        Response response = Response.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message(ex.getMessage())
                .build();
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(InvalidBookingStateAndDateException.class)
    public ResponseEntity<Response> handleInvalidBookingStateAndDateException(InvalidBookingStateAndDateException ex) {
        Response response = Response.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message(ex.getMessage())
                .build();
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    // SQL Exception Handlers
    @ExceptionHandler(SQLException.class)
    public ResponseEntity<Response> handleSQLException(SQLException ex) {
        Response response = Response.builder()
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .message("Database error occurred: " + ex.getMessage())
                .build();
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Response> handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        String message = "Data integrity violation";
        
        // Check for specific constraint violations
        if (ex.getMessage().contains("Duplicate entry")) {
            message = "This record already exists. Please check for duplicates.";
        } else if (ex.getMessage().contains("cannot be null")) {
            message = "Required field cannot be empty.";
        } else if (ex.getMessage().contains("foreign key constraint")) {
            message = "Cannot delete this record as it is being used by other records.";
        }
        
        Response response = Response.builder()
                .status(HttpStatus.CONFLICT.value())
                .message(message)
                .build();
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(DuplicateKeyException.class)
    public ResponseEntity<Response> handleDuplicateKeyException(DuplicateKeyException ex) {
        Response response = Response.builder()
                .status(HttpStatus.CONFLICT.value())
                .message("Duplicate entry detected. This record already exists.")
                .build();
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(EmptyResultDataAccessException.class)
    public ResponseEntity<Response> handleEmptyResultDataAccessException(EmptyResultDataAccessException ex) {
        Response response = Response.builder()
                .status(HttpStatus.NOT_FOUND.value())
                .message("No data found for the requested operation.")
                .build();
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(SQLIntegrityConstraintViolationException.class)
    public ResponseEntity<Response> handleSQLIntegrityConstraintViolationException(SQLIntegrityConstraintViolationException ex) {
        String message = "Database constraint violation";
        
        if (ex.getMessage().contains("Duplicate entry")) {
            message = "This value already exists and must be unique.";
        } else if (ex.getMessage().contains("foreign key constraint")) {
            message = "Cannot perform this operation due to related data dependencies.";
        }
        
        Response response = Response.builder()
                .status(HttpStatus.CONFLICT.value())
                .message(message)
                .build();
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }
}
