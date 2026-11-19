package com.kaamsetu.dto;

import jakarta.validation.constraints.NotBlank;

public class ReviewResponseRequest {
    @NotBlank(message = "Reply text is required")
    private String workerReply;

    public ReviewResponseRequest() {}

    public ReviewResponseRequest(String workerReply) {
        this.workerReply = workerReply;
    }

    public String getWorkerReply() {
        return workerReply;
    }

    public void setWorkerReply(String workerReply) {
        this.workerReply = workerReply;
    }
}

