import { useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Zap, Users, Building2, Star } from "lucide-react";
import { useNavigate } from "react-router";

const plans = [
  {
    name: "Free",
    icon: Zap,
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Perfect for individuals starting their sustainability journey.",
    highlight: false,
    badge: null,
    cta: "Start for Free",
    ctaStyle: "bg-gray-100 hover:bg-gray-200 text-[#1a2332]",
    features: [
      "Digital Pantry (up to 50 items)",
      "OCR Scanner (5 scans/month)",
      "Basic recipe suggestions (10/month)",
      "Expiry notifications",
      "Community marketplace browsing",
      "Basic analytics dashboard",
    ],
    notIncluded: [
      "Unlimited scanning",
      "AI recipe engine",
      "Priority community features",
      "Export data",
    ],
  },
  {
    name: "Pro",
    icon: Star,
    monthlyPrice: 7.99,
    yearlyPrice: 5.99,
    description: "For eco-conscious households who want the full FoodMood experience.",
    highlight: true,
    badge: "Most Popular",
    cta: "Start Free Trial",
    ctaStyle: "bg-[#1a2332] hover:bg-[#2d3748] text-white shadow-xl shadow-[#1a2332]/25",
    features: [
      "Everything in Free",
      "Unlimited pantry items",
      "Unlimited OCR scanning",
      "Full AI recipe engine",
      "Priority community features",
      "Detailed impact analytics",
      "Data export (CSV/PDF)",
      "Email & push notifications",
      "Shopping list generation",
    ],
    notIncluded: [],
  },
  {
    name: "Family",
    icon: Users,
    monthlyPrice: 14.99,
    yearlyPrice: 11.99,
    description: "Share FoodMood across your entire household with shared pantry.",
    highlight: false,
    badge: null,
    cta: "Start Free Trial",
    ctaStyle: "bg-[#B2D2A4]/20 hover:bg-[#B2D2A4]/30 text-[#4A5568] border border-[#B2D2A4]/40",
    features: [
      "Everything in Pro",
      "Up to 6 household members",
      "Shared family pantry",
      "Per-member statistics",
      "Family shopping coordination",
      "Priority customer support",
      "Early access to new features",
    ],
    notIncluded: [],
  },
];

export function PricingSection() {
  const navigate = useNavigate();
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#B2D2A4]/15 border border-[#B2D2A4]/30 text-sm font-medium text-[#4A5568] mb-6">
            <Building2 className="w-4 h-4 text-[#B2D2A4]" />
            Simple, transparent pricing
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-[#1a2332] mb-6 leading-tight">
            Plans that fit every{" "}
            <span className="text-[#B2D2A4]">household</span>
          </h2>
          <p className="text-xl text-[#4A5568]/60 max-w-2xl mx-auto mb-10">
            Start free, upgrade when you're ready. No lock-in contracts, cancel anytime.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!yearly ? "text-[#1a2332]" : "text-[#4A5568]/50"}`}>Monthly</span>
            <button
              onClick={() => setYearly(!yearly)}
              className={`w-12 h-6 rounded-full transition-all relative ${yearly ? "bg-[#B2D2A4]" : "bg-gray-200"}`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${yearly ? "right-1" : "left-1"}`}
              />
            </button>
            <span className={`text-sm font-medium ${yearly ? "text-[#1a2332]" : "text-[#4A5568]/50"}`}>
              Yearly
              <span className="ml-2 px-2 py-0.5 rounded-full bg-[#B2D2A4]/20 text-[#4A5568] text-xs font-bold">
                Save 25%
              </span>
            </span>
          </div>
        </motion.div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: plan.highlight ? -4 : -2 }}
              className={`relative rounded-3xl p-8 transition-all duration-300 ${
                plan.highlight
                  ? "bg-[#1a2332] shadow-[0_20px_80px_rgba(26,35,50,0.25)] scale-105"
                  : "bg-white border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-xl"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[#B2D2A4] text-[#1a2332] text-xs font-bold rounded-full shadow-lg">
                  {plan.badge}
                </div>
              )}

              {/* Plan header */}
              <div className="flex items-center gap-3 mb-5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    plan.highlight ? "bg-white/15" : "bg-[#B2D2A4]/15"
                  }`}
                >
                  <plan.icon className={`w-5 h-5 ${plan.highlight ? "text-[#B2D2A4]" : "text-[#B2D2A4]"}`} />
                </div>
                <span className={`font-black text-lg ${plan.highlight ? "text-white" : "text-[#1a2332]"}`}>
                  {plan.name}
                </span>
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-end gap-1.5">
                  <span className={`text-5xl font-black ${plan.highlight ? "text-white" : "text-[#1a2332]"}`}>
                    {plan.monthlyPrice === 0
                      ? "Free"
                      : `$${(yearly ? plan.yearlyPrice : plan.monthlyPrice).toFixed(2)}`}
                  </span>
                  {plan.monthlyPrice > 0 && (
                    <span className={`text-sm mb-2 ${plan.highlight ? "text-white/50" : "text-[#4A5568]/50"}`}>
                      / month
                    </span>
                  )}
                </div>
                {yearly && plan.monthlyPrice > 0 && (
                  <p className={`text-xs mt-1 ${plan.highlight ? "text-white/50" : "text-[#4A5568]/50"}`}>
                    Billed ${(plan.yearlyPrice * 12).toFixed(2)} annually
                  </p>
                )}
              </div>

              <p className={`text-sm leading-relaxed mb-7 ${plan.highlight ? "text-white/60" : "text-[#4A5568]/60"}`}>
                {plan.description}
              </p>

              {/* CTA */}
              <button
                onClick={() => navigate("/login")}
                className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all mb-7 ${plan.ctaStyle}`}
              >
                {plan.cta}
              </button>

              {/* Features */}
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2
                      className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        plan.highlight ? "text-[#B2D2A4]" : "text-[#B2D2A4]"
                      }`}
                    />
                    <span
                      className={`text-sm ${plan.highlight ? "text-white/80" : "text-[#4A5568]"}`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
                {plan.notIncluded.map((feature, i) => (
                  <li key={`not-${i}`} className="flex items-start gap-3 opacity-35">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#4A5568]">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Guarantee */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-[#4A5568]/50">
            🔒 14-day free trial · No credit card required · Cancel anytime · 100% money-back guarantee
          </p>
        </motion.div>
      </div>
    </section>
  );
}
