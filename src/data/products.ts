// Product data — sourced from Ayesha Herbal Powder brand information.
// To add more products, append new objects to this array following the same schema.
// In the future, replace this with API calls to Supabase / Firebase / Node.js backend.

import type { Product } from '../types';

export const products: Product[] = [
  {
    id: 'ayesha-herbal-hair-growth-powder',
    slug: 'ayesha-herbal-hair-growth-powder',
    name: 'Ayesha Herbal Hair Growth Powder',
    brand: 'Ayesha Herbal Powder',
    shortDescription:
      'A carefully selected blend of traditional herbal ingredients for natural hair and scalp care.',
    description: `Ayesha Herbal Hair Growth Powder is a premium blend of traditional herbal ingredients 
carefully selected for natural hair and scalp care. Each ingredient is sourced for its 
well-known role in traditional hair-care routines.

This powder is designed to support healthy-looking hair, help nourish the scalp, 
and help maintain natural shine and softness — without harsh chemicals.

Made with 100% natural herbal ingredients including Amla, Hibiscus, Fenugreek, 
Bhringraj, Shikakai, and Neem — each playing a traditional role in hair and scalp care.

Use regularly as part of your natural hair-care routine for best results.`,

    price: 199,
    mrp: 249,
    discount: 20,

    images: [
      '/My-Website/images/ayesha-product-1.jpg',
      '/My-Website/images/ayesha-product-2.jpg',
    ],

    ingredients: [
      {
        id: 'amla',
        name: 'Amla Powder',
        description:
          'Traditionally used in hair-care routines and known for its nourishing properties. A key ingredient in many traditional Indian hair-care formulations.',
        image: '/images/ingredients/amla.jpg',
      },
      {
        id: 'hibiscus',
        name: 'Hibiscus Powder',
        description:
          'A popular traditional ingredient used to support healthy-looking hair. Known for its role in traditional hair and scalp-care practices.',
        image: '/images/ingredients/hibiscus.jpg',
      },
      {
        id: 'fenugreek',
        name: 'Fenugreek Powder',
        description:
          'Traditionally used in natural hair and scalp-care routines. A well-known herb in traditional hair-care practices across South Asia.',
        image: '/images/ingredients/fenugreek.jpg',
      },
      {
        id: 'bhringraj',
        name: 'Bhringraj Powder',
        description:
          'A well-known herb in traditional hair-care practices, often referred to as the "king of herbs" for hair care in Ayurvedic traditions.',
        image: '/images/ingredients/bhringraj.jpg',
      },
      {
        id: 'shikakai',
        name: 'Shikakai Powder',
        description:
          'Traditionally used for gentle cleansing and hair care. Supports a clean, refreshed scalp when used as part of a hair-care routine.',
        image: '/images/ingredients/shikakai.jpg',
      },
      {
        id: 'neem',
        name: 'Neem Powder',
        description:
          'Commonly used in traditional scalp-care routines. Known for its role in supporting a clean and healthy-looking scalp.',
        image: '/images/ingredients/neem.jpg',
      },
    ],

    benefits: [
      {
        id: 'healthy-hair',
        title: 'Promotes Healthy-Looking Hair',
        description:
          'Supports a nourished scalp and healthy-looking hair with natural herbal ingredients.',
        icon: 'Sprout',
      },
      {
        id: 'reduce-breakage',
        title: 'Helps Reduce Hair Breakage',
        description:
          'Supports stronger-looking hair and helps maintain healthy hair through traditional herbal care.',
        icon: 'Shield',
      },
      {
        id: 'shine-softness',
        title: 'Natural Shine & Softness',
        description:
          'Helps maintain smooth, soft, and naturally shiny-looking hair with plant-based ingredients.',
        icon: 'Sparkles',
      },
      {
        id: 'clean-scalp',
        title: 'Cleans Scalp',
        description:
          'Supports a clean and refreshed scalp as part of your regular hair-care routine.',
        icon: 'Droplets',
      },
      {
        id: 'natural-ingredients',
        title: '100% Natural Ingredients',
        description:
          'Made with carefully selected herbal ingredients. Free from harsh chemicals and synthetic additives.',
        icon: 'Leaf',
      },
    ],

    howToUse: [
      {
        step: 1,
        title: 'Take the Powder',
        description:
          'Take the recommended quantity of Ayesha Herbal Powder. (Quantity as directed on the packaging or by your practitioner.)',
      },
      {
        step: 2,
        title: 'Mix Well',
        description:
          'Mix with water or another approved ingredient according to product instructions to form a smooth paste.',
      },
      {
        step: 3,
        title: 'Apply Evenly',
        description:
          'Apply the prepared mixture evenly to the scalp and hair, ensuring thorough coverage from root to tip.',
      },
      {
        step: 4,
        title: 'Leave for Recommended Time',
        description:
          'Leave for the recommended duration as specified on the packaging. Do not exceed the suggested time.',
      },
      {
        step: 5,
        title: 'Rinse Thoroughly',
        description:
          'Rinse thoroughly with water until completely clean. Follow with your usual hair-care routine if desired.',
      },
    ],

    category: 'Hair Growth',
    stock: 50,
    rating: 4.8,
    reviewCount: 124,

    variants: [
      {
        id: '100g',
        label: '1 Box — 100g',
        price: 199,
        mrp: 249,
        stock: 50,
      },
      {
        id: '2box',
        label: '2 Boxes — 200g (Save ₹49)',
        price: 349,
        mrp: 498,
        stock: 30,
      },
    ],

    tags: ['hair growth', 'herbal', 'natural', 'amla', 'hibiscus', 'neem', 'bhringraj', 'shikakai', 'fenugreek'],
  },
];

export const getProductBySlug = (slug: string): Product | undefined =>
  products.find((p) => p.slug === slug);

export const searchProducts = (query: string): Product[] => {
  const q = query.toLowerCase().trim();
  if (!q) return products;
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.shortDescription.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.tags.some((t) => t.includes(q)) ||
      p.ingredients.some(
        (i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
      )
  );
};
