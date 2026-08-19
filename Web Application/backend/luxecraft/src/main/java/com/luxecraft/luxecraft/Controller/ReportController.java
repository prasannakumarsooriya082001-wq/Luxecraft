package com.luxecraft.luxecraft.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.luxecraft.luxecraft.Dto.MonthlyRevenueDTO;
import com.luxecraft.luxecraft.Dto.ReportDTO;
import com.luxecraft.luxecraft.Service.ReportService;

@RestController
@RequestMapping("/reports")
public class ReportController {

        @Autowired
        private ReportService reportService;

        // ================= DASHBOARD REPORT =================

        @GetMapping("/dashboard")
        public ReportDTO getDashboardReport() {

                return reportService.getDashboardReport();

        }

        @GetMapping("/revenue")
        public List<MonthlyRevenueDTO> getMonthlyRevenue() {

                return reportService.getMonthlyRevenue();

        }
}