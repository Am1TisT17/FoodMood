import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "Is FoodMood really free to start?",
    answer:
      "Yes, completely free! The Free plan lets you add up to 50 pantry items, scan 5 receipts per month, and get 10 recipe suggestions. No credit card required to sign up. You can upgrade to Pro or Family whenever you're ready.",
  },
  {
    question: "How accurate is the OCR receipt scanner?",
    answer:
      "Our AI achieves 92-95% accuracy on most standard grocery receipts. Each scanned item shows a confidence score, and any item below 85% confidence is highlighted for your review. You can easily edit names, prices, or expiry dates before adding to your pantry.",
  },
  {
    question: "How does FoodMood predict expiry dates?",
    answer:
      "Our AI uses a combination of product category recognition, typical shelf-life data, and storage conditions to estimate expiry dates. For items where the receipt doesn't include a date, we use category averages (e.g., fresh meat: 3-5 days, dairy: 7-14 days). You can always adjust these manually.",
  },
  {
    question: "Is my personal data and shopping data private?",
    answer:
      "Absolutely. Your pantry data, receipts, and personal information are encrypted and never sold to third parties. The community marketplace only shares your general neighborhood (not your exact address). You can export or delete all your data at any time from the Profile settings.",
  },
  {
    question: "How does the Community Marketplace work?",
    answer:
      "When you have surplus food, you can list items directly from your pantry with a pickup window and general location. Other users within your area can request items and arrange pickup via in-app messaging. All community members are verified. You earn eco points for each successful exchange.",
  },
  {
    question: "Can multiple family members use the same account?",
    answer:
      "With the Family plan, up to 6 household members can have their own profiles connected to a shared pantry. Each member sees the same inventory and can add items, cook recipes, or share food. Individual stats are tracked separately so everyone can see their personal contribution.",
  },
  {
    question: "What devices and platforms does FoodMood support?",
    answer:
      "FoodMood is a progressive web app that works on any device with a modern browser — iPhone, Android, tablet, or desktop. There's no app store download required. Simply visit the website and add it to your home screen for a native app-like experience.",
  },
  {
    question: "Can I cancel my subscription at any time?",
    answer:
      "Yes, you can cancel anytime with no fees or penalties. Your paid features will remain active until the end of your current billing period, then your account will switch to the Free tier. Your pantry data is never deleted when you downgrade.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-32 bg-gray-50/60">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-medium text-[#4A5568] mb-6 shadow-sm">
            <HelpCircle className="w-4 h-4 text-[#B2D2A4]" />
            Got questions?
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-[#1a2332] mb-6 leading-tight">
            Frequently asked{" "}
            <span className="text-[#B2D2A4]">questions</span>
          </h2>
          <p className="text-xl text-[#4A5568]/60">
            Everything you need to know about FoodMood. Can't find the answer you're looking for?{" "}
            <a href="mailto:hello@foodmood.app" className="text-[#B2D2A4] hover:underline font-medium">
              Contact us
            </a>
            .
          </p>
        </motion.div>

        {/* FAQ items */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <div
                className={`bg-white rounded-2xl border overflow-hidden transition-all duration-300 ${
                  openIndex === index
                    ? "border-[#B2D2A4]/40 shadow-[0_4px_24px_rgba(178,210,164,0.15)]"
                    : "border-gray-100 shadow-sm hover:border-gray-200"
                }`}
              >
                <button
                  className="w-full flex items-center justify-between px-7 py-5 text-left"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span className="font-semibold text-[#1a2332] pr-4">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                      openIndex === index ? "bg-[#B2D2A4]/20" : "bg-gray-100"
                    }`}
                  >
                    <ChevronDown className={`w-4 h-4 ${openIndex === index ? "text-[#B2D2A4]" : "text-[#4A5568]"}`} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-7 pb-6 text-[#4A5568]/70 leading-relaxed border-t border-gray-50 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
