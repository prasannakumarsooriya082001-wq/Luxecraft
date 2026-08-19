package com.luxecraft.luxecraft.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDTO 
{
    private Long orderItemId;
    private Long productId;
    private String productName;
    private String imageUrl;
    private int quantity;
    private Double price;
    private Double total;
    
}
