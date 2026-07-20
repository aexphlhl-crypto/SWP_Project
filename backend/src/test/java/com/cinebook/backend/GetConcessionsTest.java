package com.cinebook.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import com.cinebook.backend.modules.fnb.repository.FnBProductRepository;

@SpringBootTest
public class GetConcessionsTest {
    @Autowired
    private FnBProductRepository repository;
    
    @Test
    public void testFindAll() {
        try {
            System.out.println("=== RUNNING REPOSITORY FIND ALL ===");
            var list = repository.findAll();
            System.out.println("Succeeded! Total products loaded: " + list.size());
        } catch (Exception e) {
            System.out.println("=== REPOSITORY FIND ALL FAILED ===");
            e.printStackTrace();
        }
    }
}
