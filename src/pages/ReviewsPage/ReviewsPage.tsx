import { Star, Quote, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { businessConfig } from '../../config/business';

const reviews = [
  {
    id: 1,
    name: 'Muntaaz',
    tag: 'Repeat Customer',
    rating: 5,
    text: "Assalam alaikum ayesha! I am ordering this 2nd time it's very effective mashallah. My heavy hairfall has completely reduced. Alhamdulillah, very happy with the results!",
    badge: 'M',
    color: '#2F4A24',
    product: '1 Box — 100g',
  },
  {
    id: 2,
    name: 'Pooja',
    tag: '3+ Time Customer',
    rating: 5,
    text: "Hi ayesha, I used your product more than 3 times — it's amazing result before and after use! My relatives are asking me which treatment I'm taking for my hair. My colleagues are also asking for the product. Love it!",
    badge: 'P',
    color: '#6B4A2D',
    product: '2 Boxes — 200g',
  },
  {
    id: 3,
    name: 'Subiya',
    tag: 'New Customer',
    rating: 5,
    text: "Hii ayesha mashallah! In just 1-2 uses I got very good results. I am really impressed with the product. Highly recommend Ayesha Herbal Powder to everyone!",
    badge: 'S',
    color: '#5B7138',
    product: '1 Box — 100g',
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={18} className={i < count ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const waUrl = `https://wa.me/${businessConfig.whatsappNumber}?text=${encodeURIComponent('Hello Ayesha! 🌿 I want to share my review / order your product.')}`;

  return (
    <div className="min-h-screen bg-[#F8F4E8]">
      {/* Header */}
      <div className="bg-[#2F4A24] text-white py-16 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-[#c8d9b4] text-sm font-semibold uppercase tracking-widest mb-3">
            Customer Testimonials
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold font-serif-heading mb-4">
            Real Results, Real Reviews
          </h1>
          <p className="text-[#c8d9b4] text-lg leading-relaxed">
            Hundreds of happy customers trust Ayesha Herbal Powder for natural hair care.
            Here's what they say — in their own words.
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-[#253022] text-white py-8">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap justify-center gap-10">
          <div className="text-center">
            <p className="text-4xl font-bold text-amber-400">4.8</p>
            <div className="flex justify-center mt-1"><Stars count={5} /></div>
            <p className="text-[#c8d9b4] text-xs mt-1">Average Rating</p>
          </div>
          <div className="hidden sm:block w-px bg-white/20" />
          <div className="text-center">
            <p className="text-4xl font-bold">124+</p>
            <p className="text-[#c8d9b4] text-xs mt-1">Happy Customers</p>
          </div>
          <div className="hidden sm:block w-px bg-white/20" />
          <div className="text-center">
            <p className="text-4xl font-bold">98%</p>
            <p className="text-[#c8d9b4] text-xs mt-1">Would Recommend</p>
          </div>
        </div>
      </div>

      {/* Review Cards */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl p-6 border border-[#EFE7D5] shadow-md hover:shadow-lg transition-shadow relative"
            >
              <div className="absolute top-4 right-5 text-[#2F4A24]/8">
                <Quote size={48} />
              </div>

              <Stars count={r.rating} />

              <p className="text-[#253022] mt-4 mb-5 leading-relaxed text-sm relative z-10">
                "{r.text}"
              </p>

              <div className="pt-4 border-t border-[#EFE7D5]">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-11 h-11 rounded-full text-white flex items-center justify-center font-bold text-base shrink-0 shadow-sm"
                    style={{ backgroundColor: r.color }}
                  >
                    {r.badge}
                  </div>
                  <div>
                    <p className="font-semibold text-[#253022] text-sm">{r.name}</p>
                    <p className="text-xs text-[#6B4A2D]">Verified Customer · {r.tag}</p>
                  </div>
                </div>
                <p className="text-xs text-[#5B7138] font-medium pl-14">Ordered: {r.product}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center bg-[#2F4A24] rounded-2xl p-10 text-white">
          <h2 className="text-2xl sm:text-3xl font-bold font-serif-heading mb-3">
            Ready to Start Your Hair Journey?
          </h2>
          <p className="text-[#c8d9b4] mb-6 max-w-lg mx-auto">
            Join hundreds of happy customers. Order today and see the difference of 100% natural herbal care.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/shop"
              className="bg-[#F8F4E8] text-[#2F4A24] hover:bg-white font-bold px-8 py-3 rounded-full transition-colors shadow-lg"
            >
              Shop Now
            </Link>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-bold px-8 py-3 rounded-full transition-colors shadow-lg"
            >
              <MessageCircle size={18} />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
