package com.yaoan.emotion_narrative_backend.guide.service;

import com.yaoan.emotion_narrative_backend.guide.service.DictService;
import com.yaoan.emotion_narrative_backend.guide.vo.EmotionTagVO;
import com.yaoan.emotion_narrative_backend.guide.vo.EventTypeVO;
import com.yaoan.emotion_narrative_backend.story.repository.EmotionTagRepository;
import com.yaoan.emotion_narrative_backend.story.repository.EventTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
/**
 * ENABLED = 1 表示“字典是否可选”
 * 不做异常兜底：
 * 字典为空 ≠ 系统错误
 * 交给前端展示“暂无选项”
 * */
@Service
@RequiredArgsConstructor
public class DictServiceImpl implements DictService {

    private final EmotionTagRepository emotionTagRepository;
    private final EventTypeRepository eventTypeRepository;

    private static final Integer ENABLED = 1;

    @Override
    public List<EmotionTagVO> listEmotions() {
        return emotionTagRepository.findByIsEnabledOrderBySortOrderAsc((byte) 1)
                .stream()
                .map(e -> EmotionTagVO.builder()
                        .id(e.getId())
                        .code(e.getCode())
                        .name(e.getName())
                        .polarity(Integer.valueOf(e.getPolarity()))
                        .build())
                .toList();
    }

    @Override
    public List<EventTypeVO> listEvents() {
        return eventTypeRepository.findByIsEnabledOrderBySortOrderAsc((byte) 1)
                .stream()
                .map(e -> EventTypeVO.builder()
                        .id(e.getId())
                        .code(e.getCode())
                        .name(e.getName())
                        .build())
                .toList();
    }
}
