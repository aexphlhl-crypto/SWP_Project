package com.cinebook.backend.modules.rooms.repository;

import com.cinebook.backend.modules.rooms.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    org.springframework.data.domain.Page<Room> findByCinemaCinemaId(Long cinemaId, org.springframework.data.domain.Pageable pageable);
}
