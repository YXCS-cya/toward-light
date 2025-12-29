package com.yaoan.emotion_narrative_backend.story.service;

import com.yaoan.emotion_narrative_backend.common.auth.UserContext;
import com.yaoan.emotion_narrative_backend.common.exception.BusinessException;
import com.yaoan.emotion_narrative_backend.common.exception.ErrorCode;
import com.yaoan.emotion_narrative_backend.story.dto.StoryCreateRequest;
import com.yaoan.emotion_narrative_backend.story.dto.StoryUpdateRequest;
import com.yaoan.emotion_narrative_backend.story.entity.StoryRecord;
import com.yaoan.emotion_narrative_backend.story.repository.StoryRecordRepository;
import com.yaoan.emotion_narrative_backend.story.vo.PageResult;
import com.yaoan.emotion_narrative_backend.story.vo.StoryDetailVO;
import com.yaoan.emotion_narrative_backend.story.vo.StoryListItemVO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StoryServiceImpl implements StoryService {

    private final StoryRecordRepository repository;

    @Override
    public Long create(StoryCreateRequest req) {
        Long userId = UserContext.getUserId();

        StoryRecord r = new StoryRecord();
        r.setUserId(userId);
        r.setTitle(req.getTitle());
        r.setContent(req.getContent());
        r.setEmotionTagId(req.getEmotionTagId());
        r.setEventTypeId(req.getEventTypeId());
        r.setIsDeleted(false);

        // created_at/updated_at 你表有默认值，但为了实体可读性这里也写一下
        LocalDateTime now = LocalDateTime.now();
        r.setCreatedAt(now);
        r.setUpdatedAt(now);

        return repository.save(r).getId();
    }

    @Override
    public PageResult<StoryListItemVO> list(int page, int size) {
        Long userId = UserContext.getUserId();
        var pageable = PageRequest.of(Math.max(page - 1, 0), Math.min(size, 50));

        var p = repository.findByUserIdAndIsDeletedOrderByCreatedAtDesc(userId, false, pageable);

        var list = p.getContent().stream()
                .map(x -> new StoryListItemVO(
                        x.getId(),
                        x.getTitle(),
                        x.getEmotionTagId(),
                        x.getEventTypeId(),
                        x.getCreatedAt()
                ))
                .collect(Collectors.toList());

        return new PageResult<>(p.getTotalElements(), page, size, list);
    }

    @Override
    public StoryDetailVO detail(Long id) {
        Long userId = UserContext.getUserId();
        StoryRecord r = repository.findByIdAndUserIdAndIsDeleted(id, userId, false)
                .orElseThrow(() -> new BusinessException(ErrorCode.STORY_NOT_FOUND));

        return new StoryDetailVO(
                r.getId(),
                r.getTitle(),
                r.getContent(),
                r.getEmotionTagId(),
                r.getEventTypeId(),
                r.getCreatedAt(),
                r.getUpdatedAt()
        );
    }

    @Override
    public void update(Long id, StoryUpdateRequest req) {
        Long userId = UserContext.getUserId();
        StoryRecord r = repository.findByIdAndUserIdAndIsDeleted(id, userId, false)
                .orElseThrow(() -> new BusinessException(ErrorCode.STORY_NOT_FOUND));

        r.setTitle(req.getTitle());
        r.setContent(req.getContent());
        r.setEmotionTagId(req.getEmotionTagId());
        r.setEventTypeId(req.getEventTypeId());
        r.setUpdatedAt(LocalDateTime.now());

        repository.save(r);
    }

    @Override
    public void delete(Long id) {
        Long userId = UserContext.getUserId();
        StoryRecord r = repository.findByIdAndUserIdAndIsDeleted(id, userId, false)
                .orElseThrow(() -> new BusinessException(ErrorCode.STORY_NOT_FOUND));

        r.setIsDeleted(true);
        r.setDeletedAt(LocalDateTime.now());
        r.setUpdatedAt(LocalDateTime.now());

        repository.save(r);
    }
}
