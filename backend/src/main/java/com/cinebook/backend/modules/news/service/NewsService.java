package com.cinebook.backend.modules.news.service;

import com.cinebook.backend.common.exception.AppException;
import com.cinebook.backend.modules.news.dto.NewsArticleRequest;
import com.cinebook.backend.modules.news.entity.NewsArticle;
import com.cinebook.backend.modules.news.entity.NewsStatus;
import com.cinebook.backend.modules.news.repository.NewsArticleRepository;
import com.cinebook.backend.security.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NewsService {
    private final NewsArticleRepository repository;
    private final SecurityUtil securityUtil;

    public Page<NewsArticle> getAllArticles(Pageable pageable) {
        if (securityUtil.isCurrentUserAdmin()) {
            return repository.findAll(pageable);
        }
        return repository.findByStatus(NewsStatus.Published, pageable);
    }

    public Page<NewsArticle> getAllArticlesAdmin(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public NewsArticle getArticleById(Long id) {
        NewsArticle article = repository.findById(id)
                .orElseThrow(() -> AppException.notFound("Bài viết không tồn tại."));

        if (article.getStatus() != NewsStatus.Published && !securityUtil.isCurrentUserAdmin()) {
            throw AppException.notFound("Bài viết không tồn tại.");
        }
        return article;
    }

    public NewsArticle createArticle(NewsArticleRequest request, Long createdBy) {
        NewsArticle article = NewsArticle.builder()
                .title(request.getTitle())
                .summary(request.getSummary())
                .content(request.getContent())
                .thumbnailUrl(request.getThumbnailUrl())
                .publishDate(request.getPublishDate() != null ? request.getPublishDate() : java.time.LocalDateTime.now())
                .status(request.getStatus())
                .createdBy(createdBy)
                .build();
        return repository.save(article);
    }

    public NewsArticle updateArticle(Long id, NewsArticleRequest request) {
        NewsArticle article = getArticleById(id);
        article.setTitle(request.getTitle());
        article.setSummary(request.getSummary());
        article.setContent(request.getContent());
        article.setThumbnailUrl(request.getThumbnailUrl());
        if (request.getPublishDate() != null) {
            article.setPublishDate(request.getPublishDate());
        }
        article.setStatus(request.getStatus());
        return repository.save(article);
    }

    public void deleteArticle(Long id) {
        repository.deleteById(id);
    }
}
