export const categories = [
  {
    name: 'Beauty & Wellness',
    icon: '\uD83D\uDC84',
    subcategories: [
      'Manicure / Nail Services',
      'Haircuts / Hair Coloring',
      'Massage',
      'Facials & Skincare',
      'Cosmetology / Aesthetic Treatments',
      'Makeup Services',
      'Brow & Lash Services',
    ],
  },
  {
    name: 'Health & Medical',
    icon: '\uD83C\uDFE5',
    subcategories: [
      'Doctors / Clinics',
      'Dentistry',
      'Optics',
      'Physical Therapy / Rehabilitation',
      'Mental Health',
      'Nutritionist / Dietitian',
      'Medical Aesthetics / Cosmetic Injections',
      'Pharmacy',
    ],
  },
  {
    name: 'Home Services',
    icon: '\uD83C\uDFE0',
    subcategories: [
      'Cleaning',
      'Handyman',
      'Furniture Assembly',
      'Junk Removal',
      'Moving Help',
      'Disinfection / Pest Control',
      'Window / Carpet / Upholstery Cleaning',
    ],
  },
  {
    name: 'Construction & Repairs',
    icon: '\uD83D\uDEE0\uFE0F',
    subcategories: [
      'General Repairs',
      'Painting / Drywall',
      'Flooring Installation',
      'Plumbing',
      'Electrical Work',
      'Roofing',
      'Kitchen / Bathroom Remodeling',
      'Appliance Repair & Installation',
      'AC / Heater Service',
    ],
  },
  {
    name: 'Garden & Outdoor',
    icon: '\uD83C\uDF3F',
    subcategories: [
      'Landscaping',
      'Lawn Mowing',
      'Tree Trimming',
      'Irrigation Systems',
    ],
  },
  {
    name: 'Auto & Transportation',
    icon: '\uD83D\uDE97',
    subcategories: [
      'Car Repair / Mechanic',
      'Car Detailing / Car Wash',
      'Driving Lessons',
      'Airport Transfers',
      'Vehicle Buying / Selling Assistance',
    ],
  },
  {
    name: 'Food & Baking',
    icon: '\uD83C\uDF73',
    subcategories: [
      'Home Cooking',
      'Cakes & Confectionery',
      'Catering',
      'Meal / Grocery Delivery',
    ],
  },
  {
    name: 'Family & Education',
    icon: '\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67',
    subcategories: [
      'Tutors / Language Teachers',
      'Nannies',
      'Kids Clubs / Activities',
      'Playground & Kids Events',
      'Music / Art Classes for Kids',
    ],
  },
  {
    name: 'Legal & Documents',
    icon: '\u2696\uFE0F',
    subcategories: [
      'Lawyer',
      'Immigration Lawyer',
      'Notary Services',
      'Translation Services',
      'Taxes / Tax Assistance',
    ],
  },
  {
    name: 'Real Estate & Finance',
    icon: '\uD83C\uDFE1',
    subcategories: [
      'Realtors / Brokers',
      'Insurance',
      'Banking & Financial Consulting',
      'Mortgage / Rent Assistance',
    ],
  },
  {
    name: 'Business & Admin Support',
    icon: '\uD83E\uDDFE',
    subcategories: [
      'Bookkeeping',
      'Business Registration Help',
      'HR / Recruiting',
      'Office Administration',
    ],
  },
  {
    name: 'Career & Coaching',
    icon: '\uD83C\uDFAF',
    subcategories: [
      'Career Coaching',
      'Resume / CV Writing',
      'Interview Preparation',
      'Job Search Assistance',
      'LinkedIn Profile Optimization',
    ],
  },
  {
    name: 'IT & Tech Services',
    icon: '\uD83D\uDCBB',
    subcategories: [
      'Computer / Laptop Repair',
      'Phone Repair',
      'Network / Wi-Fi Setup',
      'Website Development',
      'Smart Home Installation',
    ],
  },
  {
    name: 'Creative & Digital',
    icon: '\uD83C\uDFA8',
    subcategories: [
      'Photography',
      'Videography',
      'Video Editing',
      'Graphic Design / Branding',
      'Illustration / Art',
      'Content Creation',
    ],
  },
  {
    name: 'Marketing & Growth',
    icon: '\uD83D\uDCE3',
    subcategories: [
      'Social Media Management',
      'Advertising Setup',
      'SEO',
      'Marketing Strategy',
    ],
  },
  {
    name: 'Crafts, Sewing & Handmade',
    icon: '\uD83E\uDDF5',
    subcategories: [
      'Handmade Products',
      'Clothing Repair / Alterations',
      'Tailoring / Custom Clothing',
      'Embroidery',
      'Floristry',
      'Event Decorations',
    ],
  },
  {
    name: 'Events & Entertainment',
    icon: '\uD83C\uDF89',
    subcategories: [
      'Event Organization',
      "Children's Parties",
      'DJ / MC / Hosts',
      'Equipment Rental',
      'Party Planning & Styling',
    ],
  },
  {
    name: 'Pet Services',
    icon: '\uD83D\uDC3E',
    subcategories: [
      'Dog Walking',
      'Pet Sitting',
      'Grooming',
      'Training',
      'Vet Transport Assistance',
    ],
  },
  {
    name: 'Security & Safety',
    icon: '\uD83D\uDEE1\uFE0F',
    subcategories: ['Alarm Systems', 'Camera Installation'],
  },
  {
    name: 'Personal & Errand Services',
    icon: '\uD83D\uDECD\uFE0F',
    subcategories: [
      'Personal Shopper',
      'Errand Running',
      'Closet / Home Organization',
    ],
  },
  {
    name: 'Other Services',
    icon: '\u2753',
    subcategories: ['Other / Custom Services'],
  },
];

export const quickTags = ['Lawyer', 'Cleaning', 'Health & Medical', 'Handyman'];

export const quickTagIcons = {
  'Lawyer': '⚖️',
  'Cleaning': '🧹',
  'Health & Medical': '🏥',
  'Handyman': '🔧',
};

export function findParentCategory(subcategory) {
  for (const cat of categories) {
    if (cat.subcategories.includes(subcategory)) {
      return cat.name;
    }
  }
  return null;
}

export function getAllSubcategories() {
  return categories.flatMap((cat) => cat.subcategories);
}
