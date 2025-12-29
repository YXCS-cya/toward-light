package com.yaoan.emotion_narrative_backend.common.exception;

import lombok.Getter;

@Getter
public enum ErrorCode {
    // 错误码进行分段
    //不允许 Controller 自造错误码
    // ===== 通用错误 =====
    SYSTEM_ERROR(1000, "系统异常"),
    PARAM_INVALID(1001, "参数不合法"),

    // ===== 认证与用户 =====
    USER_NOT_FOUND(2001, "用户不存在"),
    INVALID_CREDENTIALS(2002, "用户名或密码错误"),
    UNAUTHORIZED(2003, "未登录或登录已失效"),

    // ===== 业务相关 =====
    STORY_NOT_FOUND(3001, "记录不存在"),
    FORBIDDEN_OPERATION(3002, "无权限操作");

    private final int code;
    private final String message;//用户可读的默认文案

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }
}
