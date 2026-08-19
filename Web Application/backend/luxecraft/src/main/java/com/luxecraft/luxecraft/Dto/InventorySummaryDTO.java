package com.luxecraft.luxecraft.Dto;

/** Headline inventory numbers for the admin products screen. */
public record InventorySummaryDTO(
        long totalProducts,
        long lowStockCount,
        long outOfStockCount,
        int lowStockThreshold) {
}
