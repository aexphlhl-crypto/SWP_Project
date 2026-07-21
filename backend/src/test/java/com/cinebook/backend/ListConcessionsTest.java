package com.cinebook.backend;

import org.junit.jupiter.api.Test;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class ListConcessionsTest {
    @Test
    public void printAllConcessions() throws Exception {
        String host = System.getenv("DB_HOST") != null ? System.getenv("DB_HOST") : "localhost";
        String port = System.getenv("DB_PORT") != null ? System.getenv("DB_PORT") : "3306";
        String name = System.getenv("DB_NAME") != null ? System.getenv("DB_NAME") : "cinebook_db";
        String user = System.getenv("DB_USERNAME") != null ? System.getenv("DB_USERNAME") : "root";
        String pwd = System.getenv("DB_PASSWORD") != null ? System.getenv("DB_PASSWORD") : "123456";
        
        String url = "jdbc:mysql://" + host + ":" + port + "/" + name + "?useSSL=false&allowPublicKeyRetrieval=true";
        
        try (Connection c = DriverManager.getConnection(url, user, pwd);
             Statement s = c.createStatement()) {
            
            System.out.println("=== LISTING ALL F&B PRODUCTS IN DATABASE ===");
            try (ResultSet rs = s.executeQuery("SELECT * FROM FnBProducts")) {
                int count = 0;
                while (rs.next()) {
                    count++;
                    System.out.println("Product ID: " + rs.getLong("product_id") + 
                                       ", Name: " + rs.getString("name") + 
                                       ", Category: " + rs.getString("category") + 
                                       ", Price: " + rs.getInt("price") + 
                                       ", Status: " + rs.getString("status"));
                }
                System.out.println("Total F&B products found: " + count);
            }
        }
    }
}
