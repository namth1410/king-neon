import { DataSource } from 'typeorm';
import { NeonFont } from '../modules/neon-config/entities/neon-font.entity';
import { NeonColor } from '../modules/neon-config/entities/neon-color.entity';
import { NeonSize } from '../modules/neon-config/entities/neon-size.entity';
import { NeonMaterial } from '../modules/neon-config/entities/neon-material.entity';
import {
  NeonBackboard,
  BackboardType,
} from '../modules/neon-config/entities/neon-backboard.entity';
import { Product, ProductCategory } from '../modules/products/product.entity';
import { User, UserRole } from '../modules/users/user.entity';
import * as bcrypt from 'bcrypt';

// ============================================================
// SEED DATA
// ============================================================

const FONTS: Partial<NeonFont>[] = [
  {
    name: 'Neonderthaw',
    fontFileUrl: undefined,
    previewUrl: '/fonts/neonderthaw.png',
    active: true,
  },
  {
    name: 'Pacifico',
    fontFileUrl: undefined,
    previewUrl: '/fonts/pacifico.png',
    active: true,
  },
  {
    name: 'Sacramento',
    fontFileUrl: undefined,
    previewUrl: '/fonts/sacramento.png',
    active: true,
  },
  {
    name: 'Great Vibes',
    fontFileUrl: undefined,
    previewUrl: '/fonts/great-vibes.png',
    active: true,
  },
  {
    name: 'Alex Brush',
    fontFileUrl: undefined,
    previewUrl: '/fonts/alex-brush.png',
    active: true,
  },
  {
    name: 'Allura',
    fontFileUrl: undefined,
    previewUrl: '/fonts/allura.png',
    active: true,
  },
  {
    name: 'Dancing Script',
    fontFileUrl: undefined,
    previewUrl: '/fonts/dancing-script.png',
    active: true,
  },
  {
    name: 'Monoton',
    fontFileUrl: undefined,
    previewUrl: '/fonts/monoton.png',
    active: true,
  },
];

const COLORS: Partial<NeonColor>[] = [
  {
    name: 'Hot Pink',
    hexCode: '#FF69B4',
    siliconeColor: 'white',
    priceModifier: 0,
    active: true,
  },
  {
    name: 'Red',
    hexCode: '#FF0000',
    siliconeColor: 'red',
    priceModifier: 0,
    active: true,
  },
  {
    name: 'Orange',
    hexCode: '#FFA500',
    siliconeColor: 'orange',
    priceModifier: 0,
    active: true,
  },
  {
    name: 'Yellow',
    hexCode: '#FFFF00',
    siliconeColor: 'yellow',
    priceModifier: 0,
    active: true,
  },
  {
    name: 'Lemon Yellow',
    hexCode: '#FFF44F',
    siliconeColor: 'yellow',
    priceModifier: 0,
    active: true,
  },
  {
    name: 'Green',
    hexCode: '#00FF00',
    siliconeColor: 'green',
    priceModifier: 0,
    active: true,
  },
  {
    name: 'Ice Blue',
    hexCode: '#99FFFF',
    siliconeColor: 'white',
    priceModifier: 0,
    active: true,
  },
  {
    name: 'Blue',
    hexCode: '#0000FF',
    siliconeColor: 'blue',
    priceModifier: 0,
    active: true,
  },
  {
    name: 'Purple',
    hexCode: '#800080',
    siliconeColor: 'purple',
    priceModifier: 0,
    active: true,
  },
  {
    name: 'White',
    hexCode: '#FFFFFF',
    siliconeColor: 'white',
    priceModifier: 0,
    active: true,
  },
  {
    name: 'Warm White',
    hexCode: '#FDFBD3',
    siliconeColor: 'white',
    priceModifier: 0,
    active: true,
  },
  {
    name: 'Rainbow',
    hexCode: 'rainbow',
    siliconeColor: 'multi',
    priceModifier: 50,
    active: true,
  },
];

const SIZES: Partial<NeonSize>[] = [
  {
    name: 'Mini',
    widthInches: 12,
    maxLetters: 6,
    price: 89,
    sortOrder: 1,
    active: true,
  },
  {
    name: 'Small',
    widthInches: 18,
    maxLetters: 10,
    price: 149,
    sortOrder: 2,
    active: true,
  },
  {
    name: 'Medium',
    widthInches: 24,
    maxLetters: 15,
    price: 199,
    sortOrder: 3,
    active: true,
  },
  {
    name: 'Large',
    widthInches: 36,
    maxLetters: 20,
    price: 299,
    sortOrder: 4,
    active: true,
  },
  {
    name: 'X-Large',
    widthInches: 48,
    maxLetters: 25,
    price: 399,
    sortOrder: 5,
    active: true,
  },
  {
    name: 'XXL',
    widthInches: 60,
    maxLetters: 30,
    price: 549,
    sortOrder: 6,
    active: true,
  },
];

