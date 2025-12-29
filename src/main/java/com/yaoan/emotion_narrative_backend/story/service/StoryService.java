package com.yaoan.emotion_narrative_backend.story.service;

import com.yaoan.emotion_narrative_backend.story.dto.StoryCreateRequest;
import com.yaoan.emotion_narrative_backend.story.dto.StoryUpdateRequest;
import com.yaoan.emotion_narrative_backend.story.vo.PageResult;
import com.yaoan.emotion_narrative_backend.story.vo.StoryDetailVO;
import com.yaoan.emotion_narrative_backend.story.vo.StoryListItemVO;

public interface StoryService {
    Long create(StoryCreateRequest req);
    PageResult<StoryListItemVO> list(int page, int size);
    StoryDetailVO detail(Long id);
    void update(Long id, StoryUpdateRequest req);
    void delete(Long id);
}
