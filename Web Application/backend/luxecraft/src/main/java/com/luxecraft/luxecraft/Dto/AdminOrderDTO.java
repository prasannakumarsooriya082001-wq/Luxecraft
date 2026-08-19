package com.luxecraft.luxecraft.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminOrderDTO {

    private Long orderId;

    private String customerName;

    private String productName;

    private String orderDate;

    private Double totalAmount;

    private String status;
}