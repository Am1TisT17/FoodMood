import { Outlet } from "react-router";
import { FoodMoodProvider } from "../context/FoodMoodContext";
import { Toaster } from "../components/ui/sonner";

export function Root() {
  return (
    <FoodMoodProvider>
      <Outlet />
      <Toaster />
    </FoodMoodProvider>
  );
}
