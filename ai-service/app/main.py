import threading
import traceback
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse

from app.consumer import start_consumer
from app.search_service import semantic_search_story_ids
from app.analysis_service import analyze_story, stream_analyze_story
from app.schemas import (
    SemanticSearchRequest,
    SemanticSearchResponse,
    AnalyzeStoryRequest,
    AnalyzeStoryResponse,
)

app = FastAPI()
##创建一个web服务实例

##检查服务活着没
@app.get("/health")
def health_check():
    return {"status": "ok", "message": "AI Service is running"}

@app.post("/semantic-search", response_model=SemanticSearchResponse)
def semantic_search(request: SemanticSearchRequest):
    try:
        story_ids = semantic_search_story_ids(
            query=request.query,
            user_id=request.userId,
            top_k=request.topK,
            max_distance=request.maxDistance
        )
        return SemanticSearchResponse(storyIds=story_ids)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"semantic search failed: {e}")

@app.post("/analyze-story", response_model=AnalyzeStoryResponse)
def analyze_story_api(request: AnalyzeStoryRequest):
    try:
        analysis = analyze_story(request.content)
        return AnalyzeStoryResponse(analysis=analysis)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"analyze story failed: {e}")

@app.post("/analyze-story-stream")
def analyze_story_stream_api(request: AnalyzeStoryRequest):
    try:
        def event_generator():
            try:
                for chunk in stream_analyze_story(request.content):
                    yield f"data: {chunk}\n\n"
                    # 每生成一个分片，就发送一个事件
                    # 标准 SSE 消息格式，Java 在接收 text/event-stream 时，看到的不是普通文本，而是一条条 SSE 事件
                yield "event: done\ndata: [DONE]\n\n"
                # 告诉前端，分析完成
            except Exception as e:
                traceback.print_exc()
                yield f"event: error\ndata: {str(e)}\n\n"

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            }
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"analyze story stream failed: {e}")

# 仅在测试阶段使用该函数
#@app.on_event("startup")##服务启动的时候，顺便把 RabbitMQ 消费器启动起来
#def startup_event():
    ##这里开线程是因为start_consuming() 是阻塞的，一旦开启就会长时间监听，为了不堵死FastAPI 主线程 所以要开后台线程
    ##可以类比之前那个Java的线上通信系统
    #consumer_thread = threading.Thread(target=start_consumer, daemon=True)
    #consumer_thread.start()
    #print("[AI Service] RabbitMQ consumer 已在后台线程启动")