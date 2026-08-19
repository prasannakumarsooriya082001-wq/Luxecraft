package com.luxecraft.luxecraft.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse
{
    private long products;

    private long orders;

    private long customers;

    private double revenue;
    
}
