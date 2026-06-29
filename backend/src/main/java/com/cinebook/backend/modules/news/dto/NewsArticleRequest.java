package com.cinebook.backend.modules.news.dto;

import com.cinebook.backend.modules.news.entity.NewsStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NewsArticleRequest {
    private String title;
    private String summary;
    private String content;
    private String thumbnailUrl;
    private LocalDateTime publishDate;
    private NewsStatus status;
}
