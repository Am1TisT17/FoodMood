from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


# request contract from Node.js backend (matches mlClient.js)

class PantryItem(BaseModel):
    name: str = Field(..., min_length=1)
    quantity: Optional[float] = Field(None, ge=0)
    unit: Optional[str] = None
    expiryDate: Optional[datetime] = None
    category: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)


class RecommendRequest(BaseModel):
    pantry: List[PantryItem] = Field(..., min_length=1)
    limit: int = Field(12, ge=1, le=50)
    userId: Optional[str] = None


# response contract returned to Node.js backend

class RecipeIngredientOut(BaseModel):
    name: str
    amount: str
    inPantry: bool


class RecipeOut(BaseModel):
    id: str
    name: str
    matchPercentage: int
    cookingTime: Optional[int] = None
    servings: Optional[int] = None
    ingredients: List[RecipeIngredientOut]
    instructions: List[str] = Field(default_factory=list)
    image: Optional[str] = None
    urgentIngredientsUsed: List[str] = Field(default_factory=list)
    score: float


class RecommendResponse(BaseModel):
    recipes: List[RecipeOut]
    modelVersion: str


# rule mining (eLCS)

class InsightRule(BaseModel):
    if_condition: str = Field(..., alias="if")
    then_outcome: str = Field(..., alias="then")
    fitness: float
    accuracy: float
    model_config = {"populate_by_name": True}


class InsightsResponse(BaseModel):
    rules: List[InsightRule]
    samplesSeen: int
    modelVersion: str


class HealthResponse(BaseModel):
    status: str
    vectorizerFitted: bool
    recipesIndexed: int
    elcsFitted: bool
    modelVersion: str
