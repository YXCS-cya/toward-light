package com.yaoan.emotion_narrative_backend.story.repository;

import com.yaoan.emotion_narrative_backend.analytics.vo.EmotionEventStatVO;
import com.yaoan.emotion_narrative_backend.analytics.vo.EmotionStatVO;
import com.yaoan.emotion_narrative_backend.analytics.vo.EventStatVO;
import com.yaoan.emotion_narrative_backend.story.entity.StoryRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StoryRecordRepository extends JpaRepository<StoryRecord, Long> {

    Page<StoryRecord> findByUserIdAndIsDeletedOrderByCreatedAtDesc(Long userId, Boolean isDeleted, Pageable pageable);

    Optional<StoryRecord> findByIdAndUserIdAndIsDeleted(Long id, Long userId, Boolean isDeleted);

    @Query("""
    select new com.yaoan.emotion_narrative_backend.analytics.vo.EmotionStatVO(
        e.id,
        e.code,
        e.name,
        count(sr.id)
    )
    from StoryRecord sr
    join EmotionTag e on sr.emotionTagId = e.id
    where sr.userId = :userId
      and sr.isDeleted = false
    group by e.id, e.code, e.name
    order by count(sr.id) desc
""")
    List<EmotionStatVO> countByEmotion(@Param("userId") Long userId);
    //为了统计功能，在此复用数据库层，将统计功能单独封装在 analytics 模块中

    @Query("""
    select new com.yaoan.emotion_narrative_backend.analytics.vo.EventStatVO(
        e.id,
        e.code,
        e.name,
        count(sr.id)
    )
    from StoryRecord sr
    join EventType e on sr.eventTypeId = e.id
    where sr.userId = :userId
      and sr.isDeleted = false
    group by e.id, e.code, e.name
    order by count(sr.id) desc
""")
    List<EventStatVO> countByEvent(@Param("userId") Long userId);
    //为了统计功能，在此复用数据库层，将统计功能单独封装在 analytics 模块中

    @Query("""
    select new com.yaoan.emotion_narrative_backend.analytics.vo.EmotionEventStatVO(
        e.id, e.code, e.name,
        t.id, t.code, t.name,
        count(sr.id)
    )
    from StoryRecord sr
    join EmotionTag e on sr.emotionTagId = e.id
    join EventType t on sr.eventTypeId = t.id
    where sr.userId = :userId
      and sr.isDeleted = false
      and e.isEnabled = 1
      and t.isEnabled = 1
    group by e.id, e.code, e.name, e.sortOrder,
             t.id, t.code, t.name, t.sortOrder
    order by e.sortOrder asc, t.sortOrder asc
""")
    List<EmotionEventStatVO> countByEmotionEvent(@Param("userId") Long userId);

}
