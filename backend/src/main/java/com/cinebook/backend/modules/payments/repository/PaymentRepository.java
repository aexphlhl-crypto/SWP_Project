package com.cinebook.backend.modules.payments.repository;

import com.cinebook.backend.modules.payments.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByGatewayTxnId(String gatewayTxnId);
}
