package com.yaoan.emotion_narrative_backend.common.exception;

import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {

    private final int code;

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.code = errorCode.getCode();
    }

    public BusinessException(int code, String message) {//4000 错误码分段 + 自定义业务错误
        super(message);
        this.code = code;
    }
}
