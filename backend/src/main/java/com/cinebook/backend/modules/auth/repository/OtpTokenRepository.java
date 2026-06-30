package com.cinebook.backend.modules.auth.repository;

import com.cinebook.backend.modules.auth.entity.OtpToken;
import com.cinebook.backend.modules.users.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {
    Optional<OtpToken> findTopByUserAndTokenTypeAndIsUsedFalseOrderByCreatedAtDesc(
            User user, OtpToken.OtpType tokenType);

    @Modifying
    @Query("UPDATE OtpToken o SET o.isUsed = true WHERE o.user = :user AND o.tokenType = :type")
    void invalidateAllForUser(User user, OtpToken.OtpType type);
}
