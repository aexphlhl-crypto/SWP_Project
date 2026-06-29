package com.cinebook.backend.modules.auth.repository;

import com.cinebook.backend.modules.auth.entity.RefreshToken;
import com.cinebook.backend.modules.users.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByTokenHashAndIsRevokedFalse(String tokenHash);

    @Modifying
    @Query("UPDATE RefreshToken r SET r.isRevoked = true WHERE r.user = :user")
    void revokeAllByUser(User user);
}
