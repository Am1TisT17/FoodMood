import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, auth } from '../../lib/api';

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
  loading: boolean;
  addItem: (item: FoodItem) => Promise<void>;
  updateItem: (id: string, updates: Partial<FoodItem>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  consumeItem: (id: string) => Promise<void>;
  discardItem: (id: string) => Promise<void>;
  shareItem: (id: string) => Promise<void>;
  useRecipe: (recipeId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const FoodMoodContext = createContext<FoodMoodContextType | undefined>(undefined);

const defaultStats: UserStats = {
  foodSavedKg: 0,
  co2Offset: 0,
  moneySaved: 0,
  wasteWarriorLevel: 1,
};

export function FoodMoodProvider({ children }: { children: ReactNode }) {
  const [inventory, setInventory] = useState<FoodItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [communityListings, setCommunityListings] = useState<CommunityListing[]>([]);
  const [userStats, setUserStats] = useState<UserStats>(defaultStats);
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Load everything from the backend after login.
  const refresh = async () => {
    if (!auth.isAuthenticated()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [meRes, invRes, recRes, statsRes, commRes] = await Promise.all([
        api.me(),
        api.listInventory(),
        api.recommendRecipes(12),
        api.stats(),
        api.listCommunity().catch(() => ({ listings: [] })),
      ]);
      setUserName(meRes.user.name);
      setUserStats(statsRes.stats);
      setInventory(invRes.items as FoodItem[]);
      setRecipes(recRes.recipes as Recipe[]);
      setCommunityListings(commRes.listings as CommunityListing[]);
    } catch (err) {
      console.error('[FoodMoodContext] refresh failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // Re-fetch when another tab logs in/out
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'foodmood_token') refresh();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addItem = async (item: FoodItem) => {
    const { item: saved } = await api.addItem({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
      expiryDate: item.expiryDate,
      addedDate: item.addedDate,
      image: item.image,
    } as any);
    setInventory((prev) => [...prev, saved as FoodItem]);
  };

  const updateItem = async (id: string, updates: Partial<FoodItem>) => {
    const { item: saved } = await api.updateItem(id, updates as any);
    setInventory((prev) => prev.map((i) => (i.id === id ? (saved as FoodItem) : i)));
  };

  const removeItem = async (id: string) => {
    await api.removeItem(id);
    setInventory((prev) => prev.filter((i) => i.id !== id));
  };

  const consumeItem = async (id: string) => {
    const { stats } = await api.consumeItem(id);
    setUserStats(stats);
    setInventory((prev) => prev.filter((i) => i.id !== id));
  };

  const discardItem = async (id: string) => {
    await api.discardItem(id);
    setInventory((prev) => prev.filter((i) => i.id !== id));
  };

  const shareItem = async (id: string) => {
    const { stats } = await api.shareItem(id);
    setUserStats(stats);
    setInventory((prev) => prev.filter((i) => i.id !== id));
  };

  const useRecipe = async (recipeId: string) => {
    const { stats } = await api.useRecipe(recipeId);
    setUserStats(stats);
    const { items } = await api.listInventory();
    setInventory(items as FoodItem[]);
  };

  return (
    <FoodMoodContext.Provider
      value={{
        inventory,
        recipes,
        communityListings,
        userStats,
        userName,
        loading,
        addItem,
        updateItem,
        removeItem,
        consumeItem,
        discardItem,
        shareItem,
        useRecipe,
        refresh,
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
