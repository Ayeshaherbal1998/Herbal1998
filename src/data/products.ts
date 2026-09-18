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
      '/Herbal1998/images/ayesha-product-1.jpg',
      '/Herbal1998/images/ayesha-product-2.jpg',
    ],

    ingredients: [
      {
        id: 'amla',
        name: 'Amla',
        description:
          'Traditionally used in hair-care routines and known for its nourishing properties. A key ingredient in many traditional Indian hair-care formulations.',
        image: '/Herbal1998/images/ingredients/amla.png',
      },
      {
        id: 'hibiscus',
        name: 'Hibiscus',
        description:
          'A popular traditional ingredient used to support healthy-looking hair. Known for its role in traditional hair and scalp-care practices.',
        image: '/Herbal1998/images/ingredients/hibiscus.png',
      },
      {
        id: 'fenugreek',
        name: 'Fenugreek',
        description:
          'Traditionally used in natural hair and scalp-care routines. A well-known herb in traditional hair-care practices across South Asia.',
        image: '/Herbal1998/images/ingredients/fenugreek.png',
      },
      {
        id: 'bhringraj',
        name: 'Bhringraj',
        description:
          'A well-known herb in traditional hair-care practices, often referred to as the "king of herbs" for hair care in Ayurvedic traditions.',
        image: '/Herbal1998/images/ingredients/bhringraj.png',
      },
      {
        id: 'shikakai',
        name: 'Shikakai',
        description:
          'Traditionally used for gentle cleansing and hair care. Supports a clean, refreshed scalp when used as part of a hair-care routine.',
        image: '/Herbal1998/images/ingredients/shikakai.png',
      },
      {
        id: 'neem',
        name: 'Neem',
        description:
          'Commonly used in traditional scalp-care routines. Known for its role in supporting a clean and healthy-looking scalp.',
        image: '/Herbal1998/images/ingredients/neem.png',
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
        title: 'Mix',
        description:
          'Take 2–3 tablespoons of Ayesha Herbal Hair Pack. Add water gradually and mix into a smooth paste.',
      },
      {
        step: 2,
        title: 'Apply',
        description:
          'Apply evenly to the scalp and hair, from roots to lengths. Make sure all sections are well covered.',
      },
      {
        step: 3,
        title: 'Relax',
        description:
          'Leave on for 15–20 minutes. Do not allow the pack to dry completely.',
      },
      {
        step: 4,
        title: 'Rinse',
        description:
          'Rinse thoroughly with water. Shampoo gently if needed.',
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
