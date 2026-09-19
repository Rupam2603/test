export const APP_QUICK_FILTERS = [
  { id: 'all', label: 'All', icon: '' },
  { id: 'skin', label: 'Skin', icon: '' },
  { id: 'pain', label: 'Pain Relief', icon: '' },
  { id: 'weight', label: 'Weight Loss', icon: '' },
  { id: 'immunity', label: 'Immunity', icon: '' },
  { id: 'monsoon', label: 'Monsoon', icon: '' }
]

import monsoonImg from '../assets/images/monsoon_care_1789478915794.jpg';
import immunityImg from '../assets/images/immunity_boosters_1789478930521.jpg';
import painImg from '../assets/images/pain_relief_1789478952145.jpg';
import babyImg from '../assets/images/baby_care_1789479016762.jpg';
import personalImg from '../assets/images/personal_care_1789479031649.jpg';
import devicesImg from '../assets/images/health_devices_1789479047898.jpg';

export const APP_VISUAL_CATEGORIES = [
  {
    id: 'monsoon',
    title: 'Monsoon Care',
    image: monsoonImg
  },
  {
    id: 'immunity',
    title: 'Immunity Boosters',
    image: immunityImg
  },
  {
    id: 'pain',
    title: 'Pain Relief',
    image: painImg
  },
  {
    id: 'baby',
    title: 'Baby Care',
    image: babyImg
  },
  {
    id: 'personal',
    title: 'Personal Care',
    image: personalImg
  },
  {
    id: 'devices',
    title: 'Health Devices',
    image: devicesImg
  }
]

export const APP_DEALS_PRODUCTS = [
  {
    id: 'c48e3a34-f6f0-412b-8493-ce3e07133bfb',
    numericId: 1,
    name: 'Volini Pain Relief Gel 15g',
    pack: '15g Tube',
    tag: 'Pain Relief & ...',
    discount: '25% OFF',
    stockBadge: 'Stock: 117',
    price: 15,
    mrp: 20,
    image: 'https://zdqomjcgmst0grfw.public.blob.vercel-storage.com/products/image_1788243981535.webp',
    category: 'Pain Relief & Muscle Care',
    is_listed: true
  },
  {
    id: '26f7c1c5-7ac6-40ef-b5ab-fb51bc4af999',
    numericId: 2,
    name: 'Amrutanjan Strong Pain Balm 44g',
    pack: '44g Jar',
    tag: 'Pain Relief & ...',
    discount: '20% OFF',
    stockBadge: 'Stock: 82',
    price: 44,
    mrp: 55,
    image: 'https://zdqomjcgmst0grfw.public.blob.vercel-storage.com/products/image_1788266571644.webp',
    category: 'Pain Relief & Muscle Care',
    is_listed: true
  },
  {
    id: '80b9e3b8-e91a-4163-b883-22721f505e47',
    numericId: 3,
    name: 'Dettol Antiseptic Liquid 250ml',
    pack: '250ml Bottle',
    tag: 'Antiseptics',
    discount: '9% OFF',
    stockBadge: 'Stock: 97',
    price: 155,
    mrp: 170,
    image: 'https://zdqomjcgmst0grfw.public.blob.vercel-storage.com/products/image_1788418118653.webp',
    category: 'Monsoon Health & Antiseptics',
    is_listed: true
  },
  {
    id: '65dd5404-a34d-4915-b8e2-bd672cf3054e',
    numericId: 4,
    name: 'Glucon-D Instant Energy Orange',
    pack: '400g Refill',
    tag: 'Energy Drink',
    discount: '11% OFF',
    stockBadge: 'Stock: 95',
    price: 173,
    mrp: 195,
    image: 'https://zdqomjcgmst0grfw.public.blob.vercel-storage.com/products/image_1788275874028.webp',
    category: 'Daily Wellness & Immunity',
    is_listed: true
  },
  {
    id: '0269bb79-78e6-4992-93d1-6439cc0ce729',
    numericId: 5,
    name: 'Eno Lemon Digestive Antacid',
    pack: '5g sachet',
    tag: 'Digestive Care',
    discount: '17% OFF',
    stockBadge: 'Low (14)',
    isLowStock: true,
    price: 10,
    mrp: 12,
    image: 'https://zdqomjcgmst0grfw.public.blob.vercel-storage.com/products/image_1788267142137.webp',
    category: 'Diet & Digestive Health',
    is_listed: true
  },
  {
    id: '7092d4e9-3123-4a17-a837-732439f8ddf5',
    numericId: 6,
    name: 'Dabur Honey 100% Pure 250g',
    pack: '250g Bottle',
    tag: 'Daily Wellness',
    discount: '14% OFF',
    stockBadge: 'Stock: 137',
    price: 125,
    mrp: 145,
    image: 'https://zdqomjcgmst0grfw.public.blob.vercel-storage.com/products/image_1788418284966.webp',
    category: 'Daily Wellness & Immunity',
    is_listed: true
  },
  {
    id: '71a4f009-ffea-47da-995b-21d9600e1e69',
    numericId: 9,
    name: 'surgical mask',
    pack: 'pack of 100pcs',
    tag: 'Medical Supplies',
    discount: '20% OFF',
    stockBadge: 'Stock: 49',
    price: 200,
    mrp: 250,
    image: 'https://zdqomjcgmst0grfw.public.blob.vercel-storage.com/products/image_1788431416528.webp',
    category: 'Medical Supplies & Devices',
    is_listed: true
  },
  {
    id: 'c191a329-8756-42d4-a8ef-d130386d38e2',
    numericId: 7,
    name: 'Bengal Cotton 400 gm',
    pack: '400g Roll',
    tag: 'Hospital Cotton',
    discount: '14% OFF',
    stockBadge: 'Stock: 58',
    price: 241,
    mrp: 280,
    image: 'https://zdqomjcgmst0grfw.public.blob.vercel-storage.com/products/image_1788201776121.webp',
    category: 'Medical Supplies & Devices',
    is_listed: true
  }
]

