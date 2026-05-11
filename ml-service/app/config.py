from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "FoodMood ML Service"
    host: str = "0.0.0.0"
    port: int = 4200
    mongo_uri: str = "mongodb://mongo:27017"
    mongo_db: str = "foodmood"
    recipes_collection: str = "recipes"
    # TF-IDF
    tfidf_max_features: int = 5000
    tfidf_ngram_max: int = 2
    # API auth
    internal_api_key: str = "change-me"

    class Config:
        env_file = ".env"

settings = Settings()