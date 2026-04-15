package com.yaoan.emotion_narrative_backend.user.repository;

import com.yaoan.emotion_narrative_backend.user.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByUsernameAndIsDeleted(String username, Boolean isDeleted);
}
