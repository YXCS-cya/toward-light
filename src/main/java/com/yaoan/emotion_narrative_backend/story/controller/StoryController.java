package com.yaoan.emotion_narrative_backend.story.controller;

import com.yaoan.emotion_narrative_backend.common.result.Result;
import com.yaoan.emotion_narrative_backend.story.dto.StoryCreateRequest;
import com.yaoan.emotion_narrative_backend.story.dto.StoryUpdateRequest;
import com.yaoan.emotion_narrative_backend.story.service.StoryService;
import com.yaoan.emotion_narrative_backend.story.vo.PageResult;
import com.yaoan.emotion_narrative_backend.story.vo.StoryDetailVO;
import com.yaoan.emotion_narrative_backend.story.vo.StoryListItemVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
/** 只做转发 + 返回 Result*/
@RestController
@RequestMapping("/stories")
@RequiredArgsConstructor
public class StoryController {

    private final StoryService storyService;

    @PostMapping
    public Result<Long> create(@Valid @RequestBody StoryCreateRequest req) {
        return Result.success(storyService.create(req));
    }

    @GetMapping
    public Result<PageResult<StoryListItemVO>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return Result.success(storyService.list(page, size));
    }

    @GetMapping("/{id}")
    public Result<StoryDetailVO> detail(@PathVariable Long id) {
        return Result.success(storyService.detail(id));
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody StoryUpdateRequest req) {
        storyService.update(id, req);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        storyService.delete(id);
        return Result.success();
    }
}
