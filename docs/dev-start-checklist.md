🚀 Dev Start Checklist（每天启动用）
1️⃣ 基础服务
 MySQL 已启动
 RabbitMQ 已启动（http://localhost:15672
 可访问）
2️⃣ Java 后端
mvn spring-boot:run

或直接 IDEA 启动

检查：

 接口 /api/... 正常
 控制台无异常
3️⃣ Python AI Consumer（⚠️关键）
python run_consumer.py

检查：

 控制台出现 “waiting for message” 或类似日志
 新建 story 时有消费日志
4️⃣ Python FastAPI
python -m uvicorn app.main:app --reload

检查：

 http://127.0.0.1:8000/docs
 可访问
5️⃣ 前端
npm run dev
✅ 最终验证
 新建一条 story → consumer 有日志
 语义检索能查到新内容