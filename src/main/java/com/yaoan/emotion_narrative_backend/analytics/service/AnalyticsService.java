package com.yaoan.emotion_narrative_backend.analytics.service;

import com.yaoan.emotion_narrative_backend.analytics.vo.EmotionEventStatVO;
import com.yaoan.emotion_narrative_backend.analytics.vo.EmotionStatVO;
import com.yaoan.emotion_narrative_backend.analytics.vo.EventStatVO;

import java.util.List;

public interface AnalyticsService {

    List<EmotionStatVO> emotionStatistics();
    List<EventStatVO> eventStatistics();
    List<EmotionEventStatVO> emotionEventStatistics();


}
