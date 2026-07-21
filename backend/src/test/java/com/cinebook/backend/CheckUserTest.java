package com.cinebook.backend;

import org.junit.jupiter.api.Test;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class CheckUserTest {
    @Test
    public void printUsersAndValidatePromo() throws Exception {
        String host = System.getenv("DB_HOST") != null ? System.getenv("DB_HOST") : "localhost";
        String port = System.getenv("DB_PORT") != null ? System.getenv("DB_PORT") : "3306";
        String name = System.getenv("DB_NAME") != null ? System.getenv("DB_NAME") : "cinebook_db";
        String user = System.getenv("DB_USERNAME") != null ? System.getenv("DB_USERNAME") : "root";
        String pwd = System.getenv("DB_PASSWORD") != null ? System.getenv("DB_PASSWORD") : "123456";
        
        String url = "jdbc:mysql://" + host + ":" + port + "/" + name + "?useSSL=false&allowPublicKeyRetrieval=true";
        
        try (Connection c = DriverManager.getConnection(url, user, pwd);
             Statement s = c.createStatement()) {
            
            System.out.println("=== LISTING ALL USERS IN DATABASE ===");
            try (ResultSet rs = s.executeQuery("SELECT user_id, email, full_name, role FROM Users")) {
                while (rs.next()) {
                    long userId = rs.getLong("user_id");
                    String email = rs.getString("email");
                    String fullName = rs.getString("full_name");
                    String role = rs.getString("role");
                    System.out.println("User ID: " + userId + ", Email: " + email + ", Name: " + fullName + ", Role: " + role);
                    
                    // Simulate validatePromo for DUMMYCODE1
                    simulateValidatePromo(c, "DUMMYCODE1", userId, 198000);
                }
            }
        }
    }
    
    private void simulateValidatePromo(Connection c, String code, long userId, int orderValue) throws Exception {
        try (Statement s = c.createStatement()) {
            // Find Promo
            long promoId = 0;
            String status = "";
            java.sql.Timestamp validFrom = null;
            java.sql.Timestamp validUntil = null;
            int minOrderValue = 0;
            int usageLimit = 0;
            int usedCount = 0;
            
            try (ResultSet rs = s.executeQuery("SELECT * FROM PromoCodes WHERE code = '" + code + "'")) {
                if (rs.next()) {
                    promoId = rs.getLong("promo_id");
                    status = rs.getString("status");
                    validFrom = rs.getTimestamp("valid_from");
                    validUntil = rs.getTimestamp("valid_until");
                    minOrderValue = rs.getInt("min_order_value");
                    usageLimit = rs.getInt("usage_limit");
                    usedCount = rs.getInt("used_count");
                } else {
                    System.out.println("  -> Error: Promo code not found.");
                    return;
                }
            }
            
            if (!"Active".equalsIgnoreCase(status)) {
                System.out.println("  -> Error for User ID " + userId + ": Promo code is inactive.");
                return;
            }
            
            java.sql.Timestamp now = new java.sql.Timestamp(System.currentTimeMillis());
            if (now.before(validFrom) || now.after(validUntil)) {
                System.out.println("  -> Error for User ID " + userId + ": Promo code has expired or is not yet valid (Now=" + now + ", From=" + validFrom + ", Until=" + validUntil + ")");
                return;
            }
            
            if (orderValue < minOrderValue) {
                System.out.println("  -> Error for User ID " + userId + ": Order total " + orderValue + " does not meet minimum order value of " + minOrderValue);
                return;
            }
            
            if (usedCount >= usageLimit) {
                System.out.println("  -> Error for User ID " + userId + ": Usage limit reached (" + usedCount + "/" + usageLimit + ")");
                return;
            }
            
            // Check usage count for this user
            int userUsage = 0;
            try (ResultSet rs = s.executeQuery("SELECT COUNT(*) FROM PromoUsages WHERE promo_id = " + promoId + " AND user_id = " + userId)) {
                if (rs.next()) {
                    userUsage = rs.getInt(1);
                }
            }
            
            if (userUsage > 0) {
                System.out.println("  -> Error for User ID " + userId + ": You have already used this promo code (userUsage=" + userUsage + ").");
                return;
            }
            
            System.out.println("  -> Success for User ID " + userId + "! Promo code is VALID.");
        }
    }
}
