/**
 * Verified Listed Products Data for Category-Wise Home Page
 * ONLY contains products that are actively listed (`is_listed = true`) in the database.
 * Unlisted products have been completely removed.
 */

// Visual Category Cards corresponding to active listed categories
import monsoonImg from '../assets/images/monsoon_care_1789478915794.jpg';
import immunityImg from '../assets/images/immunity_boosters_1789478930521.jpg';
import painImg from '../assets/images/pain_relief_1789478952145.jpg';
import babyImg from '../assets/images/baby_care_1789479016762.jpg';
import personalImg from '../assets/images/personal_care_1789479031649.jpg';
import devicesImg from '../assets/images/health_devices_1789479047898.jpg';

export const HOME_CATEGORY_CARDS = [
  {
    id: 'monsoon',
    categoryName: 'Monsoon Health & Antiseptics',
    title: 'Monsoon Care',
    image: monsoonImg,
    textColor: '#1e3a8a'
  },
  {
    id: 'immunity',
    categoryName: 'Daily Wellness & Immunity',
    title: 'Immunity Boosters',
    image: immunityImg,
    textColor: '#1e3a8a'
  },
  {
    id: 'pain',
    categoryName: 'Pain Relief & Muscle Care',
    title: 'Pain Relief',
    image: painImg,
    textColor: '#1e3a8a'
  },
  {
    id: 'baby',
    categoryName: 'Baby Care',
    title: 'Baby Care',
    image: babyImg,
    textColor: '#1e3a8a'
  },
  {
    id: 'personal',
    categoryName: 'Personal Care',
    title: 'Personal Care',
    image: personalImg,
    textColor: '#1e3a8a'
  },
  {
    id: 'devices',
    categoryName: 'Medical Supplies & Devices',
    title: 'Health Devices',
    image: devicesImg,
    textColor: '#1e3a8a'
  }
];

// 1. Pain Relief & Muscle Care Shelf (Actual Listed Products)
export const PAIN_RELIEF_PRODUCTS = [
  {
    id: 'c48e3a34-f6f0-412b-8493-ce3e07133bfb',
    numericId: 1,
    name: 'Volini Pain Relief Gel 15g',
    brand: 'Volini',
    pack: '15g Tube',
    price: 15,
    mrp: 20,
    discount: '25% OFF',
    rating: 4.8,
    reviewsCount: 340,
    category: 'Pain Relief & Muscle Care',
    image: 'https://zdqomjcgmst0grfw.public.blob.vercel-storage.com/products/image_1788243981535.webp',
    featurePill: 'Quick Relief',
    stock: 117,
    is_listed: true
  },
  {
    id: '26f7c1c5-7ac6-40ef-b5ab-fb51bc4af999',
    numericId: 2,
    name: 'Amrutanjan Strong Pain Balm 44g',
    brand: 'Amrutanjan',
    pack: '44g Jar',
    price: 44,
    mrp: 55,
    discount: '20% OFF',
    rating: 4.7,
    reviewsCount: 285,
    category: 'Pain Relief & Muscle Care',
    image: 'https://zdqomjcgmst0grfw.public.blob.vercel-storage.com/products/image_1788266571644.webp',
    featurePill: 'Double Power',
    stock: 82,
    is_listed: true
  }
];

