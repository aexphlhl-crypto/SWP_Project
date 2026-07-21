package com.cinebook.backend;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
public class HashTest {
    @Test
    public void printHash() {
        System.out.println("HASH_OUTPUT=" + new BCryptPasswordEncoder(12).encode("123456"));
    }
}
