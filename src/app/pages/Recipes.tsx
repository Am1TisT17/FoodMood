import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { BottomNav } from "../components/BottomNav";
import { useFoodMood } from "../context/FoodMoodContext";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Clock, Users, CheckCircle2, Plus, ChefHat } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

export function Recipes() {
  const { recipes, useRecipe } = useFoodMood();
  const [selectedRecipe, setSelectedRecipe] = useState<typeof recipes[0] | null>(null);

  const handleFinishCooking = () => {
    if (selectedRecipe) {
      useRecipe(selectedRecipe.id);
      toast.success(`${selectedRecipe.name} ingredients removed from pantry!`);
      setSelectedRecipe(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <BottomNav />
      
      <main className="lg:ml-64 pb-20 lg:pb-6">
        <div className="max-w-7xl mx-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-[#4A5568] mb-2">Smart Recipe Hub</h1>
            <p className="text-[#4A5568]/60 mb-6">
              Recipes matched to your pantry to help reduce waste
            </p>
          </motion.div>

          {/* Recipe Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <Card 
                  className="overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300"
                  onClick={() => setSelectedRecipe(recipe)}
                >
                  <div className="relative">
                    <img 
                      src={recipe.image} 
                      alt={recipe.name}
                      className="w-full h-56 object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-[#B2D2A4] text-white text-lg px-3 py-1">
                        {recipe.matchPercentage}% Match
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-[#4A5568] mb-3">
                      {recipe.name}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-sm text-[#4A5568]/60 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{recipe.cookingTime} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{recipe.servings} servings</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {recipe.ingredients.slice(0, 3).map((ingredient, i) => (
                        <Badge 
                          key={i}
                          variant="outline"
                          className={ingredient.inPantry ? "border-[#B2D2A4] text-[#B2D2A4]" : ""}
                        >
                          {ingredient.inPantry && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {ingredient.name}
                        </Badge>
                      ))}
                      {recipe.ingredients.length > 3 && (
                        <Badge variant="outline">
                          +{recipe.ingredients.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <Button 
                      className="w-full bg-[#B2D2A4] hover:bg-[#9BC18A] text-[#4A5568]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRecipe(recipe);
                      }}
                    >
                      <ChefHat className="w-4 h-4 mr-2" />
                      View Recipe
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Recipe Detail Modal */}
      <Dialog open={selectedRecipe !== null} onOpenChange={() => setSelectedRecipe(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedRecipe && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedRecipe.name}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <img 
                  src={selectedRecipe.image} 
                  alt={selectedRecipe.name}
                  className="w-full h-64 object-cover rounded-xl"
                />

                <div className="flex items-center gap-6">
                  <Badge className="bg-[#B2D2A4] text-white text-lg px-4 py-2">
                    {selectedRecipe.matchPercentage}% Match
                  </Badge>
                  <div className="flex items-center gap-2 text-[#4A5568]/60">
                    <Clock className="w-5 h-5" />
                    <span>{selectedRecipe.cookingTime} minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#4A5568]/60">
                    <Users className="w-5 h-5" />
                    <span>{selectedRecipe.servings} servings</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#4A5568] mb-4">Ingredients</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedRecipe.ingredients.map((ingredient, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          {ingredient.inPantry ? (
                            <CheckCircle2 className="w-5 h-5 text-[#B2D2A4]" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                          )}
                          <div>
                            <p className="font-medium text-[#4A5568]">{ingredient.name}</p>
                            <p className="text-sm text-[#4A5568]/60">{ingredient.amount}</p>
                          </div>
                        </div>
                        {!ingredient.inPantry && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="text-[#B2D2A4]"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#4A5568] mb-4">Instructions</h3>
                  <ol className="space-y-3">
                    {selectedRecipe.instructions.map((instruction, index) => (
                      <li key={index} className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-[#B2D2A4] text-white flex items-center justify-center flex-shrink-0 font-semibold">
                          {index + 1}
                        </div>
                        <p className="text-[#4A5568] pt-1">{instruction}</p>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleFinishCooking}
                    className="flex-1 bg-[#B2D2A4] hover:bg-[#9BC18A] text-[#4A5568]"
                    size="lg"
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Finish Cooking
                  </Button>
                  <Button
                    onClick={() => setSelectedRecipe(null)}
                    variant="outline"
                    size="lg"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
