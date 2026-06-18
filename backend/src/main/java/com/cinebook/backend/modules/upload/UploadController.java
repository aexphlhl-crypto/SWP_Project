package com.cinebook.backend.modules.upload;

import com.cinebook.backend.common.response.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    private final String uploadDir = "uploads";

    @PostMapping
    @PreAuthorize("hasAnyRole('SystemAdmin', 'ScheduleManager')")
    public ApiResponse<String> uploadFile(@RequestParam("file") MultipartFile file, HttpServletRequest request) {
        if (file.isEmpty()) {
            return ApiResponse.error("UPLOAD_ERROR", "File is empty");
        }

        try {
            // Create uploads directory if not exists
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFileName = file.getOriginalFilename();
            String extension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                extension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            String uniqueFileName = UUID.randomUUID().toString() + extension;

            // Save file
            Path filePath = uploadPath.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), filePath);

            // Construct full URL (e.g., http://localhost:8080/uploads/uuid.jpg)
            String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();
            String fileUrl = baseUrl + "/uploads/" + uniqueFileName;

            return ApiResponse.ok(fileUrl);
        } catch (IOException e) {
            return ApiResponse.error("UPLOAD_FAILED", "Could not store file: " + e.getMessage());
        }
    }
}