// 2. Daily Wellness & Immunity Shelf (Actual Listed Products)
export const IMMUNITY_WELLNESS_PRODUCTS = [
  {
    id: '65dd5404-a34d-4915-b8e2-bd672cf3054e',
    numericId: 4,
    name: 'Glucon-D Instant Energy Orange 400g',
    brand: 'Glucon-D',
    pack: '400g Refill Pack',
    price: 173,
    mrp: 195,
    discount: '11% OFF',
    rating: 4.8,
    reviewsCount: 210,
    category: 'Daily Wellness & Immunity',
    image: 'https://zdqomjcgmst0grfw.public.blob.vercel-storage.com/products/image_1788275874028.webp',
    featurePill: 'Instant Glucose',
    stock: 95,
    is_listed: true
  },
  {
    id: '7092d4e9-3123-4a17-a837-732439f8ddf5',
    numericId: 6,
    name: 'Dabur Honey 100% Pure 250g',
    brand: 'Dabur',
    pack: '250g Squeezy Bottle',
    price: 125,
    mrp: 145,
    discount: '14% OFF',
    rating: 4.9,
    reviewsCount: 320,
    category: 'Daily Wellness & Immunity',
    image: 'https://zdqomjcgmst0grfw.public.blob.vercel-storage.com/products/image_1788418284966.webp',
    featurePill: '100% Pure Honey',
    stock: 137,
    is_listed: true
  },
  {
    id: '8223dc88-f1e1-4547-a8b4-82a933c076ff',
    numericId: 8,
    name: 'Horlicks Protein Plus Vanilla 400 g BIB Whey',
    brand: 'Horlicks',
    pack: '400g Carton',
    price: 570,
    mrp: 650,
    discount: '12% OFF',
    rating: 4.7,
    reviewsCount: 145,
    category: 'Daily Wellness & Immunity',
    image: 'https://zdqomjcgmst0grfw.public.blob.vercel-storage.com/products/image_1788415326551.webp',
    featurePill: 'Triple Blend Whey',
    stock: 60,
    is_listed: true
  },
  {
    id: '0e5bd71a-9f44-439e-9af3-7fe0c8ca9673',
    numericId: 10,
    name: 'Complan Nutrition Drink Powder Royale Chocolate Flavour',
    brand: 'Complan',
    pack: '500g Refill Pack',
    price: 599,
    mrp: 680,
    discount: '12% OFF',
    rating: 4.6,
    reviewsCount: 180,
    category: 'Daily Wellness & Immunity',
    image: 'https://zdqomjcgmst0grfw.public.blob.vercel-storage.com/products/image_1788448349592.jpeg',
    featurePill: '34 Vital Nutrients',
    stock: 118,
    is_listed: true
  }
];

// 3. Medical Supplies, Antiseptics & Digestive Care (Actual Listed Products)
export const MEDICAL_SUPPLIES_PRODUCTS = [
  {
    id: '80b9e3b8-e91a-4163-b883-22721f505e47',
    numericId: 3,
    name: 'Dettol Antiseptic Liquid 250ml',
    brand: 'Dettol',
    pack: '250ml Bottle',
    price: 155,
    mrp: 170,
    discount: '9% OFF',
    rating: 4.9,
    reviewsCount: 510,
    category: 'Monsoon Health & Antiseptics',
    image: 'https://zdqomjcgmst0grfw.public.blob.vercel-storage.com/products/image_1788418118653.webp',
    featurePill: 'Clinical Antiseptic',
    stock: 97,
    is_listed: true
  },
  {
    id: '0269bb79-78e6-4992-93d1-6439cc0ce729',
    numericId: 5,
    name: 'Eno Lemon Fast Action Sachet 5g',
    brand: 'Eno',
    pack: '5g Single Sachet',
    price: 10,
    mrp: 12,
    discount: '17% OFF',
    rating: 4.8,
    reviewsCount: 420,
    category: 'Diet & Digestive Health',
    image: 'https://zdqomjcgmst0grfw.public.blob.vercel-storage.com/products/image_1788267142137.webp',
    featurePill: 'Relief in 6 Secs',
    stock: 14,
    is_listed: true
  },
  {
    id: '71a4f009-ffea-47da-995b-21d9600e1e69',
    numericId: 9,
    name: 'surgical mask',
    brand: 'Generic Healthcare',
    pack: 'Pack of 100 pcs',
    price: 200,
    mrp: 250,
    discount: '20% OFF',
    rating: 4.7,
    reviewsCount: 230,
    category: 'Medical Supplies & Devices',
    image: 'https://zdqomjcgmst0grfw.public.blob.vercel-storage.com/products/image_1788431416528.webp',
    featurePill: '3-Ply Protection',
    stock: 49,
    is_listed: true
  },
  {
    id: 'c191a329-8756-42d4-a8ef-d130386d38e2',
    numericId: 7,
    name: 'Bengal Cotton 400 gm',
    brand: 'Bengal Surgical',
    pack: '400g Roll',
    price: 241,
    mrp: 280,
    discount: '14% OFF',
    rating: 4.6,
    reviewsCount: 160,
    category: 'Medical Supplies & Devices',
    image: 'https://zdqomjcgmst0grfw.public.blob.vercel-storage.com/products/image_1788201776121.webp',
    featurePill: 'Pure Absorbent',
    stock: 58,
    is_listed: true
  }
];