const MATERIALS: Partial<NeonMaterial>[] = [
  {
    name: 'LED Flex Neon',
    description:
      'Premium silicone LED neon flex tubing. Safe, energy-efficient, and long-lasting.',
    priceModifier: 0,
    isWaterproof: false,
    active: true,
  },
  {
    name: 'Waterproof LED Neon',
    description:
      'IP65 rated waterproof silicone neon. Perfect for outdoor use.',
    priceModifier: 30,
    isWaterproof: true,
    active: true,
  },
];

const BACKBOARDS: Partial<NeonBackboard>[] = [
  {
    type: BackboardType.CUT_TO_SHAPE,
    name: 'Cut to Shape',
    priceModifier: 0,
    availableColors: ['clear', 'black', 'white', 'mirror'],
    active: true,
  },
  {
    type: BackboardType.RECTANGLE,
    name: 'Rectangle',
    priceModifier: 20,
    availableColors: ['clear', 'black', 'white', 'frosted'],
    active: true,
  },
  {
    type: BackboardType.ACRYLIC,
    name: 'Premium Acrylic',
    priceModifier: 40,
    availableColors: [
      'clear',
      'black',
      'white',
      'gold-mirror',
      'rose-gold-mirror',
    ],
    active: true,
  },
  {
    type: BackboardType.NO_BACKBOARD,
    name: 'No Backboard',
    priceModifier: -20,
    availableColors: [],
    active: true,
  },
];

const PRODUCTS: Partial<Product>[] = [
  {
    name: 'Good Vibes Only',
    slug: 'good-vibes-only',
    description:
      'Spread positivity with this iconic "Good Vibes Only" LED neon sign. Perfect for bedrooms, living rooms, or creative spaces.',
    basePrice: 199,
    category: ProductCategory.LED_NEON,
    isCustom: false,
    active: true,
    images: [
      '/products/good-vibes-only-1.jpg',
      '/products/good-vibes-only-2.jpg',
    ],
    featuredImage: '/products/good-vibes-only-1.jpg',
  },
  {
    name: 'Hello Gorgeous',
    slug: 'hello-gorgeous',
    description:
      'Add a touch of glamour to your space with this beautiful "Hello Gorgeous" neon sign. Ideal for salons, bedrooms, or vanity areas.',
    basePrice: 179,
    category: ProductCategory.LED_NEON,
    isCustom: false,
    active: true,
    images: ['/products/hello-gorgeous-1.jpg'],
    featuredImage: '/products/hello-gorgeous-1.jpg',
  },
  {
    name: 'Love',
    slug: 'love',
    description:
      'Classic "Love" neon sign that spreads warmth and affection. Perfect for weddings, bedrooms, or as a heartfelt gift.',
    basePrice: 149,
    category: ProductCategory.LED_NEON,
    isCustom: false,
    active: true,
    images: ['/products/love-1.jpg', '/products/love-2.jpg'],
    featuredImage: '/products/love-1.jpg',
  },
  {
    name: 'Dream Big',
    slug: 'dream-big',
    description:
      'Inspire yourself daily with this motivational "Dream Big" LED neon sign. Great for home offices, studios, or kids rooms.',
    basePrice: 189,
    category: ProductCategory.LED_NEON,
    isCustom: false,
    active: true,
    images: ['/products/dream-big-1.jpg'],
    featuredImage: '/products/dream-big-1.jpg',
  },
  {
    name: 'Better Together',
    slug: 'better-together',
    description:
      'The perfect wedding or couple\'s neon sign. "Better Together" celebrates love and partnership.',
    basePrice: 249,
    category: ProductCategory.LED_NEON,
    isCustom: false,
    active: true,
    images: ['/products/better-together-1.jpg'],
    featuredImage: '/products/better-together-1.jpg',
  },
  {
    name: 'Cheers',
    slug: 'cheers',
    description:
      'Celebrate every moment with this fun "Cheers" neon sign. Perfect for bars, parties, or home entertainment areas.',
    basePrice: 159,
    category: ProductCategory.LED_NEON,
    isCustom: false,
    active: true,
    images: ['/products/cheers-1.jpg'],
    featuredImage: '/products/cheers-1.jpg',
  },
  {
    name: 'Neon Martini Glass',
    slug: 'neon-martini-glass',
    description:
      'Stylish martini glass LED neon art. Adds a sophisticated touch to bars, lounges, or home cocktail corners.',
    basePrice: 129,
    category: ProductCategory.LED_NEON,
    isCustom: false,
    active: true,
    images: ['/products/martini-1.jpg'],
    featuredImage: '/products/martini-1.jpg',
  },
  {
    name: 'Hustle',
    slug: 'hustle',
    description:
      'Stay motivated with this bold "Hustle" neon sign. Perfect for entrepreneurs, home offices, or gyms.',
    basePrice: 169,
    category: ProductCategory.LED_NEON,
    isCustom: false,
    active: true,
    images: ['/products/hustle-1.jpg'],
    featuredImage: '/products/hustle-1.jpg',
  },
  {
    name: 'Custom Logo Sign',
    slug: 'custom-logo-sign',
    description:
      'Transform your business logo into a stunning LED neon sign. Perfect for storefronts, offices, or events.',
    basePrice: 399,
    category: ProductCategory.BACKLIT_SIGNS,
    isCustom: true,
    active: true,
    images: ['/products/custom-logo-1.jpg'],
    featuredImage: '/products/custom-logo-1.jpg',
  },
  {
    name: 'Channel Letter Sign',
    slug: 'channel-letter-sign',
    description:
      'Professional 3D channel letter signage for businesses. High-impact, durable, and energy-efficient.',
    basePrice: 599,
    category: ProductCategory.CHANNEL_LETTERS,
    isCustom: true,
    active: true,
    images: ['/products/channel-letters-1.jpg'],
    featuredImage: '/products/channel-letters-1.jpg',
  },
];

