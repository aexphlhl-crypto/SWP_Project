package com.cinebook.backend.modules.users;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;

@RestController
public class TestSecurityController {
    @GetMapping("/api/test-role")
    public String testRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return "User: " + auth.getName() + ", Authorities: " + auth.getAuthorities();
    }
}
