package com.yaoan.emotion_narrative_backend.analytics.service;

import com.yaoan.emotion_narrative_backend.analytics.service.AnalyticsService;
import com.yaoan.emotion_narrative_backend.analytics.vo.EmotionEventStatVO;
import com.yaoan.emotion_narrative_backend.analytics.vo.EmotionStatVO;
import com.yaoan.emotion_narrative_backend.analytics.vo.EventStatVO;
import com.yaoan.emotion_narrative_backend.common.auth.UserContext;
import com.yaoan.emotion_narrative_backend.story.repository.StoryRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final StoryRecordRepository storyRecordRepository;

    @Override
    public List<EmotionStatVO> emotionStatistics() {
        Long userId = UserContext.getUserId();
        return storyRecordRepository.countByEmotion(userId);
    }

    @Override
    public List<EventStatVO> eventStatistics() {
        Long userId = UserContext.getUserId();
        return storyRecordRepository.countByEvent(userId);
    }

    @Override
    public List<EmotionEventStatVO> emotionEventStatistics() {
        Long userId = UserContext.getUserId();
        return storyRecordRepository.countByEmotionEvent(userId);
    }


}
