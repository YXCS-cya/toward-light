package com.yaoan.emotion_narrative_backend.story.service;

import com.yaoan.emotion_narrative_backend.common.auth.UserContext;
import com.yaoan.emotion_narrative_backend.common.exception.BusinessException;
import com.yaoan.emotion_narrative_backend.common.exception.ErrorCode;
import com.yaoan.emotion_narrative_backend.mq.dto.StoryEventMessage;
import com.yaoan.emotion_narrative_backend.mq.dto.StoryEventType;
import com.yaoan.emotion_narrative_backend.mq.producer.StoryMqProducer;
import com.yaoan.emotion_narrative_backend.story.dto.StoryCreateRequest;
import com.yaoan.emotion_narrative_backend.story.dto.StoryUpdateRequest;
import com.yaoan.emotion_narrative_backend.story.entity.StoryRecord;
import com.yaoan.emotion_narrative_backend.story.repository.StoryRecordRepository;
import com.yaoan.emotion_narrative_backend.story.vo.PageResult;
import com.yaoan.emotion_narrative_backend.story.vo.StoryDetailVO;
import com.yaoan.emotion_narrative_backend.story.vo.StoryListItemVO;
import com.yaoan.emotion_narrative_backend.story.dto.PythonSemanticSearchRequest;
import com.yaoan.emotion_narrative_backend.story.dto.PythonSemanticSearchResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StoryServiceImpl implements StoryService {

    private final StoryRecordRepository repository;
    private final StoryMqProducer storyMqProducer;
    private final RestTemplate restTemplate;

    @Value("${ai.service.base-url}")
    private String aiServiceBaseUrl;

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

        LocalDateTime now = LocalDateTime.now();
        r.setCreatedAt(now);
        r.setUpdatedAt(now);

        StoryRecord saved = repository.save(r);

        StoryEventMessage message = new StoryEventMessage(
                StoryEventType.STORY_CREATED,
                saved.getId(),
                userId,
                LocalDateTime.now()
        );
        storyMqProducer.sendStoryEvent(message);

        return saved.getId();
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
//！！！一定是先确定更新了才能发送消息
        StoryRecord updated = repository.save(r);

        StoryEventMessage message = new StoryEventMessage(
                StoryEventType.STORY_UPDATED,
                updated.getId(),
                userId,
                LocalDateTime.now()
        );
        storyMqProducer.sendStoryEvent(message);
    }

    @Override
    public void delete(Long id) {
        Long userId = UserContext.getUserId();
        StoryRecord r = repository.findByIdAndUserIdAndIsDeleted(id, userId, false)
                .orElseThrow(() -> new BusinessException(ErrorCode.STORY_NOT_FOUND));

        r.setIsDeleted(true);
        r.setDeletedAt(LocalDateTime.now());
        r.setUpdatedAt(LocalDateTime.now());
//！！！一定是先确定删除了才能发送消息，不然删除后短期内语义检索可能还能搜到已删除记录（因为我采用的是软删除）
        StoryRecord deleted = repository.save(r);

        StoryEventMessage message = new StoryEventMessage(
                StoryEventType.STORY_DELETED,
                deleted.getId(),
                userId,
                LocalDateTime.now()
        );
        storyMqProducer.sendStoryEvent(message);
    }

    @Override
    public List<StoryListItemVO> semanticSearch(String query, Integer topK, Double maxDistance) {
        /*
        * 这个方法整合了python的语义检索
        * 1. 调用python的语义检索服务，获取topK个storyId
        * 2. 根据storyId查询数据库，获取storyId对应的story
        * 3. 返回storyId对应的story
        * **/
        Long userId = UserContext.getUserId();

        PythonSemanticSearchRequest requestBody =
                new PythonSemanticSearchRequest(userId, query, topK, maxDistance);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<PythonSemanticSearchRequest> requestEntity =
                new HttpEntity<>(requestBody, headers);

        ResponseEntity<PythonSemanticSearchResponse> response = restTemplate.exchange(
                aiServiceBaseUrl + "/semantic-search",
                HttpMethod.POST,
                requestEntity,
                PythonSemanticSearchResponse.class
        );

        PythonSemanticSearchResponse body = response.getBody();
        if (body == null || body.getStoryIds() == null || body.getStoryIds().isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> storyIds = body.getStoryIds();

        // 二次兜底：只查当前用户、未删除的数据  其实Python那边有一道筛选了，但以防万一吧
        List<StoryRecord> stories = repository.findByIdInAndUserIdAndIsDeleted(storyIds, userId, false);

        // 按 Python 返回的 storyIds 顺序重排
        Map<Long, StoryRecord> storyMap = stories.stream()
                .collect(Collectors.toMap(StoryRecord::getId, story -> story));

        List<StoryListItemVO> result = new ArrayList<>();
        for (Long storyId : storyIds) {
            StoryRecord story = storyMap.get(storyId);
            if (story != null) {
                result.add(new StoryListItemVO(
                        story.getId(),
                        story.getTitle(),
                        story.getEmotionTagId(),
                        story.getEventTypeId(),
                        story.getCreatedAt()
                ));
            }
        }

        return result;
    }
}
