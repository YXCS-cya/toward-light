package com.yaoan.emotion_narrative_backend.guide.controller;

import com.yaoan.emotion_narrative_backend.common.result.Result;
import com.yaoan.emotion_narrative_backend.guide.service.DictService;
import com.yaoan.emotion_narrative_backend.guide.vo.EmotionTagVO;
import com.yaoan.emotion_narrative_backend.guide.vo.EventTypeVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dict")
@RequiredArgsConstructor
public class DictController {

    private final DictService dictService;

    @GetMapping("/emotions")
    public Result<List<EmotionTagVO>> emotions() {
        return Result.success(dictService.listEmotions());
    }

    @GetMapping("/events")
    public Result<List<EventTypeVO>> events() {
        return Result.success(dictService.listEvents());
    }
}
