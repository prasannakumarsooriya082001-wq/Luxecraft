package com.luxecraft.luxecraft.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class MonthlyRevenueDTO {

    private String month;

    private double revenue;

    public MonthlyRevenueDTO(
            String month,
            Number revenue) {

        this.month = month;

        this.revenue = revenue == null
                ? 0.0
                : revenue.doubleValue();
    }

}