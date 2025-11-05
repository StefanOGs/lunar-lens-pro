import { Hero } from "@/components/Hero";
import { FreeServices } from "@/components/FreeServices";
import { OneTimeProducts } from "@/components/OneTimeProducts";
import { SubscriptionPlans } from "@/components/SubscriptionPlans";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Hero />
      <FreeServices />
      <OneTimeProducts />
      <SubscriptionPlans />
      <Footer />
    </main>
  );
};

export default Index;
