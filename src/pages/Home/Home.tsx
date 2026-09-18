import { ArrowRight, CheckCircle, FlaskConical, Leaf, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Benefits from '../../components/Benefits/Benefits';
import HowToUse from '../../components/HowToUse/HowToUse';
import IngredientsGrid from '../../components/Ingredients/IngredientsGrid';
import ProductCard from '../../components/ProductCard/ProductCard';
import { products } from '../../data/products';

const trustItems = [
  { icon: <Leaf size={20} />, label: '100% Natural' },
  { icon: <ShieldCheck size={20} />, label: 'Chemical Free' },
  { icon: <FlaskConical size={20} />, label: 'Herbal Care' },
  { icon: <Sparkles size={20} />, label: 'For Hair & Scalp' },
];

export default function Home() {
  const featuredProduct = products[0];

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-[#F8F4E8] via-[#EFE7D5] to-[#e6dcc6] overflow-hidden min-h-[88vh] flex items-center">
        {/* Decorative botanical blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-[#2F4A24]/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-[#5B7138]/10 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div>
              <p className="text-[#5B7138] text-sm font-semibold uppercase tracking-widest mb-4">
                Ayesha Herbal Powder
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#253022] leading-tight mb-6 font-serif-heading">
                Nourish Your Roots.{' '}
                <span className="text-[#2F4A24]">Strengthen Your Hair.</span>{' '}
                Naturally.
              </h1>
              <p className="text-lg text-[#6B4A2D] leading-relaxed mb-8 max-w-lg">
                Ayesha Herbal Powder is a carefully selected blend of traditional herbal ingredients
                designed to support healthy-looking hair and scalp care.
              </p>
              <ul className="space-y-2 mb-8">
                {['Supports healthy-looking hair', 'Nourishes the scalp naturally', '100% herbal — no harsh chemicals'].map(
                  (point) => (
                    <li key={point} className="flex items-center gap-2 text-[#253022] text-sm">
                      <CheckCircle size={16} className="text-[#2F4A24] shrink-0" />
                      {point}
                    </li>
                  )
                )}
              </ul>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/shop"
                  className="bg-[#2F4A24] hover:bg-[#253022] text-white font-semibold px-8 py-3 rounded-full transition-colors flex items-center gap-2 shadow-md"
                >
                  Shop Now <ArrowRight size={18} />
                </Link>
                <Link
                  to="/ingredients"
                  className="border-2 border-[#2F4A24] text-[#2F4A24] hover:bg-[#2F4A24] hover:text-white font-semibold px-8 py-3 rounded-full transition-colors"
                >
                  Explore Ingredients
                </Link>
              </div>
            </div>

            {/* Blended Brand Visual */}
            <div className="flex justify-center lg:justify-end relative">
              <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center">

                {/* Outer glow rings */}
                <div className="absolute inset-0 rounded-full bg-[#2F4A24]/10 scale-110" />
                <div className="absolute inset-0 rounded-full bg-[#5B7138]/6 scale-125" />
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#2F4A24]/25 scale-[1.08]" />

                {/* Main circle — product image fills it */}
                <div className="relative z-10 w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden shadow-2xl border-4 border-[#2F4A24]/30">

                  {/* Product photo as background */}
                  <img
                    src="/My-Website/images/ayesha-product-1.jpg"
                    alt="Ayesha Herbal Hair Growth Powder"
                    className="w-full h-full object-cover scale-110"
                  />

                  {/* Gradient overlay — dark at bottom for badge readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a3010]/85 via-[#1a3010]/20 to-transparent" />

                  {/* Top — small decorative dots */}
                  <div className="absolute top-4 left-6 w-2 h-2 rounded-full bg-white/30" />
                  <div className="absolute top-6 right-8 w-1.5 h-1.5 rounded-full bg-white/20" />

                  {/* Centre — AH monogram badge */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-[#F8F4E8] border-2 border-white/60 shadow-xl flex items-center justify-center mb-2">
                      <span className="text-[#2F4A24] text-2xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>AH</span>
                    </div>
                  </div>

                  {/* Bottom — brand name strip */}
                  <div className="absolute bottom-0 left-0 right-0 pb-5 flex flex-col items-center">
                    <p className="text-white font-bold text-base tracking-wide drop-shadow-md" style={{ fontFamily: 'Georgia, serif' }}>
                      Ayesha
                    </p>
                    <p className="text-[#c8d9b4] text-[10px] tracking-[0.2em] uppercase">
                      Herbal Powder
                    </p>
                    <div className="mt-1.5 px-3 py-0.5 bg-white/15 backdrop-blur-sm rounded-full border border-white/20">
                      <p className="text-[#EFE7D5] text-[9px] tracking-widest uppercase">
                        Natural Care · Real Results
                      </p>
                    </div>
                  </div>
                </div>

                {/* Small floating leaf badge - top right */}
                <div className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-[#2F4A24] border-2 border-[#F8F4E8] shadow-lg flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c8d9b4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
                  </svg>
                </div>

                {/* Small floating badge - bottom left */}
                <div className="absolute bottom-4 left-4 z-20 bg-[#F8F4E8] border border-[#2F4A24]/20 rounded-full px-3 py-1 shadow-md">
                  <p className="text-[#2F4A24] text-[9px] font-bold tracking-widest uppercase">100% Natural</p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Bar ─────────────────────────────────────────────────── */}
      <section className="bg-[#2F4A24] text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {trustItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm font-medium">
                <span className="text-[#c8d9b4]">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Product ──────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-[#5B7138] text-sm font-semibold uppercase tracking-widest mb-2">
              Our Product
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#2F4A24] font-serif-heading">
              Featured Product
            </h2>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-sm">
              <ProductCard product={featuredProduct} />
            </div>
          </div>
          <div className="text-center mt-8">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-[#2F4A24] font-semibold hover:underline"
            >
              View All Products <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Ingredients ───────────────────────────────────────────────── */}
      <IngredientsGrid ingredients={featuredProduct.ingredients} />

      {/* ── Benefits ──────────────────────────────────────────────────── */}
      <Benefits benefits={featuredProduct.benefits} />

      {/* ── How To Use ────────────────────────────────────────────────── */}
      <HowToUse steps={featuredProduct.howToUse} />

      {/* ── CTA Banner ────────────────────────────────────────────────── */}
      <section className="py-16 bg-[#253022] text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold font-serif-heading mb-4">
            Start Your Natural Hair Journey Today
          </h2>
          <p className="text-[#c8d9b4] mb-8 text-lg">
            Join customers who trust Ayesha Herbal Powder for natural hair and scalp care.
          </p>
          <Link
            to="/shop"
            className="bg-[#F8F4E8] text-[#2F4A24] hover:bg-white font-bold px-10 py-4 rounded-full text-lg transition-colors shadow-lg inline-block"
          >
            Shop Now
          </Link>
        </div>
      </section>
    </>
  );
}
