package com.kaamsetu.controller;

import com.kaamsetu.dto.ApiResponse;
import com.kaamsetu.model.ServiceCategory;
import com.kaamsetu.repository.ServiceCategoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final ServiceCategoryRepository categoryRepository;

    public CategoryController(ServiceCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ServiceCategory>>> getCategories() {
        List<ServiceCategory> categories = categoryRepository.findByActiveTrue();
        return ResponseEntity.ok(ApiResponse.ok(categories));
    }
}

