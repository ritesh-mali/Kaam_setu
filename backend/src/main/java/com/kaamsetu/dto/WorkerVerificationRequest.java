package com.kaamsetu.dto;

import jakarta.validation.constraints.NotBlank;

public class WorkerVerificationRequest {
    @NotBlank(message = "Status is required (VERIFIED / REJECTED)")
    private String status; // VERIFIED, REJECTED

    private String notes;

    public WorkerVerificationRequest() {}

    public WorkerVerificationRequest(String status, String notes) {
        this.status = status;
        this.notes = notes;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}