// 4. Men's Grooming & Vitality Shelf (Actual Listed Products)
export const MENS_HEALTH_PRODUCTS = [
  {
    id: '11b5db6c-7a8c-4215-b808-04d9d916b32a',
    numericId: 12,
    name: 'NIVEA MEN All-in-1 Face Wash',
    brand: 'NIVEA',
    pack: '100g Tube',
    price: 199,
    mrp: 230,
    discount: '13% OFF',
    rating: 4.8,
    reviewsCount: 290,
    category: "Men's Health & Vitality",
    image: 'https://zdqomjcgmst0grfw.public.blob.vercel-storage.com/products/image_imported_1788623735419.webp',
    featurePill: '10x Effect',
    stock: 60,
    is_listed: true
  },
  {
    id: '24f7f28e-2018-4d23-a244-d6414d3f0dbe',
    numericId: 32,
    name: 'Park Avenue Cool Blue Freshness Deodorant Spray',
    brand: 'Park Avenue',
    pack: '150ml Spray',
    price: 210,
    mrp: 250,
    discount: '16% OFF',
    rating: 4.7,
    reviewsCount: 215,
    category: "Men's Health & Vitality",
    image: 'https://zdqomjcgmst0grfw.public.blob.vercel-storage.com/products/image_imported_1788628126185.jpeg',
    featurePill: 'Long Lasting Freshness',
    stock: 50,
    is_listed: true
  },
  {
    id: '0541ca4b-f237-40b7-9071-70eda0e581b0',
    numericId: 36,
    name: 'Park Avenue Conquer Eau De Perfume',
    brand: 'Park Avenue',
    pack: '100ml Glass Bottle',
    price: 799,
    mrp: 999,
    discount: '20% OFF',
    rating: 4.9,
    reviewsCount: 310,
    category: "Men's Health & Vitality",
    image: 'https://zdqomjcgmst0grfw.public.blob.vercel-storage.com/products/image_imported_1788628127553.jpeg',
    featurePill: 'Eau De Parfum',
    stock: 50,
    is_listed: true
  },
  {
    id: '99849201-92b1-47bb-a901-711928019281',
    numericId: 43,
    name: 'Park Avenue Classic Shaving Cream',
    brand: 'Park Avenue',
    pack: '84g Tube',
    price: 100,
    mrp: 120,
    discount: '17% OFF',
    rating: 4.6,
    reviewsCount: 140,
    category: "Men's Health & Vitality",
    image: 'https://zdqomjcgmst0grfw.public.blob.vercel-storage.com/products/image_imported_1788628131135.jpeg',
    featurePill: 'Rich Foam Lather',
    stock: 50,
    is_listed: true
  }
];

// Diagnostic Lab Packages (Matching actual records in `lab_packages` table)
export const DIAGNOSTIC_PACKAGES = [
  {
    id: 'pkg-1',
    title: 'Advanced Full Body Checkup',
    tag: 'NABL Certified Lab',
    badge: 'Comprehensive',
    testsCount: '85 Tests Included',
    summary: 'CBC, Lipid Profile, Thyroid, LFT, KFT, Blood Sugar & Urine Routine Examination',
    turnaround: 'Digital Report within 24 Hours',
    sampleType: 'Free Home Blood Collection',
    price: 999,
    mrp: 1999,
    discount: '50% OFF',
    popular: true
  },
  {
    id: 'pkg-2',
    title: 'Essential Diabetic Care',
    tag: 'Doctor Verified',
    badge: 'Metabolic Care',
    testsCount: '32 Tests Included',
    summary: 'HbA1c Glycated Hemoglobin, Fasting Blood Sugar & Complete Lipid Profile',
    turnaround: 'Same Day 6 PM Report',
    sampleType: 'Fasting Sample Required',
    price: 499,
    mrp: 999,
    discount: '50% OFF',
    popular: false
  }
];

// Trust Badges
export const TRUST_FEATURES = [
  {
    icon: '',
    title: '100% Genuine Medicines',
    desc: 'Direct manufacturer sourcing with verified batch test certificates.'
  },
  {
    icon: '',
    title: '30-Minute Express Delivery',
    desc: 'Doorstep medicine dispatch & fast home diagnostic sample pickup.'
  },
  {
    icon: '',
    title: 'NABL Certified Laboratories',
    desc: 'Accurate clinical diagnostics verified by certified senior pathologists.'
  },
  {
    icon: '',
    title: 'Registered Pharmacists',
    desc: 'Every prescription is clinically checked before packaging.'
  }
];
