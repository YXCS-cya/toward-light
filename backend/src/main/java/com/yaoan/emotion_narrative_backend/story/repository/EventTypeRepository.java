package com.yaoan.emotion_narrative_backend.story.repository;

import com.yaoan.emotion_narrative_backend.story.entity.EventType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventTypeRepository extends JpaRepository<EventType, Integer > {

    List<EventType> findByIsEnabledOrderBySortOrderAsc(Byte  isEnabled);
}
