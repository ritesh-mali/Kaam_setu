package com.kaamsetu.dto;

public class AdminStatsDto {
    private long totalUsers;
    private long totalCustomers;
    private long totalWorkers;
    private long verifiedWorkers;
    private long pendingWorkers;
    private long totalBookings;
    private long pendingBookings;
    private long inProgressBookings;
    private long completedBookings;
    private long cancelledBookings;
    private double totalRevenue;

    public AdminStatsDto() {}

    // Getters and Setters
    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public long getTotalWorkers() {
        return totalWorkers;
    }

    public void setTotalWorkers(long totalWorkers) {
        this.totalWorkers = totalWorkers;
    }

    public long getVerifiedWorkers() {
        return verifiedWorkers;
    }

    public void setVerifiedWorkers(long verifiedWorkers) {
        this.verifiedWorkers = verifiedWorkers;
    }

    public long getPendingWorkers() {
        return pendingWorkers;
    }

    public void setPendingWorkers(long pendingWorkers) {
        this.pendingWorkers = pendingWorkers;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public long getPendingBookings() {
        return pendingBookings;
    }

    public void setPendingBookings(long pendingBookings) {
        this.pendingBookings = pendingBookings;
    }

    public long getInProgressBookings() {
        return inProgressBookings;
    }

    public void setInProgressBookings(long inProgressBookings) {
        this.inProgressBookings = inProgressBookings;
    }

    public long getCompletedBookings() {
        return completedBookings;
    }

    public void setCompletedBookings(long completedBookings) {
        this.completedBookings = completedBookings;
    }

    public long getCancelledBookings() {
        return cancelledBookings;
    }

    public void setCancelledBookings(long cancelledBookings) {
        this.cancelledBookings = cancelledBookings;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }
}

