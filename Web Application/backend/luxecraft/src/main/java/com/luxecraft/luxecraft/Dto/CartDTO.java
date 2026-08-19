package com.luxecraft.luxecraft.Dto;

import lombok.Data;

@Data
public class CartDTO 
{
    private Long cartId;

    private Long productId;

    private String productName;

    private Double price;

    private String imageUrl;

    private int quantity;
    
}
