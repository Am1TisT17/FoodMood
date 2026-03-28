import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  expiryDate: string;
  addedDate: string;
  image?: string;
}

export interface Recipe {
  id: string;
  name: string;
  matchPercentage: number;
  cookingTime: number;
  servings: number;
  ingredients: { name: string; amount: string; inPantry: boolean }[];
  instructions: string[];
  image: string;
}

export interface CommunityListing {
  id: string;
  itemName: string;
  quantity: string;
  distance: string;
  userName: string;
  image: string;
  lat: number;
  lng: number;
}

interface UserStats {
  foodSavedKg: number;
  co2Offset: number;
  moneySaved: number;
  wasteWarriorLevel: number;
}

interface FoodMoodContextType {
  inventory: FoodItem[];
  recipes: Recipe[];
  communityListings: CommunityListing[];
  userStats: UserStats;
  userName: string;
  addItem: (item: FoodItem) => void;
  updateItem: (id: string, updates: Partial<FoodItem>) => void;
  removeItem: (id: string) => void;
  consumeItem: (id: string) => void;
  discardItem: (id: string) => void;
  shareItem: (id: string) => void;
  useRecipe: (recipeId: string) => void;
}

const FoodMoodContext = createContext<FoodMoodContextType | undefined>(undefined);

const initialInventory: FoodItem[] = [
  {
    id: '1',
    name: 'Milk',
    category: 'Dairy',
    quantity: 1,
    unit: 'L',
    price: 2.99,
    expiryDate: '2026-03-19',
    addedDate: '2026-03-15',
  },
  {
    id: '2',
    name: 'Chicken Breast',
    category: 'Meat',
    quantity: 500,
    unit: 'g',
    price: 8.99,
    expiryDate: '2026-03-18',
    addedDate: '2026-03-14',
  },
  {
    id: '3',
    name: 'Tomatoes',
    category: 'Veggies',
    quantity: 6,
    unit: 'pcs',
    price: 3.49,
    expiryDate: '2026-03-20',
    addedDate: '2026-03-16',
  },
  {
    id: '4',
    name: 'Yogurt',
    category: 'Dairy',
    quantity: 4,
    unit: 'pcs',
    price: 4.99,
    expiryDate: '2026-03-22',
    addedDate: '2026-03-15',
  },
  {
    id: '5',
    name: 'Carrots',
    category: 'Veggies',
    quantity: 1,
    unit: 'kg',
    price: 1.99,
    expiryDate: '2026-03-25',
    addedDate: '2026-03-16',
  },
];

const initialRecipes: Recipe[] = [
  {
    id: '1',
    name: 'Creamy Chicken Pasta',
    matchPercentage: 90,
    cookingTime: 30,
    servings: 4,
    image: 'https://images.unsplash.com/photo-1610533514079-58a2c1436725?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwbWVhbCUyMGNvb2tpbmd8ZW58MXx8fHwxNzczNzExNzE2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ingredients: [
      { name: 'Chicken Breast', amount: '300g', inPantry: true },
      { name: 'Milk', amount: '200ml', inPantry: true },
      { name: 'Pasta', amount: '400g', inPantry: false },
      { name: 'Garlic', amount: '3 cloves', inPantry: false },
    ],
    instructions: [
      'Cook pasta according to package instructions',
      'Season and cook chicken breast until golden',
      'Add milk and garlic, simmer for 5 minutes',
      'Combine with pasta and serve hot',
    ],
  },
  {
    id: '2',
    name: 'Fresh Tomato Salad',
    matchPercentage: 85,
    cookingTime: 10,
    servings: 2,
    image: 'https://images.unsplash.com/photo-1610533514079-58a2c1436725?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwbWVhbCUyMGNvb2tpbmd8ZW58MXx8fHwxNzczNzExNzE2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ingredients: [
      { name: 'Tomatoes', amount: '4 pcs', inPantry: true },
      { name: 'Carrots', amount: '200g', inPantry: true },
      { name: 'Olive Oil', amount: '2 tbsp', inPantry: false },
      { name: 'Lemon', amount: '1 pc', inPantry: false },
    ],
    instructions: [
      'Dice tomatoes and grate carrots',
      'Mix with olive oil and lemon juice',
      'Season with salt and pepper',
      'Serve fresh',
    ],
  },
  {
    id: '3',
    name: 'Yogurt Parfait',
    matchPercentage: 75,
    cookingTime: 5,
    servings: 2,
    image: 'https://images.unsplash.com/photo-1610533514079-58a2c1436725?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwbWVhbCUyMGNvb2tpbmd8ZW58MXx8fHwxNzczNzExNzE2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ingredients: [
      { name: 'Yogurt', amount: '2 pcs', inPantry: true },
      { name: 'Granola', amount: '100g', inPantry: false },
      { name: 'Honey', amount: '2 tbsp', inPantry: false },
      { name: 'Berries', amount: '100g', inPantry: false },
    ],
    instructions: [
      'Layer yogurt in glasses',
      'Add granola and berries',
      'Drizzle with honey',
      'Serve immediately',
    ],
  },
];

