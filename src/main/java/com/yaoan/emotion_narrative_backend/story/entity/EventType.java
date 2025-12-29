package com.yaoan.emotion_narrative_backend.story.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "event_type")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer  id;

    @Column(nullable = false, length = 32)
    private String code;  // STUDY / WORK / ...

    @Column(nullable = false, length = 32)
    private String name;  // 学业 / 工作 / ...

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @Column(name = "is_enabled", nullable = false)
    private Byte isEnabled; // 1 启用, 0 禁用
}
