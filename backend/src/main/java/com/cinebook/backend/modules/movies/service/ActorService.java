package com.cinebook.backend.modules.movies.service;

import com.cinebook.backend.modules.movies.entity.Actor;
import com.cinebook.backend.modules.movies.repository.ActorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ActorService {
    private final ActorRepository actorRepository;

    public List<Actor> getAllActors(String search) {
        if (search != null && !search.trim().isEmpty()) {
            return actorRepository.findByNameContainingIgnoreCase(search.trim());
        }
        return actorRepository.findAll();
    }

    public Actor getActorById(Long id) {
        return actorRepository.findById(id)
                .orElseThrow(() -> com.cinebook.backend.common.exception.AppException.notFound("Không tìm thấy diễn viên có ID: " + id));
    }

    @Transactional
    public Actor createActor(Actor request) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw com.cinebook.backend.common.exception.AppException.badRequest("Tên diễn viên không được để trống.");
        }
        Actor actor = Actor.builder()
                .name(request.getName().trim())
                .avatarUrl(request.getAvatarUrl())
                .build();
        return actorRepository.save(actor);
    }

    @Transactional
    public Actor updateActor(Long id, Actor request) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw com.cinebook.backend.common.exception.AppException.badRequest("Tên diễn viên không được để trống.");
        }
        Actor actor = getActorById(id);
        actor.setName(request.getName().trim());
        actor.setAvatarUrl(request.getAvatarUrl());
        return actorRepository.save(actor);
    }

    @Transactional
    public void deleteActor(Long id) {
        Actor actor = getActorById(id);
        actorRepository.delete(actor);
    }
}
