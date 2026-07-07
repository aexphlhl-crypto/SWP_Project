package com.cinebook.backend.modules.movies.controller;

import com.cinebook.backend.common.response.ApiResponse;
import com.cinebook.backend.modules.movies.entity.Actor;
import com.cinebook.backend.modules.movies.service.ActorService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/actors")
@RequiredArgsConstructor
public class ActorController {
    private final ActorService actorService;

    @GetMapping
    public ApiResponse<List<Actor>> getAllActors(@RequestParam(required = false) String search) {
        return ApiResponse.ok(actorService.getAllActors(search));
    }

    @GetMapping("/{id}")
    public ApiResponse<Actor> getActorById(@PathVariable Long id) {
        return ApiResponse.ok(actorService.getActorById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('SystemAdmin')")
    public ApiResponse<Actor> createActor(@RequestBody Actor actor) {
        return ApiResponse.ok(actorService.createActor(actor));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SystemAdmin')")
    public ApiResponse<Actor> updateActor(@PathVariable Long id, @RequestBody Actor actor) {
        return ApiResponse.ok(actorService.updateActor(id, actor));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SystemAdmin')")
    public ApiResponse<Void> deleteActor(@PathVariable Long id) {
        actorService.deleteActor(id);
        return ApiResponse.ok(null);
    }
}
