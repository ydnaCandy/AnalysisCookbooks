from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, domains, tags, recipes

app = FastAPI(title="Analysis Cookbooks API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["認証"])
app.include_router(domains.router, prefix="/api/domains", tags=["ドメイン"])
app.include_router(tags.router, prefix="/api/tags", tags=["タグ"])
app.include_router(recipes.router, prefix="/api/recipes", tags=["レシピ"])
