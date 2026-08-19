package com.luxecraft.luxecraft.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecentOrderDTO {

    private Long orderId;

    private String customerName;

    private String productName;

    private String status;

    private Double amount;
}