export const APP_RETAILER_PRODUCTS = [
  {
    id: 'ret-1',
    numericId: 101,
    name: 'Volini Pain Relief Gel (Box of 20)',
    pack: '20 x 15g Tubes',
    tag: 'Wholesale Pain Relief',
    discount: '40% OFF',
    stockBadge: 'In Stock: 50 Boxes',
    price: 240,
    mrp: 400,
    image: 'https://zdqomjcgmst0grfw.public.blob.vercel-storage.com/products/image_1788243981535.webp',
    category: 'Wholesale Medicine',
    is_listed: true
  },
  {
    id: 'ret-2',
    numericId: 102,
    name: 'Amrutanjan Strong Balm (Box of 24)',
    pack: '24 x 44g Jars',
    tag: 'Wholesale Balms',
    discount: '35% OFF',
    stockBadge: 'In Stock: 30 Boxes',
    price: 850,
    mrp: 1320,
    image: 'https://zdqomjcgmst0grfw.public.blob.vercel-storage.com/products/image_1788266571644.webp',
    category: 'Wholesale Medicine',
    is_listed: true
  },
  {
    id: 'ret-3',
    numericId: 103,
    name: 'Dettol Antiseptic Liquid (Carton)',
    pack: '12 x 250ml Bottles',
    tag: 'Wholesale Antiseptics',
    discount: '25% OFF',
    stockBadge: 'In Stock: 25 Cartons',
    price: 1530,
    mrp: 2040,
    image: 'https://zdqomjcgmst0grfw.public.blob.vercel-storage.com/products/image_1788418118653.webp',
    category: 'Wholesale Essentials',
    is_listed: true
  },
  {
    id: 'ret-4',
    numericId: 104,
    name: 'Glucon-D Instant Energy (Carton of 20)',
    pack: '20 x 400g Refills',
    tag: 'Wholesale Energy Drinks',
    discount: '30% OFF',
    stockBadge: 'In Stock: 40 Cartons',
    price: 2730,
    mrp: 3900,
    image: 'https://zdqomjcgmst0grfw.public.blob.vercel-storage.com/products/image_1788275874028.webp',
    category: 'Wholesale Supplements',
    is_listed: true
  },
  {
    id: 'ret-5',
    numericId: 105,
    name: 'Surgical Masks (Carton of 50 Packs)',
    pack: '5000 pcs Total',
    tag: 'Wholesale Medical Supplies',
    discount: '45% OFF',
    stockBadge: 'In Stock: 15 Cartons',
    price: 6875,
    mrp: 12500,
    image: 'https://zdqomjcgmst0grfw.public.blob.vercel-storage.com/products/image_1788431416528.webp',
    category: 'Wholesale Medical Supplies',
    is_listed: true
  }
]
