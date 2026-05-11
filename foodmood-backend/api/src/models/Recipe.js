import mongoose from 'mongoose';

const IngredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    amount: { type: String, required: true },
    // Normalized name used for matching against pantry (lowercase, singularized)
    normalizedName: { type: String, index: true },
  },
  { _id: false }
);

const RecipeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String },
    cookingTime: { type: Number, required: true, min: 0 }, // minutes
    servings: { type: Number, required: true, min: 1 },
    ingredients: { type: [IngredientSchema], required: true },
    instructions: { type: [String], required: true },
    tags: { type: [String], default: [] }, // e.g. ['vegan','quick','dinner']
    source: { type: String, default: 'system' },
  },
  { timestamps: true }
);

RecipeSchema.index({ name: 'text', 'ingredients.name': 'text' });

export default mongoose.model('Recipe', RecipeSchema);
