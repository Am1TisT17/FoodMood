import { motion } from "motion/react";
import { ShoppingCart, Scan, ChefHat, TrendingUp, ArrowDown } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: ShoppingCart,
    title: "Shop as normal",
    description:
      "Continue your regular grocery shopping. FoodMood works with any store, any receipt format — physical or digital.",
    color: "#B2D2A4",
    bg: "from-[#B2D2A4]/20 to-[#B2D2A4]/5",
  },
  {
    number: "02",
    icon: Scan,
    title: "Scan your receipt",
    description:
      "Take a photo of your receipt. Our AI instantly reads all items, prices, and predicts expiry dates based on food categories.",
    color: "#f59e0b",
    bg: "from-amber-100 to-amber-50",
  },
  {
    number: "03",
    icon: ChefHat,
    title: "Cook smarter",
    description:
      "Get personalized recipe suggestions based on what's about to expire. Turn potential waste into delicious meals every single day.",
    color: "#3b82f6",
    bg: "from-blue-100 to-blue-50",
  },
  {
    number: "04",
    icon: TrendingUp,
    title: "Track your impact",
    description:
      "Watch your savings grow. Monitor CO₂ offset, money saved, and community contributions on your personal impact dashboard.",
    color: "#10b981",
    bg: "from-emerald-100 to-emerald-50",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-32 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-black text-[#1a2332] mb-6 leading-tight">
            Start saving in{" "}
            <span className="text-[#B2D2A4]">minutes</span>
          </h2>
          <p className="text-xl text-[#4A5568]/60 max-w-2xl mx-auto">
            Getting started is effortless. No complicated setup, no learning curve —
            just scan and start saving right away.
          </p>
        </motion.div>

        {/* Desktop: horizontal steps */}
        <div className="hidden lg:grid grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12 }}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute top-10 left-[calc(50%+40px)] right-[-calc(50%-40px)] h-px border-t-2 border-dashed border-gray-200 z-0" />
              )}

              <div className={`relative z-10 bg-gradient-to-br ${step.bg} rounded-3xl p-7 border border-white shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-2`}>
                {/* Step number */}
                <div className="flex items-center justify-between mb-5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: step.color + "20" }}
                  >
                    <step.icon className="w-6 h-6" style={{ color: step.color }} />
                  </div>
                  <span
                    className="text-4xl font-black opacity-15"
                    style={{ color: step.color }}
                  >
                    {step.number}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#1a2332] mb-3">{step.title}</h3>
                <p className="text-sm text-[#4A5568]/70 leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile: vertical steps */}
        <div className="lg:hidden space-y-4 mb-16">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-5"
            >
              {/* Left: icon + line */}
              <div className="flex flex-col items-center">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: step.color + "20" }}
                >
                  <step.icon className="w-6 h-6" style={{ color: step.color }} />
                </div>
                {index < steps.length - 1 && (
                  <div className="w-px h-12 border-l-2 border-dashed border-gray-200 mt-2" />
                )}
              </div>
              {/* Content */}
              <div className="pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="text-xs font-black"
                    style={{ color: step.color }}
                  >
                    Step {step.number}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#1a2332] mb-2">{step.title}</h3>
                <p className="text-sm text-[#4A5568]/70 leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>        
      </div>
    </section>
  );
}
