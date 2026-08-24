/**
 * Client-only marketing / visual demo content.
 * Not loaded from the API or database — safe for UI previews.
 */

export const PRODUCT_IMAGE_PLACEHOLDER =
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80';

export const demoHero = {
  imageUrl:
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1600&q=80',
  eyebrow: 'Neighborhood café',
  headline: 'Welcome to BrewFlow',
  subcopy:
    'Fresh coffee and handcrafted drinks — order ahead and pick up when it is ready.',
  ctaLabel: 'Order Now',
};

export const demoHighlights = [
  {
    title: 'Fresh pickup',
    text: 'Place your order online and grab it hot from the counter.',
    imageUrl:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80',
  },
  {
    title: 'Crafted blends',
    text: 'Beans roasted for balanced flavor across every cup.',
    imageUrl:
      'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=400&q=80',
  },
  {
    title: 'Your way',
    text: 'Size, milk, and add-ons — customize every drink.',
    imageUrl:
      'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=400&q=80',
  },
];

/** Visual-only demo cards — CTAs should go to /menu, never fake product IDs. */
export const demoRecommended = [
  {
    name: 'Cappuccino',
    blurb: 'Espresso with silky steamed milk and foam.',
    priceLabel: '$4.50',
    imageUrl:
      'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Iced Latte',
    blurb: 'Chilled espresso over ice with cold milk.',
    priceLabel: '$4.75',
    imageUrl:
      'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Mocha',
    blurb: 'Chocolate, espresso, and steamed milk.',
    priceLabel: '$5.25',
    imageUrl:
      'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&w=600&q=80',
  },
];

export const demoDesserts = [
  {
    name: 'Chocolate Muffin',
    blurb: 'Rich cocoa crumb, bakery-fresh.',
    priceLabel: '$3.50',
    imageUrl:
      'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Macarons',
    blurb: 'Assorted French-style shells.',
    priceLabel: '$4.00',
    imageUrl:
      'https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Cheesecake slice',
    blurb: 'Creamy classic with biscuit base.',
    priceLabel: '$4.50',
    imageUrl:
      'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80',
  },
];

export const demoTestimonials = [
  {
    name: 'Maya L.',
    quote: 'Ordering ahead means my latte is ready when I walk in. Perfect.',
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Jordan K.',
    quote: 'The customizations are clear and the drinks taste consistent.',
    imageUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Sam R.',
    quote: 'Feels like a real café, just faster. Love the pickup flow.',
    imageUrl:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
  },
];

export const demoStats = [
  { value: '2k+', label: 'Cups served monthly' },
  { value: '18+', label: 'Signature drinks' },
  { value: '4.9', label: 'Guest rating' },
];

export const demoBanner = {
  imageUrl:
    'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1400&q=80',
  title: 'Taste the difference in every pour',
  ctaLabel: 'Explore the menu',
};
