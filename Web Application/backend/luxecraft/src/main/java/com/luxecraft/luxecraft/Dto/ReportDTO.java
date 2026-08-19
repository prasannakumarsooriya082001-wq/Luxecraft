package com.luxecraft.luxecraft.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReportDTO {

    private double totalRevenue;

    private long totalOrders;

    private long totalCustomers;

    private long totalProductsSold;

}