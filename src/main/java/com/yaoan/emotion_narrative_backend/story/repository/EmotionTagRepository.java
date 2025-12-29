package com.yaoan.emotion_narrative_backend.story.repository;

import com.yaoan.emotion_narrative_backend.story.entity.EmotionTag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmotionTagRepository extends JpaRepository<EmotionTag, Integer > {

    List<EmotionTag> findByIsEnabledOrderBySortOrderAsc(Byte isEnabled);
}
