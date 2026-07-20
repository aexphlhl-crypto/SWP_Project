package com.cinebook.backend.modules.news.service;

import com.cinebook.backend.modules.news.dto.NewsArticleRequest;
import com.cinebook.backend.modules.news.entity.NewsArticle;
import com.cinebook.backend.modules.news.repository.NewsArticleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NewsService {
    private final NewsArticleRepository repository;

    public Page<NewsArticle> getAllArticles(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public NewsArticle getArticleById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Article not found"));
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
