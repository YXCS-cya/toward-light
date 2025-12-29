package com.yaoan.emotion_narrative_backend.story.repository;

import com.yaoan.emotion_narrative_backend.story.entity.StoryRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StoryRecordRepository extends JpaRepository<StoryRecord, Long> {

    Page<StoryRecord> findByUserIdAndIsDeletedOrderByCreatedAtDesc(Long userId, Boolean isDeleted, Pageable pageable);

    Optional<StoryRecord> findByIdAndUserIdAndIsDeleted(Long id, Long userId, Boolean isDeleted);
}
