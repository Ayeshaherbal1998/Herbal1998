import { Star, Quote } from 'lucide-react';

const reviews = [
  {
    id: 1,
    name: 'Muntaaz',
    location: 'Verified Customer',
    rating: 5,
    text: "I am ordering this 2nd time, it's very effective mashallah. My heavy hairfall has completely reduced. Very happy with the results!",
    date: 'Repeat Customer',
    initial: 'M',
    color: 'bg-[#2F4A24]',
  },
  {
    id: 2,
    name: 'Pooja',
    location: 'Verified Customer',
    rating: 5,
    text: "I used your product more than 3 times — it's amazing result before and after use! My relatives are asking me which treatment I'm taking for my hair. My colleagues are also asking for the product!",
    date: '3+ Time Customer',
    initial: 'P',
    color: 'bg-[#6B4A2D]',
  },
  {
    id: 3,
    name: 'Subiya',
    location: 'Verified Customer',
    rating: 5,
    text: "Mashallah! In just 1-2 uses I got very good results. I am really impressed. Highly recommend Ayesha Herbal Powder to everyone!",
    date: 'New Customer',
    initial: 'S',
    color: 'bg-[#5B7138]',
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={16}
          className={i < count ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
        />
      ))}
    </div>
  );
}

export default function Reviews() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[#5B7138] text-sm font-semibold uppercase tracking-widest mb-2">
            What Our Customers Say
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#2F4A24] font-serif-heading mb-3">
            Real Results, Real Reviews
          </h2>
          <p className="text-[#6B4A2D] max-w-xl mx-auto">
            Hundreds of happy customers trust Ayesha Herbal Powder for natural hair care. Here's what they say.
          </p>
        </div>

        {/* Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-[#F8F4E8] rounded-2xl p-6 border border-[#2F4A24]/10 shadow-sm hover:shadow-md transition-shadow relative"
            >
              {/* Quote icon */}
              <div className="absolute top-4 right-5 text-[#2F4A24]/10">
                <Quote size={40} />
              </div>

              {/* Stars */}
              <StarRating count={review.rating} />

              {/* Review text */}
              <p className="text-[#253022] mt-4 mb-6 leading-relaxed text-sm relative z-10">
                "{review.text}"
              </p>

              {/* Reviewer info */}
              <div className="flex items-center gap-3 pt-4 border-t border-[#2F4A24]/10">
                <div
                  className={`w-10 h-10 rounded-full ${review.color} text-white flex items-center justify-center font-bold text-sm shrink-0`}
                >
                  {review.initial}
                </div>
                <div>
                  <p className="font-semibold text-[#253022] text-sm">{review.name}</p>
                  <p className="text-xs text-[#6B4A2D]">{review.location} · {review.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary bar */}
        <div className="mt-10 bg-[#2F4A24] rounded-2xl p-6 text-white text-center">
          <div className="flex flex-wrap justify-center gap-8">
            <div>
              <p className="text-3xl font-bold">4.8</p>
              <div className="flex justify-center mt-1">
                <StarRating count={5} />
              </div>
              <p className="text-[#c8d9b4] text-xs mt-1">Average Rating</p>
            </div>
            <div className="hidden sm:block w-px bg-white/20" />
            <div>
              <p className="text-3xl font-bold">124+</p>
              <p className="text-[#c8d9b4] text-xs mt-1">Happy Customers</p>
            </div>
            <div className="hidden sm:block w-px bg-white/20" />
            <div>
              <p className="text-3xl font-bold">98%</p>
              <p className="text-[#c8d9b4] text-xs mt-1">Would Recommend</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
