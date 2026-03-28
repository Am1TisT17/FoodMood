import { useNavigate } from "react-router";
import { Leaf, Twitter, Instagram, Github, Linkedin, Mail, ArrowUpRight } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Digital Pantry", path: "/pantry" },
    { label: "OCR Scanner", path: "/scanner" },
    { label: "Smart Recipes", path: "/recipes" },
    { label: "Community Marketplace", path: "/community" },
    { label: "Analytics", path: "/analytics" },
  ],
  Company: [
    { label: "About Us", path: "#" },
    { label: "Blog", path: "#" },
    { label: "Careers", path: "#" },
    { label: "Press Kit", path: "#" },
    { label: "Partner Program", path: "#" },
  ],
  Support: [
    { label: "Help Center", path: "#" },
    { label: "Community Forum", path: "#" },
    { label: "Contact Us", path: "#" },
    { label: "Status Page", path: "#" },
    { label: "API Documentation", path: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", path: "#" },
    { label: "Terms of Service", path: "#" },
    { label: "Cookie Policy", path: "#" },
    { label: "GDPR", path: "#" },
  ],
};

const socials = [
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Github, label: "GitHub", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
];

export function FooterSection() {
  const navigate = useNavigate();

  return (
    <footer className="bg-[#1a2332] text-white">
      {/* Newsletter section */}
      <div className="border-b border-white/8">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-1">Stay in the loop 🌿</h3>
              <p className="text-white/50 text-sm">
                Weekly tips on reducing food waste and living sustainably.
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-72 px-5 py-3 bg-white/8 border border-white/10 rounded-2xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#B2D2A4]/50 transition-colors"
              />
              <button className="px-6 py-3 bg-[#B2D2A4] hover:bg-[#9BC18A] text-[#1a2332] rounded-2xl font-semibold text-sm transition-all whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-16">
          {/* Brand column */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#B2D2A4] to-[#7FB069] flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">FoodMood</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              The intelligent food waste management platform helping households save money,
              eat better, and protect the planet — one meal at a time.
            </p>
            {/* Social links */}
            <div className="flex gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-xl bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors"
                >
                  <social.icon className="w-4 h-4 text-white/60" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-bold text-sm text-white/90 mb-4 tracking-wide">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => link.path !== "#" ? navigate(link.path) : undefined}
                      className="text-sm text-white/45 hover:text-white transition-colors flex items-center gap-1 group"
                    >
                      {link.label}
                      {link.path === "#" && (
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-8 border-t border-white/8">
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <Mail className="w-4 h-4" />
            <a href="mailto:hello@foodmood.app" className="hover:text-white transition-colors">
              hello@foodmood.app
            </a>
          </div>
          <p className="text-white/30 text-sm">
            © 2026 FoodMood, Inc. · Making food waste a thing of the past. 🌿
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#B2D2A4] animate-pulse" />
            <span className="text-white/40 text-sm">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
