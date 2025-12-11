import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PORT: int = 8101
    HOST: str = "0.0.0.0"
    
    GITCODE_API_URL: str = "https://api.gitcode.com/api/v5"
    GITCODE_ACCESS_TOKEN: str = ""
    
    GITHUB_API_URL: str = "https://api.github.com"
    GITHUB_ACCESS_TOKEN: str = ""
    
    AI_PROVIDER: str = "openai"
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL_NAME: str = "gpt-4"
    OPENAI_BASE_URL: str = ""
    
    VOLC_API_KEY: str = ""
    VOLC_MODEL: str = ""
    VOLC_BASE_URL: str = "https://ark.cn-beijing.volces.com/api/v3"
    
    SYSTEM_PROMPT: str = """你是一位经验丰富的高级软件工程师，正在进行代码审查（Code Review）。
        请审查以下的 Pull Request (PR) 变更。

        变更元数据:
        标题: {title}
        描述: {description}
        作者: {author}

        Diff 内容:
        {diff_content}

        审查要求:
        1. 识别潜在的 Bug、安全性问题和性能瓶颈。
        2. 提供代码改进建议和最佳实践（Clean Code, SOLID 原则）。
        3. 态度建设性且简洁。
        4. **结果必须使用中文回答。**
        
        输出格式:
        请使用 Markdown 格式输出。
        结构如下:
        - **摘要**: 简要概述变更内容。
        - **关键问题**: 列出发现的关键问题（如果有）。
        - **改进建议**: 列出优化建议。
        - **代码质量评分**: 0-10 分。
        """

    DATABASE_URL: str = "sqlite+aiosqlite:///reviewbot.db"

    class Config:
        env_file = ".env"

settings = Settings()
