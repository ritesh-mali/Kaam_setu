package com.kaamsetu.model;

import jakarta.persistence.*;

@Entity
@Table(name = "service_categories")
public class ServiceCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @Column(length = 500)
    private String description;

    @Column(length = 100)
    private String icon;

    @Column(name = "base_price_estimate")
    private Double basePriceEstimate;

    @Column(nullable = false)
    private boolean active = true;

    public ServiceCategory() {
    }

    public ServiceCategory(String name, String slug, String description, String icon, Double basePriceEstimate) {
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.icon = icon;
        this.basePriceEstimate = basePriceEstimate;
        this.active = true;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public Double getBasePriceEstimate() {
        return basePriceEstimate;
    }

    public void setBasePriceEstimate(Double basePriceEstimate) {
        this.basePriceEstimate = basePriceEstimate;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}

