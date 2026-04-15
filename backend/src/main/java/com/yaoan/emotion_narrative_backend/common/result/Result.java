package com.yaoan.emotion_narrative_backend.common.result;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Result<T> {

    private int code;
    private String message;
    private T data;

    /** 成功（无数据） */
    public static <T> Result<T> success() {
        return new Result<>(0, "success", null);
    }

    /** 成功（有数据） */
    public static <T> Result<T> success(T data) {
        return new Result<>(0, "success", data);
    }

    /** 失败（自定义错误码） */
    public static <T> Result<T> fail(int code, String message) {
        return new Result<>(code, message, null);
    }
}
