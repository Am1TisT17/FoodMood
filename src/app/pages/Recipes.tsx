import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useFoodMood } from '../context/FoodMoodContext';
import { api, RecipeFeedbackAction } from '../../lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Sparkles, ChefHat, Eye, X, Star, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Sidebar } from "../components/Sidebar";
import { BottomNav } from "../components/BottomNav";

export function Recipes() {
  const navigate = useNavigate();
  const { recipes, recommendationsInfo, useRecipe } = useFoodMood();
  const [selectedRecipe, setSelectedRecipe] = useState<(typeof recipes)[0] | null>(null);
  const [cookingRecipe, setCookingRecipe] = useState<string | null>(null);

  const source = recommendationsInfo?.source || 'fallback';
  const meta = recommendationsInfo?.meta;
  const isML = source === 'ml';
  const personalizationApplied = meta?.personalizationApplied ?? false;

  // ───── Feedback helpers ─────
  const sendFeedback = useCallback(async (recipeId: string, action: RecipeFeedbackAction) => {
    try {
      await api.sendRecipeFeedback({
        recipeId,
        action,
        source,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      // Silently fail — feedback is best-effort for ML training
      console.error('[Recipes] feedback failed:', err);
    }
  }, [source]);

  // Track view when modal opens
  useEffect(() => {
    if (selectedRecipe) {
      sendFeedback(selectedRecipe.id, 'view');
    }
  }, [selectedRecipe, sendFeedback]);

  const handleCook = async (recipe: (typeof recipes)[0]) => {
    setCookingRecipe(recipe.id);
    try {
      await useRecipe(recipe.id);
      await sendFeedback(recipe.id, 'cooked');
      toast.success(`You cooked ${recipe.name}! Ingredients consumed.`);
      setSelectedRecipe(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to use recipe');
    } finally {
      setCookingRecipe(null);
    }
  };

  const handleCloseModal = () => {
    if (selectedRecipe) {
      sendFeedback(selectedRecipe.id, 'dismissed');
    }
    setSelectedRecipe(null);
  };

  // Sort by personalRank if ML and ranks are present, otherwise keep backend order
  const displayRecipes = [...recipes].sort((a, b) => {
    if (isML && a.personalRank !== undefined && b.personalRank !== undefined) {
      return b.personalRank - a.personalRank;
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <BottomNav />
      <main className="lg:ml-64 pb-20 lg:pb-6">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-[#2D3748]">
              {isML ? 'Smart Recipe Hub' : 'Recipe Hub'}
            </h1>
            <p className="text-[#718096]">
              {isML && personalizationApplied
                ? 'Recipes matched to your pantry and taste — powered by AI'
                : 'Recipes matched to your pantry to help reduce waste'}
            </p>

            {/* Personalization status banner */}
            {isML && !personalizationApplied && (
              <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-700">
                <TrendingUp className="w-4 h-4" />
                <span>
                  {meta?.personalizationDisabledReason
                    ? meta.personalizationDisabledReason
                    : 'Personalization temporarily unavailable — showing general recommendations'}
                </span>
              </div>
            )}
          </div>

          {/* Recipe Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayRecipes.map((recipe, index) => (
              <div
                key={recipe.id}
                className="group bg-white rounded-xl border border-[#E2E8F0] p-4 cursor-pointer transition-all hover:shadow-md hover:border-[#B2D2A4]"
                onClick={() => setSelectedRecipe(recipe)}
              >
                <div className="relative mb-3">
                  <img
                    src={recipe.image}
                    alt={recipe.name}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                    <Badge className="bg-[#B2D2A4] text-[#2D3748] hover:bg-[#B2D2A4]">
                      {recipe.matchPercentage}% Match
                    </Badge>
                    {/* ML personalization badge */}
                    {isML && personalizationApplied && (
                      <Badge variant="outline" className="bg-white/90 text-emerald-700 border-emerald-200 text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Personalized
                      </Badge>
                    )}
                    {/* Personal rank indicator */}
                    {recipe.personalRank !== undefined && (
                      <Badge variant="outline" className="bg-white/90 text-indigo-600 border-indigo-200 text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        Relevance {recipe.personalRank}%
                      </Badge>
                    )}
                  </div>
                </div>
                {/* ML Insight Banner on Card */}
                {isML && recipe.mlInsight && (
                  <div className="mb-3 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-md text-xs text-indigo-700 font-medium flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-indigo-500" />
                    <span>{recipe.mlInsight}</span>
                  </div>
                )}
                <h3 className="font-semibold text-[#2D3748] mb-1">{recipe.name}</h3>
                <div className="flex items-center gap-3 text-sm text-[#718096]">
                  <span>⏱ {recipe.cookingTime} min</span>
                  <span>🍽 {recipe.servings} servings</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {recipe.ingredients.slice(0, 3).map((ingredient, i) => (
                    <span
                      key={i}
                      className={`text-xs px-2 py-1 rounded-full ${
                        ingredient.inPantry
                          ? 'bg-[#B2D2A4]/20 text-[#2D3748]'
                          : 'bg-[#E2E8F0] text-[#718096]'
                      }`}
                    >
                      {ingredient.inPantry && <span className="mr-1">✓</span>}
                      {ingredient.name}
                    </span>
                  ))}
                  {recipe.ingredients.length > 3 && (
                    <span className="text-xs px-2 py-1 rounded-full bg-[#E2E8F0] text-[#718096]">
                      +{recipe.ingredients.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Recipe Detail Modal */}
          <Dialog open={!!selectedRecipe} onOpenChange={(open) => !open && handleCloseModal()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedRecipe?.name}
                  {isML && personalizationApplied && (
                    <Badge variant="outline" className="text-emerald-700 border-emerald-200">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Personalized Pick
                    </Badge>
                  )}
                </DialogTitle>
              </DialogHeader>
              {selectedRecipe && (
                <>
                  <div className="relative mb-4">
                    <img
                      src={selectedRecipe.image}
                      alt={selectedRecipe.name}
                      className="w-full h-56 object-cover rounded-lg"
                    />
                    <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                      <Badge className="bg-[#B2D2A4] text-[#2D3748]">
                        {selectedRecipe.matchPercentage}% Match
                      </Badge>
                      {selectedRecipe.personalRank !== undefined && (
                        <Badge variant="outline" className="bg-white/90 text-indigo-600 border-indigo-200">
                          <Star className="w-3 h-3 mr-1" />
                          Relevance for you: {selectedRecipe.personalRank}%
                        </Badge>
                      )}
                    </div>
                  </div>

                  {isML && selectedRecipe.mlInsight && (
                    <div className="mb-4 px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-800 font-medium flex items-center gap-2 shadow-sm">
                      <Sparkles className="w-5 h-5 text-indigo-500" />
                      <span><strong>ML Insight:</strong> {selectedRecipe.mlInsight}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-[#718096] mb-4">
                    <span>⏱ {selectedRecipe.cookingTime} minutes</span>
                    <span>🍽 {selectedRecipe.servings} servings</span>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-semibold text-[#2D3748] mb-2">Ingredients</h3>
                    <div className="space-y-2">
                      {selectedRecipe.ingredients.map((ingredient, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#F7FAFC]"
                        >
                          <div className="flex items-center gap-2">
                            {ingredient.inPantry ? (
                              <span className="text-[#B2D2A4]">✓</span>
                            ) : (
                              <span className="text-[#E2E8F0]">○</span>
                            )}
                            <span className={ingredient.inPantry ? '' : 'text-[#718096]'}>
                              {ingredient.name}
                            </span>
                          </div>
                          <span className="text-sm text-[#718096]">{ingredient.amount}</span>
                          {!ingredient.inPantry && (
                            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                              Missing
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-semibold text-[#2D3748] mb-2">Instructions</h3>
                    <ol className="space-y-2">
                      {selectedRecipe.instructions.map((instruction, index) => (
                        <li key={index} className="flex gap-3">
                          <span className="shrink-0 w-6 h-6 rounded-full bg-[#B2D2A4] text-[#2D3748] flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <span className="text-[#4A5568]">{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleCook(selectedRecipe)}
                      disabled={cookingRecipe === selectedRecipe.id}
                      className="flex-1 bg-[#B2D2A4] hover:bg-[#9BC08A] text-[#2D3748]"
                    >
                      <ChefHat className="w-4 h-4 mr-2" />
                      {cookingRecipe === selectedRecipe.id ? 'Cooking...' : 'I Cooked This!'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCloseModal}
                      className="border-[#E2E8F0]"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Close
                    </Button>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}