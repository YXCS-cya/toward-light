package com.yaoan.emotion_narrative_backend.guide.service;

import com.yaoan.emotion_narrative_backend.guide.vo.EmotionTagVO;
import com.yaoan.emotion_narrative_backend.guide.vo.EventTypeVO;

import java.util.List;

public interface DictService {

    List<EmotionTagVO> listEmotions();

    List<EventTypeVO> listEvents();
}
