package com.cinebook.backend.config;

import com.cinebook.backend.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .headers(headers -> headers
                .contentSecurityPolicy(csp -> csp.policyDirectives("frame-ancestors 'none'"))
                .addHeaderWriter((request, response) ->
                    response.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups")
                )
            )
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/payments/vnpay-return").permitAll()   // VNPay IPN/Return (no JWT)
                .requestMatchers("/api/payments/vnpay/callback").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/movies", "/api/movies/**", "/api/showtimes", "/api/showtimes/**", "/api/cinemas", "/api/cinemas/**", "/api/rooms", "/api/rooms/**", "/api/concessions", "/api/concessions/**", "/api/fnb", "/api/fnb/**", "/api/promos", "/api/promos/**", "/api/news", "/api/news/**", "/api/reviews", "/api/reviews/**", "/api/config", "/api/config/**", "/api/resale", "/api/resale/**", "/uploads/**", "/api/genres", "/api/genres/**").permitAll()
                // Swagger UI
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/api-docs/**", "/swagger-ui.html").permitAll()
                
                // SystemAdmin Only
                .requestMatchers("/api/dashboard/**").hasAnyRole("SystemAdmin", "ScheduleManager")
                .requestMatchers(HttpMethod.PUT, "/api/config/**").hasRole("SystemAdmin")
                .requestMatchers(HttpMethod.PUT, "/api/resale/*/hide").hasRole("SystemAdmin")
                
                // Allow anyone authenticated to hold/release seats
                .requestMatchers(HttpMethod.POST, "/api/showtimes/*/seats/*/hold").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/showtimes/*/seats/*/hold").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/showtimes/*/holds").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/showtimes/*/seats/hold/all").authenticated()

                // SystemAdmin & ScheduleManager (Management)
                .requestMatchers("/api/bookings/admin/**", "/api/admin/users/**").hasAnyRole("SystemAdmin", "ScheduleManager")
                .requestMatchers(HttpMethod.POST, "/api/movies/**", "/api/cinemas/**", "/api/rooms/**", "/api/showtimes/**", "/api/fnb/**", "/api/news/**", "/api/promos/**").hasAnyRole("SystemAdmin", "ScheduleManager")
                .requestMatchers(HttpMethod.PUT, "/api/movies/**", "/api/cinemas/**", "/api/rooms/**", "/api/showtimes/**", "/api/fnb/**", "/api/news/**", "/api/promos/**").hasAnyRole("SystemAdmin", "ScheduleManager")
                .requestMatchers(HttpMethod.DELETE, "/api/movies/**", "/api/cinemas/**", "/api/rooms/**", "/api/showtimes/**", "/api/fnb/**", "/api/news/**", "/api/promos/**").hasAnyRole("SystemAdmin", "ScheduleManager")
                
                // Customer Only
                .requestMatchers("/api/bookings/**").hasAnyRole("Customer", "SystemAdmin", "ScheduleManager")
                .requestMatchers("/api/payments/create-url").hasAnyRole("Customer", "SystemAdmin")
                .requestMatchers(HttpMethod.POST, "/api/reviews/**", "/api/resale", "/api/resale/**").hasRole("Customer")
                
                // All others require auth
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(Arrays.asList(allowedOrigins.split(",")));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
