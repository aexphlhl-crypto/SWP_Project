package com.cinebook.backend.modules.promos.repository;

import com.cinebook.backend.modules.promos.entity.PromoCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PromoCodeRepository extends JpaRepository<PromoCode, Long> {
    Optional<PromoCode> findByCode(String code);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT p FROM PromoCode p WHERE p.code = :code")
    Optional<PromoCode> findByCodeForUpdate(@org.springframework.data.repository.query.Param("code") String code);

    java.util.List<PromoCode> findByStatusAndValidUntilBefore(com.cinebook.backend.modules.promos.entity.PromoStatus status, java.time.LocalDateTime dateTime);
}