const ADMIN_USER = {
  email: 'admin@kingneon.com',
  password: 'Admin123!',
  name: 'King Neon Admin',
  role: UserRole.ADMIN,
};

// ============================================================
// SEED FUNCTION
// ============================================================

export async function seed(dataSource: DataSource): Promise<void> {
  console.log('🌱 Starting database seed...\n');

  // Seed Admin User
  const userRepo = dataSource.getRepository(User);
  const existingAdmin = await userRepo.findOne({
    where: { email: ADMIN_USER.email },
  });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(ADMIN_USER.password, 10);
    await userRepo.save({
      email: ADMIN_USER.email,
      name: ADMIN_USER.name,
      role: ADMIN_USER.role,
      passwordHash: hashedPassword,
    });
    console.log('✅ Admin user created: admin@kingneon.com / Admin123!');
  } else {
    console.log('⏭️  Admin user already exists');
  }

  // Seed Neon Fonts
  const fontRepo = dataSource.getRepository(NeonFont);
  const existingFonts = await fontRepo.count();
  if (existingFonts === 0) {
    await fontRepo.save(FONTS);
    console.log(`✅ ${FONTS.length} neon fonts seeded`);
  } else {
    console.log(`⏭️  Neon fonts already exist (${existingFonts})`);
  }

  // Seed Neon Colors
  const colorRepo = dataSource.getRepository(NeonColor);
  const existingColors = await colorRepo.count();
  if (existingColors === 0) {
    await colorRepo.save(COLORS);
    console.log(`✅ ${COLORS.length} neon colors seeded`);
  } else {
    console.log(`⏭️  Neon colors already exist (${existingColors})`);
  }

  // Seed Neon Sizes
  const sizeRepo = dataSource.getRepository(NeonSize);
  const existingSizes = await sizeRepo.count();
  if (existingSizes === 0) {
    await sizeRepo.save(SIZES);
    console.log(`✅ ${SIZES.length} neon sizes seeded`);
  } else {
    console.log(`⏭️  Neon sizes already exist (${existingSizes})`);
  }

  // Seed Neon Materials
  const materialRepo = dataSource.getRepository(NeonMaterial);
  const existingMaterials = await materialRepo.count();
  if (existingMaterials === 0) {
    await materialRepo.save(MATERIALS);
    console.log(`✅ ${MATERIALS.length} neon materials seeded`);
  } else {
    console.log(`⏭️  Neon materials already exist (${existingMaterials})`);
  }

  // Seed Neon Backboards
  const backboardRepo = dataSource.getRepository(NeonBackboard);
  const existingBackboards = await backboardRepo.count();
  if (existingBackboards === 0) {
    await backboardRepo.save(BACKBOARDS);
    console.log(`✅ ${BACKBOARDS.length} neon backboards seeded`);
  } else {
    console.log(`⏭️  Neon backboards already exist (${existingBackboards})`);
  }

  // Seed Products
  const productRepo = dataSource.getRepository(Product);
  const existingProducts = await productRepo.count();
  if (existingProducts === 0) {
    await productRepo.save(PRODUCTS);
    console.log(`✅ ${PRODUCTS.length} products seeded`);
  } else {
    console.log(`⏭️  Products already exist (${existingProducts})`);
  }

  console.log('\n🎉 Database seed completed!\n');
}
