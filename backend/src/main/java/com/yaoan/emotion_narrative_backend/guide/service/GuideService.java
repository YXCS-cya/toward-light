package com.yaoan.emotion_narrative_backend.guide.service;

import com.yaoan.emotion_narrative_backend.guide.vo.GuideResponseVO;

public interface GuideService {

    /**
     * 获取写作引导问题列表
     *
     * @param emotionCode 情绪 code（可为空，表示未选择/跳过）
     * @param eventCode   事件 code（可为空，表示未选择/跳过）
     * @return 引导响应（规则模式）
     */
    GuideResponseVO getQuestions(String emotionCode, String eventCode);
}
