package com.luxecraft.luxecraft.Config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig
{

    // Comma-separated list, set per environment so a new deployment does
    // not need a code change. See app.cors.allowed-origins.
    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        // Frontend URLs
        configuration.setAllowedOrigins(
                Arrays.stream(allowedOrigins.split(","))
                        .map(String::trim)
                        .filter(origin -> !origin.isEmpty())
                        .toList());

        // Methods
        configuration.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));

        // Headers
        configuration.setAllowedHeaders(List.of("Authorization","Content-Type","X-Admin-Email"));

        // If cookies/session are used later
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**",configuration);

        return source;
    }
    
}
