package com.luxecraft.luxecraft.Model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse 
{
    private String token;

    private String firstName;

    private String lastName;

    private String phone;

    private String email;

    private String role;
}
    