const initialCommunityListings: CommunityListing[] = [
  {
    id: '1',
    itemName: 'Fresh Apples',
    quantity: '2 kg',
    distance: '400m away',
    userName: 'Sarah M.',
    image: 'https://images.unsplash.com/photo-1764555241048-f1fc72201704?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBzaGFyaW5nJTIwZm9vZHxlbnwxfHx8fDE3NzM3Njg0MDN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    lat: 40.7128,
    lng: -74.0060,
  },
  {
    id: '2',
    itemName: 'Homemade Bread',
    quantity: '1 loaf',
    distance: '800m away',
    userName: 'John D.',
    image: 'https://images.unsplash.com/photo-1764555241048-f1fc72201704?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBzaGFyaW5nJTIwZm9vZHxlbnwxfHx8fDE3NzM3Njg0MDN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    lat: 40.7158,
    lng: -74.0090,
  },
  {
    id: '3',
    itemName: 'Organic Eggs',
    quantity: '6 pcs',
    distance: '1.2km away',
    userName: 'Emma L.',
    image: 'https://images.unsplash.com/photo-1764555241048-f1fc72201704?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBzaGFyaW5nJTIwZm9vZHxlbnwxfHx8fDE3NzM3Njg0MDN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    lat: 40.7098,
    lng: -74.0120,
  },
];

export function FoodMoodProvider({ children }: { children: ReactNode }) {
  const [inventory, setInventory] = useState<FoodItem[]>(() => {
    const saved = localStorage.getItem('foodmood_inventory');
    return saved ? JSON.parse(saved) : initialInventory;
  });

  const [userStats, setUserStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('foodmood_stats');
    return saved ? JSON.parse(saved) : {
      foodSavedKg: 127.5,
      co2Offset: 89.3,
      moneySaved: 342.80,
      wasteWarriorLevel: 5,
    };
  });

  const recipes = initialRecipes;
  const communityListings = initialCommunityListings;
  const userName = 'Alex';

  useEffect(() => {
    localStorage.setItem('foodmood_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('foodmood_stats', JSON.stringify(userStats));
  }, [userStats]);

  const addItem = (item: FoodItem) => {
    setInventory((prev) => [...prev, item]);
  };

  const updateItem = (id: string, updates: Partial<FoodItem>) => {
    setInventory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeItem = (id: string) => {
    setInventory((prev) => prev.filter((item) => item.id !== id));
  };

  const consumeItem = (id: string) => {
    const item = inventory.find((i) => i.id === id);
    if (item) {
      setUserStats((prev) => ({
        ...prev,
        foodSavedKg: prev.foodSavedKg + 0.5,
        moneySaved: prev.moneySaved + item.price,
      }));
    }
    removeItem(id);
  };

  const discardItem = (id: string) => {
    removeItem(id);
  };

  const shareItem = (id: string) => {
    const item = inventory.find((i) => i.id === id);
    if (item) {
      setUserStats((prev) => ({
        ...prev,
        foodSavedKg: prev.foodSavedKg + 1,
        co2Offset: prev.co2Offset + 0.7,
      }));
    }
    removeItem(id);
  };

  const useRecipe = (recipeId: string) => {
    const recipe = recipes.find((r) => r.id === recipeId);
    if (recipe) {
      recipe.ingredients.forEach((ingredient) => {
        if (ingredient.inPantry) {
          const item = inventory.find((i) => i.name === ingredient.name);
          if (item) {
            consumeItem(item.id);
          }
        }
      });
    }
  };

  return (
    <FoodMoodContext.Provider
      value={{
        inventory,
        recipes,
        communityListings,
        userStats,
        userName,
        addItem,
        updateItem,
        removeItem,
        consumeItem,
        discardItem,
        shareItem,
        useRecipe,
      }}
    >
      {children}
    </FoodMoodContext.Provider>
  );
}

export function useFoodMood() {
  const context = useContext(FoodMoodContext);
  if (!context) {
    throw new Error('useFoodMood must be used within FoodMoodProvider');
  }
  return context;
}
