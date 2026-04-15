package com.yaoan.emotion_narrative_backend.common.handler;

import com.yaoan.emotion_narrative_backend.common.exception.BusinessException;
import com.yaoan.emotion_narrative_backend.common.exception.ErrorCode;
import com.yaoan.emotion_narrative_backend.common.result.Result;
import jakarta.validation.ConstraintViolationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /** 业务异常 */
    @ExceptionHandler(BusinessException.class)
    public Result<Void> handleBusinessException(BusinessException ex) {
        return Result.fail(ex.getCode(), ex.getMessage());
    }

    /** 参数校验异常（@Valid） */
    @ExceptionHandler({
            MethodArgumentNotValidException.class,
            ConstraintViolationException.class
    })
    public Result<Void> handleParamException(Exception ex) {
        return Result.fail(
                ErrorCode.PARAM_INVALID.getCode(),
                ErrorCode.PARAM_INVALID.getMessage()
        );
    }

    /** 兜底异常 */
    @ExceptionHandler(Exception.class)
    public Result<Void> handleException(Exception ex) {
        // 课设阶段先不打日志，或只打印 error
        ex.printStackTrace();
        return Result.fail(
                ErrorCode.SYSTEM_ERROR.getCode(),
                ErrorCode.SYSTEM_ERROR.getMessage()
        );
    }
}
