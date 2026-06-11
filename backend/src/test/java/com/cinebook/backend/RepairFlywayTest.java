package com.cinebook.backend;
import org.junit.jupiter.api.Test;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
public class RepairFlywayTest {
    @Test
    public void repair() throws Exception {
        String host = System.getenv("DB_HOST") != null ? System.getenv("DB_HOST") : "localhost";
        String port = System.getenv("DB_PORT") != null ? System.getenv("DB_PORT") : "3306";
        String name = System.getenv("DB_NAME") != null ? System.getenv("DB_NAME") : "cinebook";
        String user = System.getenv("DB_USERNAME") != null ? System.getenv("DB_USERNAME") : "root";
        String pwd = System.getenv("DB_PASSWORD") != null ? System.getenv("DB_PASSWORD") : "";
        String url = "jdbc:mysql://" + host + ":" + port + "/" + name + "?useSSL=false&allowPublicKeyRetrieval=true";
        try (Connection c = DriverManager.getConnection(url, user, pwd);
             Statement s = c.createStatement()) {
            s.execute("DELETE FROM flyway_schema_history WHERE version = '2'");
            System.out.println("FLYWAY REPAIRED SUCCESSFULLY");
        }
    }
}
