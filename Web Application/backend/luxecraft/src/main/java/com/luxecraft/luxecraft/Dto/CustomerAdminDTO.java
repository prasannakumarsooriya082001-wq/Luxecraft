package com.luxecraft.luxecraft.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerAdminDTO {

    private Long customerId;

    private String firstName;

    private String lastName;

    private String email;

    private String phone;

    private String role;

    private long orderCount;
}