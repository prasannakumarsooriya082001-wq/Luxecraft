package com.luxecraft.luxecraft.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.luxecraft.luxecraft.Model.DashboardResponse;
import com.luxecraft.luxecraft.Service.DashboardService;

@RestController
@RequestMapping("/admin/dashboard")
@CrossOrigin("*")
public class DashboardController 
{
    @Autowired
    private DashboardService dashboardService;


    @GetMapping
    public DashboardResponse getDashboard() {

        return dashboardService.getDashboardData();

    }
    
}
