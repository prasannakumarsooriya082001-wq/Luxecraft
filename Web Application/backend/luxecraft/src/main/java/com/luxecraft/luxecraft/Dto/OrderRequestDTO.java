package com.luxecraft.luxecraft.Dto;

import lombok.Data;

@Data
public class OrderRequestDTO
 
{
    private String firstName;

    private String lastName;

    private String email;

    private String phone;

    private String streetAddress;

    private String city;

    private String state;

    private String zipCode;

    private String country;

    private String paymentMethod;

    /** Optional. Only the code travels from the browser - never the discount. */
    private String couponCode;
    
}
