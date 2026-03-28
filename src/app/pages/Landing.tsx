import { LandingNav } from "../components/landing/LandingNav";
import { HeroSection } from "../components/landing/HeroSection";
import { FeaturesSection } from "../components/landing/FeaturesSection";
import { ShowcaseSection } from "../components/landing/ShowcaseSection";
import { HowItWorksSection } from "../components/landing/HowItWorksSection";
import { ImpactSection } from "../components/landing/ImpactSection";
import { FAQSection } from "../components/landing/FAQSection";
import { CTASection } from "../components/landing/CTASection";
import { FooterSection } from "../components/landing/FooterSection";

export function Landing() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <LandingNav />
      <HeroSection />
      <FeaturesSection />
      <ShowcaseSection />
      <HowItWorksSection />
      <CTASection />
      <FooterSection />
    </div>
  );
}
