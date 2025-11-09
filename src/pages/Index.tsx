import { Hero } from "@/components/Hero";
import { FreeServices } from "@/components/FreeServices";
import { OneTimeProducts } from "@/components/OneTimeProducts";
import { SubscriptionPlans } from "@/components/SubscriptionPlans";
import { Footer } from "@/components/Footer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LoadingScreen } from "@/components/LoadingScreen";

const Index = () => {
  return (
    <>
      <LoadingScreen />
      <ThemeToggle />
      <main className="min-h-screen">
        <Hero />
        <FreeServices />
        <OneTimeProducts />
        <SubscriptionPlans />
        <Footer />
      </main>
    </>
  );
};

export default Index;
