import { Hero } from "@/components/Hero";
import { BenefitsSection } from "@/components/BenefitsSection";
import { FreeServices } from "@/components/FreeServices";
import { OneTimeProducts } from "@/components/OneTimeProducts";
import { SubscriptionPlans } from "@/components/SubscriptionPlans";
import { FAQSection } from "@/components/FAQSection";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";
import { LoadingScreen } from "@/components/LoadingScreen";
import { SEOHead } from "@/components/SEOHead";

const Index = () => {
  return (
    <>
      <SEOHead 
        title="Eclyptica.com - Астрология, Личен Хороскоп и Натални Карти"
        description="Персонализирани натални карти, дневни хороскопи и професионални астрологични анализи. Открийте космическата си истина с нашите експертни услуги."
        url="https://eclyptica.com/"
      />
      <LoadingScreen />
      <main className="min-h-screen">
        <Hero />
        <BenefitsSection />
        <FreeServices />
        <OneTimeProducts />
        <SubscriptionPlans />
        <FAQSection />
        <CTASection />
        <Footer />
      </main>
    </>
  );
};

export default Index;
