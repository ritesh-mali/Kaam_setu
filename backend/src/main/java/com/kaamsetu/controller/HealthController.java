package com.kaamsetu.controller;

import com.kaamsetu.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final DataSource dataSource;

    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHealthStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("service", "KaamSetu Backend API");
        status.put("status", "UP");
        status.put("version", "1.0.0");
        status.put("timestamp", LocalDateTime.now().toString());

        boolean dbConnected = false;
        try (Connection connection = dataSource.getConnection()) {
            dbConnected = connection.isValid(2);
        } catch (Exception e) {
            dbConnected = false;
        }

        status.put("database", dbConnected ? "CONNECTED" : "DISCONNECTED");

        if (dbConnected) {
            return ResponseEntity.ok(ApiResponse.ok("System healthy and operational", status));
        } else {
            return ResponseEntity.status(503).body(new ApiResponse<>(false, "Database connection failure", status));
        }
    }
}

