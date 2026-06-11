package com.cinebook.backend.modules.news.controller;

import com.cinebook.backend.common.response.ApiResponse;
import com.cinebook.backend.modules.news.dto.NewsArticleRequest;
import com.cinebook.backend.modules.news.entity.NewsArticle;
import com.cinebook.backend.modules.news.service.NewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class NewsController {
    private final NewsService service;

    @GetMapping
    public ApiResponse<Page<NewsArticle>> getAll(Pageable pageable) {
        return ApiResponse.ok(service.getAllArticles(pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<NewsArticle> getById(@PathVariable Long id) {
        return ApiResponse.ok(service.getArticleById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SystemAdmin', 'ScheduleManager')")
    public ApiResponse<NewsArticle> create(@RequestBody NewsArticleRequest request,
                                           @RequestParam(required = false) Long createdBy) {
        return ApiResponse.ok(service.createArticle(request, createdBy));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SystemAdmin', 'ScheduleManager')")
    public ApiResponse<NewsArticle> update(@PathVariable Long id, @RequestBody NewsArticleRequest request) {
        return ApiResponse.ok(service.updateArticle(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SystemAdmin')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.deleteArticle(id);
        return ApiResponse.ok(null);
    }
}
