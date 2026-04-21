import { motion } from "motion/react";
import { Star, Quote } from "lucide-react";

const AVATAR_1 = "https://images.unsplash.com/photo-1542677014-15e371939f4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMGRpdmVyc2UlMjB3b21hbiUyMHNtaWxpbmclMjBoZWFsdGh5JTIwZm9vZHxlbnwxfHx8fDE3NzQwMDk2ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080";
const AVATAR_2 = "https://images.unsplash.com/photo-1699389795116-415a26475775?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMG1hbiUyMGNoZWYlMjBjb29raW5nJTIwaGFwcHl8ZW58MXx8fHwxNzc0MDA5NjgzfDA&ixlib=rb-4.1.0&q=80&w=1080";
const AVATAR_3 = "https://images.unsplash.com/photo-1730894750238-3422737a258f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHdvbWFuJTIwbGlmZXN0eWxlJTIwZ3JlZW4lMjBuYXR1cmFsfGVufDF8fHx8MTc3NDAwOTY4M3ww&ixlib=rb-4.1.0&q=80&w=1080";

const testimonials = [
  {
    quote:
      "FoodMood completely changed how I shop and cook. I used to throw away $60-80 of food every month. Now I save nearly all of it. The recipe suggestions are incredibly smart — it feels like having a personal chef who knows exactly what's in your fridge.",
    name: "Sarah Mitchell",
    role: "Home Chef & Sustainability Advocate",
    avatar: AVATAR_1,
    stars: 5,
    savings: "$74 saved last month",
    savingsColor: "text-[#B2D2A4] bg-[#B2D2A4]/10",
  },
  {
    quote:
      "As a chef, I was skeptical about an app telling me what to cook. But FoodMood's recipe engine is genuinely impressive. The ingredient matching is spot-on, and the community marketplace helped me discover local farmers with surplus produce I never knew about.",
    name: "Marcus Chen",
    role: "Professional Chef & Restaurant Owner",
    avatar: AVATAR_2,
    stars: 5,
    savings: "0 waste this week",
    savingsColor: "text-green-600 bg-green-50",
  },
  {
    quote:
      "I joined FoodMood three months ago and I've offset more CO₂ than I expected. The impact dashboard makes sustainability tangible — seeing real numbers of food saved and emissions reduced motivates me every single day. It's genuinely addictive in the best way.",
    name: "Elena Rodriguez",
    role: "Environmental Consultant",
    avatar: AVATAR_3,
    stars: 5,
    savings: "89 kg CO₂ offset",
    savingsColor: "text-blue-600 bg-blue-50",
  },
];

const miniReviews = [
  { name: "James K.", text: "Best food app I've ever used. Period.", stars: 5 },
  { name: "Anna L.", text: "The OCR scanner works perfectly. Saves so much time.", stars: 5 },
  { name: "Tom B.", text: "Saved $400 in my first 3 months. Incredible ROI.", stars: 5 },
  { name: "Wei X.", text: "Community feature is amazing. Got free produce twice!", stars: 5 },
  { name: "Sofia M.", text: "Clean design, smart features. Exactly what I needed.", stars: 5 },
  { name: "David R.", text: "My whole family uses it now. Life changing.", stars: 5 },
];

export function TestimonialsSection() {
  return (
    <section className="py-32 bg-gray-50/60">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="flex items-center justify-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-6 h-6 fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-2 font-black text-[#1a2332] text-xl">4.9 / 5.0</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-[#1a2332] mb-6 leading-tight">
            Loved by{" "}
            <span className="text-[#B2D2A4]">thousands</span>{" "}
            worldwide
          </h2>
          <p className="text-xl text-[#4A5568]/60 max-w-2xl mx-auto">
            Real stories from real people who've transformed their relationship
            with food waste using FoodMood.
          </p>
        </motion.div>

        {/* Main testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-3xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.1)] transition-all duration-300 border border-gray-100 flex flex-col"
            >
              <Quote className="w-8 h-8 text-[#B2D2A4] mb-5 opacity-60" />
              <p className="text-[#4A5568] leading-relaxed flex-1 mb-6 text-sm">"{t.quote}"</p>

              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-md"
                />
                <div className="flex-1">
                  <p className="font-bold text-[#1a2332] text-sm">{t.name}</p>
                  <p className="text-xs text-[#4A5568]/50">{t.role}</p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1.5 rounded-xl ${t.savingsColor}`}>
                  {t.savings}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mini reviews ticker */}
        <div className="overflow-hidden relative">
          <div className="flex gap-4 overflow-hidden">
            {[0, 1].map((set) => (
              <motion.div
                key={set}
                className="flex gap-4 flex-shrink-0"
                animate={{ x: ["0%", "-100%"] }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                {miniReviews.map((r, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm whitespace-nowrap"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#B2D2A4] to-[#7FB069] flex items-center justify-center text-white text-xs font-bold">
                        {r.name[0]}
                      </div>
                      <span className="text-sm font-semibold text-[#1a2332]">{r.name}</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-[#4A5568]/70">{r.text}</p>
                  </div>
                ))}
              </motion.div>
            ))}
          </div>
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-gray-50/60 to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-gray-50/60 to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
