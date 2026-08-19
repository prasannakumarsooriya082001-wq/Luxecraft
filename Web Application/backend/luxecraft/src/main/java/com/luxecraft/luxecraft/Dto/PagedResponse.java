package com.luxecraft.luxecraft.Dto;

import java.util.List;

import org.springframework.data.domain.Page;

/**
 * Flat pagination envelope. Spring's own Page serialises with a lot of extra
 * structure that the frontend does not need, so this keeps the JSON small and
 * stable.
 */
public record PagedResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalItems,
        int totalPages,
        boolean first,
        boolean last) {

    public static <T> PagedResponse<T> from(Page<T> page) {
        return new PagedResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast());
    }
}
