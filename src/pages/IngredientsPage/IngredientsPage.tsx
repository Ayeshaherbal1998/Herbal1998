import { products } from '../../data/products';

const ingredientMeta: Record<string, { gradient: string; letter: string }> = {
  amla:      { gradient: 'linear-gradient(145deg, #1c6b2a 0%, #4fa840 60%, #82c45a 100%)', letter: 'A' },
  hibiscus:  { gradient: 'linear-gradient(145deg, #7b1034 0%, #c0284f 60%, #e55a78 100%)', letter: 'H' },
  fenugreek: { gradient: 'linear-gradient(145deg, #7a5510 0%, #c49030 60%, #e8c060 100%)', letter: 'F' },
  bhringraj: { gradient: 'linear-gradient(145deg, #173b20 0%, #2d6b38 60%, #52a05a 100%)', letter: 'B' },
  shikakai:  { gradient: 'linear-gradient(145deg, #4a2c10 0%, #8a5a30 60%, #ba8a58 100%)', letter: 'S' },
  neem:      { gradient: 'linear-gradient(145deg, #1e4f10 0%, #3d8a28 60%, #65bb42 100%)', letter: 'N' },
};

export default function IngredientsPage() {
  const ingredients = products[0]?.ingredients ?? [];

  return (
    <div className="min-h-screen bg-[#F8F4E8]">
      {/* Header */}
      <div className="bg-[#2F4A24] text-white py-16 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-[#c8d9b4] text-sm font-semibold uppercase tracking-widest mb-3">
            What's Inside
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold font-serif-heading mb-4">
            Our Natural Ingredients
          </h1>
          <p className="text-[#c8d9b4] text-lg leading-relaxed">
            Six powerful herbs — each with a rich traditional history in natural hair and scalp
            care. Carefully selected, ethically sourced, and lovingly blended.
          </p>
        </div>
      </div>

      {/* Ingredients Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {ingredients.map((ing, i) => {
            const meta = ingredientMeta[ing.id] ?? { gradient: 'linear-gradient(145deg,#2F4A24,#5B7138)', letter: ing.name.charAt(0).toUpperCase() };
            return (
              <div
                key={ing.id}
                className="bg-white rounded-2xl overflow-hidden shadow-md border border-[#EFE7D5] hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Photo / Gradient area */}
                <div className="relative h-52 overflow-hidden" style={{ background: meta.gradient }}>
                  {/* Real photo — shown if it loads */}
                  <img
                    src={ing.image}
                    alt={ing.name}
                    className="w-full h-full object-cover opacity-90"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />

                  {/* Decorative dots */}
                  <div className="absolute top-4 left-5 w-3 h-3 rounded-full bg-white/20" />
                  <div className="absolute top-7 left-10 w-2 h-2 rounded-full bg-white/15" />
                  <div className="absolute bottom-6 left-6 w-2 h-2 rounded-full bg-white/20" />

                  {/* Letter Badge — top right */}
                  <div className="absolute top-4 right-4 w-14 h-14 rounded-full bg-white/25 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center shadow-lg">
                    <span className="text-white text-2xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>
                      {meta.letter}
                    </span>
                  </div>
                </div>

                {/* Content area */}
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="w-7 h-7 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0 shadow-sm"
                      style={{ background: ingredientMeta[ing.id]?.gradient ?? '#2F4A24' }}
                    >
                      {i + 1}
                    </span>
                    <h3 className="font-bold text-[#253022] text-lg leading-tight">{ing.name}</h3>
                  </div>
                  <p className="text-[#6B4A2D] text-sm leading-relaxed">{ing.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-[#EFE7D5] py-12 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-[#2F4A24] font-serif-heading mb-3">
            100% Natural. Zero Harsh Chemicals.
          </h2>
          <p className="text-[#6B4A2D]">
            Every ingredient in Ayesha Herbal Powder is carefully chosen for its traditional role
            in hair and scalp care. No sulfates, parabens, or synthetic additives.
          </p>
        </div>
      </div>
    </div>
  );
}
