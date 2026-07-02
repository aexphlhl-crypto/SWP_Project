package com.cinebook.backend.modules.users;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.cinebook.backend.common.enums.UserRole;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailAndDeletedAtIsNull(String email);
    boolean existsByEmailAndDeletedAtIsNull(String email);
    Optional<User> findByGoogleUidAndDeletedAtIsNull(String googleUid);
    Long countByCreatedAtBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);
    Page<User> findByRoleAndDeletedAtIsNull(UserRole role, Pageable pageable);
}
