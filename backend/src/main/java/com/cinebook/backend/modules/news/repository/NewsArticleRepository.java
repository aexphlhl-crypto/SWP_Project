package com.cinebook.backend.modules.news.repository;

import com.cinebook.backend.modules.news.entity.NewsArticle;
import com.cinebook.backend.modules.news.entity.NewsStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NewsArticleRepository extends JpaRepository<NewsArticle, Long> {
    Page<NewsArticle> findByStatus(NewsStatus status, Pageable pageable);
}
