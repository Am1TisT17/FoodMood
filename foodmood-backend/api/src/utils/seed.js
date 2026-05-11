// Seed the database with the same recipes the frontend currently has hardcoded
// in src/app/context/FoodMoodContext.tsx, so the Recipes page works immediately
// after deploy. Run: `npm run seed`.

import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import Recipe from '../models/Recipe.js';

const SEED_RECIPES = [
  {
    name: 'Creamy Chicken Pasta',
    image:
      'https://images.unsplash.com/photo-1610533514079-58a2c1436725?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    cookingTime: 30,
    servings: 4,
    ingredients: [
      { name: 'Chicken Breast', amount: '300g', normalizedName: 'chicken breast' },
      { name: 'Milk', amount: '200ml', normalizedName: 'milk' },
      { name: 'Pasta', amount: '400g', normalizedName: 'pasta' },
      { name: 'Garlic', amount: '3 cloves', normalizedName: 'garlic' },
    ],
    instructions: [
      'Cook pasta according to package instructions',
      'Season and cook chicken breast until golden',
      'Add milk and garlic, simmer for 5 minutes',
      'Combine with pasta and serve hot',
    ],
    tags: ['dinner', 'comfort'],
  },
  {
    name: 'Fresh Tomato Salad',
    image:
      'https://images.unsplash.com/photo-1610533514079-58a2c1436725?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    cookingTime: 10,
    servings: 2,
    ingredients: [
      { name: 'Tomatoes', amount: '4 pcs', normalizedName: 'tomato' },
      { name: 'Carrots', amount: '200g', normalizedName: 'carrot' },
      { name: 'Olive Oil', amount: '2 tbsp', normalizedName: 'olive oil' },
      { name: 'Lemon', amount: '1 pc', normalizedName: 'lemon' },
    ],
    instructions: [
      'Dice tomatoes and grate carrots',
      'Mix with olive oil and lemon juice',
      'Season with salt and pepper',
      'Serve fresh',
    ],
    tags: ['salad', 'quick', 'vegan'],
  },
  {
    name: 'Yogurt Parfait',
    image:
      'https://images.unsplash.com/photo-1610533514079-58a2c1436725?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    cookingTime: 5,
    servings: 2,
    ingredients: [
      { name: 'Yogurt', amount: '2 pcs', normalizedName: 'yogurt' },
      { name: 'Granola', amount: '100g', normalizedName: 'granola' },
      { name: 'Honey', amount: '2 tbsp', normalizedName: 'honey' },
      { name: 'Berries', amount: '100g', normalizedName: 'berry' },
    ],
    instructions: [
      'Layer yogurt in glasses',
      'Add granola and berries',
      'Drizzle with honey',
      'Serve immediately',
    ],
    tags: ['breakfast', 'quick'],
  },
  {
    name: 'Veggie Stir Fry',
    image:
      'https://images.unsplash.com/photo-1610533514079-58a2c1436725?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    cookingTime: 15,
    servings: 3,
    ingredients: [
      { name: 'Carrots', amount: '300g', normalizedName: 'carrot' },
      { name: 'Broccoli', amount: '200g', normalizedName: 'broccoli' },
      { name: 'Bell Pepper', amount: '1 pc', normalizedName: 'pepper' },
      { name: 'Soy Sauce', amount: '3 tbsp', normalizedName: 'soy sauce' },
    ],
    instructions: [
      'Heat oil in a wok or large pan',
      'Stir-fry vegetables for 5–7 minutes',
      'Add soy sauce and toss to coat',
      'Serve over rice',
    ],
    tags: ['dinner', 'vegan', 'quick'],
  },
];

async function main() {
  await connectDB();
  console.log(`[seed] clearing existing recipes...`);
  await Recipe.deleteMany({});
  await Recipe.insertMany(SEED_RECIPES);
  console.log(`[seed] inserted ${SEED_RECIPES.length} recipes`);
  await disconnectDB();
}

main().catch((e) => {
  console.error(e);
  mongoose.disconnect();
  process.exit(1);
});
