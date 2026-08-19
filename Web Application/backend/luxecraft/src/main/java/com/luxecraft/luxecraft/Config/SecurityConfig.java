package com.luxecraft.luxecraft.Config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

        @Autowired
        private JwtAuthenticationFilter jwtAuthenticationFilter;

        @Autowired
        private RestAuthenticationEntryPoint restAuthenticationEntryPoint;

        @Autowired
        private RestAccessDeniedHandler restAccessDeniedHandler;

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public SecurityFilterChain securityFilterChain(
                        HttpSecurity http) throws Exception {

                http
                                .csrf(csrf -> csrf.disable())

                                .cors(Customizer.withDefaults())

                                // JWT is stateless - never create an HTTP session
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(
                                                                SessionCreationPolicy.STATELESS))

                                .exceptionHandling(ex -> ex
                                                .authenticationEntryPoint(restAuthenticationEntryPoint)
                                                .accessDeniedHandler(restAccessDeniedHandler))

                                .authorizeHttpRequests(auth -> auth

                                                // =========================
                                                // CORS PREFLIGHT
                                                // =========================
                                                .requestMatchers(
                                                                HttpMethod.OPTIONS,
                                                                "/**")
                                                .permitAll()

                                                // =========================
                                                // PUBLIC - LOGIN / SIGNUP / RESET
                                                // =========================
                                                .requestMatchers(
                                                                HttpMethod.POST,
                                                                "/customer/register",
                                                                "/customer/login",
                                                                "/customer/forgot-password",
                                                                "/customer/verify-otp",
                                                                "/customer/reset-password",
                                                                "/admin/login",
                                                                "/contact/send")
                                                .permitAll()

                                                // =========================
                                                // PUBLIC - BROWSING THE SHOP
                                                // Read-only. Writes are handled further down.
                                                // =========================
                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/product/getAll",
                                                                "/product/get/**",
                                                                "/product/search",
                                                                "/category/getAll",
                                                                "/category/get/**",
                                                                "/review/product/**",
                                                                "/uploads/**")
                                                .permitAll()

                                                // =========================
                                                // ADMIN ONLY
                                                // These sit under /order and /customer, so they do
                                                // NOT match "/admin/**" and need their own rules.
                                                // =========================
                                                .requestMatchers("/admin/**")
                                                .hasRole("ADMIN")

                                                .requestMatchers("/reports/**")
                                                .hasRole("ADMIN")

                                                .requestMatchers("/customer/admin/**")
                                                .hasRole("ADMIN")

                                                .requestMatchers("/order/admin/**")
                                                .hasRole("ADMIN")

                                                // Inventory / stock management
                                                .requestMatchers("/product/admin/**")
                                                .hasRole("ADMIN")

                                                // Coupon management
                                                .requestMatchers("/coupon/admin/**")
                                                .hasRole("ADMIN")

                                                // Catalogue writes are admin-only
                                                .requestMatchers(
                                                                HttpMethod.POST,
                                                                "/product/**",
                                                                "/category/**")
                                                .hasRole("ADMIN")

                                                .requestMatchers(
                                                                HttpMethod.PUT,
                                                                "/product/**",
                                                                "/category/**")
                                                .hasRole("ADMIN")

                                                .requestMatchers(
                                                                HttpMethod.DELETE,
                                                                "/product/**",
                                                                "/category/**")
                                                .hasRole("ADMIN")

                                                // =========================
                                                // EVERYTHING ELSE NEEDS A LOGIN
                                                // cart, wishlist, checkout, payment, profile, reviews
                                                // =========================
                                                .anyRequest()
                                                .authenticated())

                                .addFilterBefore(
                                                jwtAuthenticationFilter,
                                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }
}
