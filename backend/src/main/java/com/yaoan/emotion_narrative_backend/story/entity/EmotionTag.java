package com.yaoan.emotion_narrative_backend.story.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "emotion_tag")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmotionTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer  id;

    @Column(nullable = false, length = 32)
    private String code;      // JOY / SAD / ...

    @Column(nullable = false, length = 32)
    private String name;      // 喜悦 / 难过 / ...

    /**
     * polarity: 1 正向, 0 中性, -1 负向
     */
    @Column(nullable = false)
    private Byte polarity;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @Column(name = "is_enabled", nullable = false)
    private Byte isEnabled; // 1 启用, 0 禁用
}
