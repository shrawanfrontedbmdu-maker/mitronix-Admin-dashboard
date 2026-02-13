export const mockServiceRequests = [
  {
    id: 'SR-2024-001',
    type: 'Refund',
    orderId: 'ORD-2024-1001',
    product: 'Wireless Bluetooth Headphones',
    description: 'Product stopped working after 2 days of purchase. Audio quality is very poor and left ear piece has no sound.',
    priority: 'High',
    status: 'Open',
    userInfo: {
      name: 'John Anderson',
      email: 'john.anderson@email.com',
      phone: '+1 (555) 123-4567'
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    assignedTo: 'Support Team',
    estimatedResolution: '2024-01-17T17:00:00Z',
    category: 'Product Quality'
  },
  {
    id: 'SR-2024-002',
    type: 'Exchange',
    orderId: 'ORD-2024-1002',
    product: 'Smart Fitness Watch',
    description: 'Received wrong color. Ordered black but received silver. Need to exchange for correct color.',
    priority: 'Medium',
    status: 'In Progress',
    userInfo: {
      name: 'Sarah Mitchell',
      email: 'sarah.mitchell@email.com',
      phone: '+1 (555) 234-5678'
    },
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-15T09:15:00Z',
    assignedTo: 'Lisa Johnson',
    estimatedResolution: '2024-01-18T12:00:00Z',
    category: 'Wrong Item'
  },
  {
    id: 'SR-2024-003',
    type: 'Technical Support',
    orderId: 'ORD-2024-1003',
    product: 'Gaming Laptop Pro',
    description: 'Laptop is overheating during gaming sessions. Temperature reaches 95°C and causes performance throttling.',
    priority: 'High',
    status: 'In Progress',
    userInfo: {
      name: 'Mike Johnson',
      email: 'mike.johnson@email.com',
      phone: '+1 (555) 345-6789'
    },
    createdAt: '2024-01-13T16:45:00Z',
    updatedAt: '2024-01-15T11:30:00Z',
    assignedTo: 'Tech Support',
    estimatedResolution: '2024-01-16T15:00:00Z',
    category: 'Technical Issue'
  },
  {
    id: 'SR-2024-004',
    type: 'Warranty Claim',
    orderId: 'ORD-2024-1004',
    product: 'Smartphone X Pro',
    description: 'Screen cracked without any impact. Phone was in protective case and screen protector was applied.',
    priority: 'Medium',
    status: 'Resolved',
    userInfo: {
      name: 'Emily Chen',
      email: 'emily.chen@email.com',
      phone: '+1 (555) 456-7890'
    },
    createdAt: '2024-01-10T11:15:00Z',
    updatedAt: '2024-01-14T16:45:00Z',
    assignedTo: 'Warranty Team',
    estimatedResolution: '2024-01-14T16:00:00Z',
    category: 'Manufacturing Defect',
    resolution: 'Replacement device shipped to customer'
  },
  {
    id: 'SR-2024-005',
    type: 'Refund',
    orderId: 'ORD-2024-1005',
    product: 'Wireless Charging Pad',
    description: 'Product arrived damaged in shipping. Box was crushed and charging pad has visible cracks.',
    priority: 'Medium',
    status: 'Open',
    userInfo: {
      name: 'David Wilson',
      email: 'david.wilson@email.com',
      phone: '+1 (555) 567-8901'
    },
    createdAt: '2024-01-15T09:20:00Z',
    updatedAt: '2024-01-15T09:20:00Z',
    assignedTo: 'Returns Team',
    estimatedResolution: '2024-01-17T14:00:00Z',
    category: 'Shipping Damage'
  },
  {
    id: 'SR-2024-006',
    type: 'Exchange',
    orderId: 'ORD-2024-1006',
    product: 'Bluetooth Speaker Mini',
    description: 'Size is smaller than expected based on product description. Would like to exchange for larger model.',
    priority: 'Low',
    status: 'Closed',
    userInfo: {
      name: 'Rachel Green',
      email: 'rachel.green@email.com',
      phone: '+1 (555) 678-9012'
    },
    createdAt: '2024-01-08T13:30:00Z',
    updatedAt: '2024-01-12T10:15:00Z',
    assignedTo: 'Customer Service',
    estimatedResolution: '2024-01-12T10:00:00Z',
    category: 'Size Issue',
    resolution: 'Customer opted to keep original product after size clarification'
  }
];

// Blogs Mock Data
export const mockBlogs = [
  {
    id: 'blog-001',
    title: 'The Future of Wireless Technology in 2024',
    slug: 'future-wireless-technology-2024',
    excerpt: 'Explore the latest innovations in wireless technology and how they will shape our digital experiences in 2024.',
    content: `
      <section>
        <h2>Introduction to Wireless Innovation</h2>
        <p>The wireless technology landscape is evolving at an unprecedented pace. In 2024, we're witnessing breakthrough innovations that promise to revolutionize how we connect, communicate, and interact with digital devices.</p>
      </section>
      
      <section>
        <h2>Key Trends in Wireless Technology</h2>
        <p>From 6G research initiatives to advanced Wi-Fi 7 implementations, the wireless industry is pushing boundaries like never before. Here are the most significant trends:</p>
        <ul>
          <li>Ultra-low latency communication protocols</li>
          <li>Enhanced energy efficiency in wireless devices</li>
          <li>Improved security frameworks</li>
          <li>Seamless device interoperability</li>
        </ul>
      </section>
      
      <section>
        <h2>Impact on Consumer Electronics</h2>
        <p>These advancements are directly impacting the consumer electronics market, enabling new product categories and enhancing existing ones. Smart homes, wearables, and IoT devices are becoming more interconnected and efficient.</p>
      </section>
    `,
    featuredImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop',
    category: 'Technology',
    author: {
      name: 'Alex Rodriguez',
      email: 'alex.rodriguez@mittronix.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    tags: ['wireless', 'technology', '2024', 'innovation', 'connectivity'],
    status: 'published',
    isFeatured: true,
    isCommentEnabled: true,
    publishedAt: '2024-01-15T08:00:00Z',
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
    readTime: 8,
    views: 1247,
    likes: 89,
    comments: 23
  },
  {
    id: 'blog-002',
    title: 'Smart Home Automation: A Beginner\'s Guide',
    slug: 'smart-home-automation-beginners-guide',
    excerpt: 'Everything you need to know to get started with smart home automation, from basic concepts to practical implementations.',
    content: `
      <section>
        <h2>Understanding Smart Home Basics</h2>
        <p>Smart home automation isn't just a luxury—it's becoming an essential part of modern living. This comprehensive guide will walk you through everything you need to know to transform your house into a smart home.</p>
      </section>
      
      <section>
        <h2>Essential Smart Home Components</h2>
        <p>Building a smart home starts with understanding the core components:</p>
        <ul>
          <li>Smart Hub or Controller</li>
          <li>Smart Lighting Systems</li>
          <li>Smart Thermostats</li>
          <li>Security Cameras and Sensors</li>
          <li>Smart Speakers and Voice Assistants</li>
        </ul>
      </section>
      
      <section>
        <h2>Getting Started on a Budget</h2>
        <p>You don't need to invest thousands to begin your smart home journey. Start with affordable options like smart bulbs, smart plugs, and a basic smart speaker to get familiar with the ecosystem.</p>
      </section>
    `,
    featuredImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop',
    category: 'Smart Home',
    author: {
      name: 'Jennifer Kim',
      email: 'jennifer.kim@mittronix.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1ab?w=100&h=100&fit=crop&crop=face'
    },
    tags: ['smart home', 'automation', 'beginners', 'IoT', 'technology'],
    status: 'published',
    isFeatured: false,
    isCommentEnabled: true,
    publishedAt: '2024-01-12T10:00:00Z',
    createdAt: '2024-01-08T16:20:00Z',
    updatedAt: '2024-01-12T10:00:00Z',
    readTime: 6,
    views: 892,
    likes: 56,
    comments: 18
  },
  {
    id: 'blog-003',
    title: 'Gaming Laptops vs Desktop PCs: Which Is Right for You?',
    slug: 'gaming-laptops-vs-desktop-pcs-comparison',
    excerpt: 'An in-depth comparison of gaming laptops and desktop PCs to help you make the best choice for your gaming needs.',
    content: `
      <section>
        <h2>The Great Gaming Debate</h2>
        <p>Choosing between a gaming laptop and a desktop PC is one of the most common dilemmas faced by gamers today. Both options have their merits, and the best choice depends on your specific needs, budget, and lifestyle.</p>
      </section>
      
      <section>
        <h2>Gaming Laptop Advantages</h2>
        <ul>
          <li>Portability and mobility</li>
          <li>All-in-one solution</li>
          <li>Space-efficient design</li>
          <li>Built-in battery backup</li>
        </ul>
      </section>
      
      <section>
        <h2>Desktop PC Benefits</h2>
        <ul>
          <li>Superior performance per dollar</li>
          <li>Better cooling and thermal management</li>
          <li>Easier upgradability</li>
          <li>Larger screens and multiple monitor support</li>
        </ul>
      </section>
    `,
    featuredImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=400&fit=crop',
    category: 'Gaming',
    author: {
      name: 'Marcus Thompson',
      email: 'marcus.thompson@mittronix.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    tags: ['gaming', 'laptops', 'desktop', 'comparison', 'hardware'],
    status: 'published',
    isFeatured: true,
    isCommentEnabled: true,
    publishedAt: '2024-01-10T15:30:00Z',
    createdAt: '2024-01-05T12:15:00Z',
    updatedAt: '2024-01-10T15:30:00Z',
    readTime: 10,
    views: 1543,
    likes: 127,
    comments: 34
  },
  {
    id: 'blog-004',
    title: 'Top 10 Tech Accessories Every Professional Needs',
    slug: 'top-10-tech-accessories-professionals',
    excerpt: 'Discover the essential tech accessories that can boost your productivity and elevate your professional workflow.',
    content: `
      <section>
        <h2>Productivity-Boosting Tech Essentials</h2>
        <p>In today's fast-paced professional environment, having the right tech accessories can make the difference between struggling to keep up and excelling in your role. Here are the top 10 accessories every professional should consider.</p>
      </section>
      
      <section>
        <h2>The Essential List</h2>
        <ol>
          <li>Wireless Noise-Canceling Headphones</li>
          <li>Portable Power Bank</li>
          <li>Multi-Port USB Hub</li>
          <li>Ergonomic Wireless Mouse</li>
          <li>Laptop Stand for Better Posture</li>
          <li>Blue Light Blocking Glasses</li>
          <li>Wireless Charging Pad</li>
          <li>Compact Bluetooth Speaker</li>
          <li>Cable Management Solutions</li>
          <li>High-Quality Webcam</li>
        </ol>
      </section>
    `,
    featuredImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop',
    category: 'Accessories',
    author: {
      name: 'Sarah Davis',
      email: 'sarah.davis@mittronix.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    },
    tags: ['accessories', 'productivity', 'professional', 'workspace', 'tech'],
    status: 'published',
    isFeatured: false,
    isCommentEnabled: true,
    publishedAt: '2024-01-08T12:00:00Z',
    createdAt: '2024-01-03T10:45:00Z',
    updatedAt: '2024-01-08T12:00:00Z',
    readTime: 7,
    views: 967,
    likes: 73,
    comments: 15
  },
  {
    id: 'blog-005',
    title: 'The Rise of Sustainable Technology',
    slug: 'rise-of-sustainable-technology',
    excerpt: 'How the tech industry is embracing sustainability and what it means for consumers and the environment.',
    content: `
      <section>
        <h2>Technology Meets Environmental Responsibility</h2>
        <p>The technology industry is undergoing a significant transformation as companies increasingly prioritize environmental sustainability. This shift is not just about corporate responsibility—it's about creating a better future for everyone.</p>
      </section>
      
      <section>
        <h2>Sustainable Tech Initiatives</h2>
        <p>Leading tech companies are implementing various initiatives to reduce their environmental impact:</p>
        <ul>
          <li>Carbon-neutral manufacturing processes</li>
          <li>Renewable energy in data centers</li>
          <li>Biodegradable packaging materials</li>
          <li>Extended product lifecycles</li>
          <li>Recycling and refurbishment programs</li>
        </ul>
      </section>
    `,
    featuredImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop',
    category: 'Sustainability',
    author: {
      name: 'Dr. Emma Wilson',
      email: 'emma.wilson@mittronix.com',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face'
    },
    tags: ['sustainability', 'environment', 'green tech', 'carbon neutral', 'innovation'],
    status: 'draft',
    isFeatured: false,
    isCommentEnabled: true,
    publishedAt: null,
    createdAt: '2024-01-14T09:30:00Z',
    updatedAt: '2024-01-15T11:20:00Z',
    readTime: 9,
    views: 0,
    likes: 0,
    comments: 0
  }
];

// Categories for blogs
export const mockBlogCategories = [
  { id: 'tech', name: 'Technology', slug: 'technology', count: 15 },
  { id: 'gaming', name: 'Gaming', slug: 'gaming', count: 8 },
  { id: 'smart-home', name: 'Smart Home', slug: 'smart-home', count: 12 },
  { id: 'accessories', name: 'Accessories', slug: 'accessories', count: 6 },
  { id: 'sustainability', name: 'Sustainability', slug: 'sustainability', count: 4 },
  { id: 'reviews', name: 'Reviews', slug: 'reviews', count: 10 },
  { id: 'tutorials', name: 'Tutorials', slug: 'tutorials', count: 7 }
];

// Users for service requests and notifications
export const mockUsers = [
  {
    id: 'user-001',
    name: 'John Anderson',
    email: 'john.anderson@email.com',
    phone: '+1 (555) 123-4567',
    type: 'customer',
    joinDate: '2023-08-15',
    lastActive: '2024-01-15T14:30:00Z'
  },
  {
    id: 'user-002',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@email.com',
    phone: '+1 (555) 234-5678',
    type: 'customer',
    joinDate: '2023-09-22',
    lastActive: '2024-01-15T10:15:00Z'
  },
  {
    id: 'user-003',
    name: 'Mike Johnson',
    email: 'mike.johnson@email.com',
    phone: '+1 (555) 345-6789',
    type: 'customer',
    joinDate: '2023-07-10',
    lastActive: '2024-01-14T18:45:00Z'
  },
  {
    id: 'user-004',
    name: 'Emily Chen',
    email: 'emily.chen@email.com',
    phone: '+1 (555) 456-7890',
    type: 'customer',
    joinDate: '2023-11-03',
    lastActive: '2024-01-15T09:20:00Z'
  },
  {
    id: 'admin-001',
    name: 'Lisa Johnson',
    email: 'lisa.johnson@mittronix.com',
    phone: '+1 (555) 987-6543',
    type: 'admin',
    joinDate: '2022-03-15',
    lastActive: '2024-01-15T16:00:00Z'
  }
];

// Mock Categories Data
export const mockCategories = [
  {
    _id: 'cat-001',
    title: 'Television & Entertainment',
    description: 'LED TVs, Smart TVs, and entertainment systems',
    slug: 'television-entertainment',
    isActive: true,
    parent: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    _id: 'cat-002',
    title: 'Home Appliances',
    description: 'Washing machines, refrigerators, and other appliances',
    slug: 'home-appliances',
    isActive: true,
    parent: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    _id: 'cat-003',
    title: 'Kitchen Appliances',
    description: 'Microwaves, ovens, and kitchen equipment',
    slug: 'kitchen-appliances',
    isActive: true,
    parent: 'cat-002',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    _id: 'cat-004',
    title: 'Cooling Appliances',
    description: 'Refrigerators, air conditioners, and cooling systems',
    slug: 'cooling-appliances',
    isActive: true,
    parent: 'cat-002',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    _id: 'cat-005',
    title: 'Laundry Appliances',
    description: 'Washing machines, dryers, and laundry equipment',
    slug: 'laundry-appliances',
    isActive: true,
    parent: 'cat-002',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Mock Products Data
export const mockProducts = [
  {
    _id: 'prod-001',
    name: 'Samsung 65" QLED 4K Smart TV',
    slug: 'samsung-65-qled-4k-smart-tv',
    description: 'Premium 65-inch QLED 4K Smart TV with HDR10+ technology, built-in Alexa support, and stunning picture quality for ultimate entertainment experience.',
    category: 'cat-001',
    sku: 'SAM-TV-65Q90-2024',
    price: 89999,
    mrp: 119999,
    discountPrice: 89999,
    colour: 'Titan Gray',
    size: '65 inches',
    variants: ['55 inches', '65 inches', '75 inches'],
    specification: '65" QLED 4K Display, HDR10+, Smart TV, Built-in Alexa, 3 HDMI ports, WiFi enabled, Voice Control',
    stockQuantity: 12,
    stockStatus: 'InStock',
    brand: 'Samsung',
    weight: '28.5 kg',
    dimensions: '145.1 x 83.3 x 9.9 cm',
    tags: ['smart tv', '4k', 'qled', 'samsung', 'entertainment', 'alexa'],
    warranty: '2 years comprehensive warranty + 10 years panel warranty',
    returnPolicy: '30 days return policy. Product must be in original condition.',
    barcode: '8801643569148',
    supplier: {
      name: 'Samsung India Electronics',
      contact: '+91-1800-123-456',
      email: 'supplier@samsung.com'
    },
    hsnCode: '85285200',
    shipping: {
      charges: 'Free delivery',
      deliveryTime: '2-5 business days',
      restrictions: 'No cash on delivery for this item'
    },
    isActive: true,
    status: 'Active',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop',
        alt: 'Samsung 65 inch QLED 4K Smart TV'
      }
    ],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    _id: 'prod-002',
    name: 'LG 7kg Front Load Washing Machine',
    slug: 'lg-7kg-front-load-washing-machine',
    description: 'Energy-efficient 7kg front load washing machine with AI DD technology and steam wash for better fabric care and superior cleaning performance.',
    category: 'cat-005',
    sku: 'LG-WM-7KG-FHM1207ZDL',
    price: 42999,
    mrp: 54999,
    discountPrice: 42999,
    colour: 'White',
    size: '7 kg',
    variants: ['6 kg', '7 kg', '8 kg'],
    specification: '7kg Capacity, Front Load, AI DD Technology, Steam Wash, 1400 RPM, Energy Star 5 Rated, 14 wash programs',
    stockQuantity: 8,
    stockStatus: 'InStock',
    brand: 'LG',
    weight: '65 kg',
    dimensions: '60 x 56 x 85 cm',
    tags: ['washing machine', 'front load', 'lg', 'ai technology', 'steam wash', 'energy efficient'],
    warranty: '2 years comprehensive warranty + 10 years motor warranty',
    returnPolicy: '7 days return policy. Installation required before return.',
    barcode: '8801084594628',
    supplier: {
      name: 'LG Electronics India',
      contact: '+91-1800-180-9999',
      email: 'supplier@lge.com'
    },
    hsnCode: '84501200',
    shipping: {
      charges: 'Free delivery + installation',
      deliveryTime: '3-7 business days',
      restrictions: 'Installation included. Old appliance exchange available'
    },
    isActive: true,
    status: 'Active',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&h=400&fit=crop',
        alt: 'LG 7kg Front Load Washing Machine'
      }
    ],
    createdAt: '2024-01-14T15:30:00Z',
    updatedAt: '2024-01-14T15:30:00Z'
  },
  {
    _id: 'prod-003',
    name: 'Whirlpool 265L Double Door Refrigerator',
    slug: 'whirlpool-265l-double-door-refrigerator',
    description: 'Spacious 265L double door refrigerator with advanced cooling technology, frost-free operation, and energy efficiency for modern families.',
    category: 'cat-004',
    sku: 'WP-REF-265DD-ARCTIC',
    price: 28999,
    mrp: 34999,
    discountPrice: 28999,
    colour: 'Arctic Steel',
    size: '265 Liters',
    variants: ['235L', '265L', '295L'],
    specification: '265L Capacity, Double Door, Frost Free, 5 Star Energy Rating, Advanced Cooling Technology, Vegetable Crisper',
    stockQuantity: 15,
    stockStatus: 'InStock',
    brand: 'Whirlpool',
    weight: '55 kg',
    dimensions: '60 x 66.5 x 154 cm',
    tags: ['refrigerator', 'double door', 'whirlpool', 'frost free', 'energy efficient', '5 star'],
    warranty: '1 year comprehensive warranty + 10 years compressor warranty',
    returnPolicy: '10 days return policy. Product must be unused and in original packaging.',
    barcode: '8901499631712',
    supplier: {
      name: 'Whirlpool of India Ltd',
      contact: '+91-1800-208-1800',
      email: 'supplier@whirlpool.com'
    },
    hsnCode: '84183000',
    shipping: {
      charges: 'Free delivery',
      deliveryTime: '2-6 business days',
      restrictions: 'Installation charges extra. Old appliance exchange available'
    },
    isActive: true,
    status: 'Active',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=400&fit=crop',
        alt: 'Whirlpool 265L Double Door Refrigerator'
      }
    ],
    createdAt: '2024-01-13T09:20:00Z',
    updatedAt: '2024-01-13T09:20:00Z'
  },
  {
    _id: 'prod-004',
    name: 'IFB 30L Convection Microwave Oven',
    slug: 'ifb-30l-convection-microwave-oven',
    description: 'Versatile 30L convection microwave oven with 71 auto cook menus and express cooking features.',
    category: 'cat-003',
    price: 15999,
    colour: 'Metallic Silver',
    specification: '30L Capacity, Convection, 71 Auto Cook Menus, Express Cooking, Child Safety Lock',
    stockQuantity: 22,
    stockStatus: 'InStock',
    brand: 'IFB',
    isActive: true,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400&h=400&fit=crop',
        alt: 'IFB 30L Convection Microwave Oven'
      }
    ],
    createdAt: '2024-01-12T14:45:00Z',
    updatedAt: '2024-01-15T16:20:00Z'
  },
  {
    _id: 'prod-005',
    name: 'Sony 55" Bravia 4K Android TV',
    slug: 'sony-55-bravia-4k-android-tv',
    description: 'Premium 55-inch Bravia 4K Android TV with Triluminos display and Dolby Atmos sound.',
    category: 'cat-001',
    price: 67999,
    colour: 'Black',
    specification: '55" 4K HDR Display, Android TV, Triluminos, Dolby Atmos, Voice Remote, Google Assistant',
    stockQuantity: 6,
    stockStatus: 'InStock',
    brand: 'Sony',
    isActive: true,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop',
        alt: 'Sony 55 inch Bravia 4K Android TV'
      }
    ],
    createdAt: '2024-01-11T11:15:00Z',
    updatedAt: '2024-01-11T11:15:00Z'
  },
  {
    _id: 'prod-006',
    name: 'Bosch 8kg Front Load Washing Machine',
    slug: 'bosch-8kg-front-load-washing-machine',
    description: 'Premium 8kg front load washing machine with EcoSilence Drive and ActiveWater Plus technology.',
    category: 'cat-005',
    price: 54999,
    colour: 'White',
    specification: '8kg Capacity, Front Load, EcoSilence Drive, ActiveWater Plus, 1400 RPM, German Engineering',
    stockQuantity: 5,
    stockStatus: 'InStock',
    brand: 'Bosch',
    isActive: true,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&h=400&fit=crop',
        alt: 'Bosch 8kg Front Load Washing Machine'
      }
    ],
    createdAt: '2024-01-10T13:30:00Z',
    updatedAt: '2024-01-10T13:30:00Z'
  },
  {
    _id: 'prod-007',
    name: 'Haier 345L Triple Door Refrigerator',
    slug: 'haier-345l-triple-door-refrigerator',
    description: 'Spacious 345L triple door refrigerator with convertible freezer and advanced cooling technology.',
    category: 'cat-004',
    price: 38999,
    colour: 'Brushed Silver',
    specification: '345L Capacity, Triple Door, Convertible Freezer, Frost Free, 3 Star Energy Rating',
    stockQuantity: 9,
    stockStatus: 'InStock',
    brand: 'Haier',
    isActive: true,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=400&fit=crop',
        alt: 'Haier 345L Triple Door Refrigerator'
      }
    ],
    createdAt: '2024-01-09T16:00:00Z',
    updatedAt: '2024-01-09T16:00:00Z'
  },
  {
    _id: 'prod-008',
    name: 'Panasonic 27L Convection Microwave',
    slug: 'panasonic-27l-convection-microwave',
    description: 'Compact 27L convection microwave with 51 auto cook menus and keep warm function.',
    category: 'cat-003',
    price: 13499,
    colour: 'Black',
    specification: '27L Capacity, Convection, 51 Auto Cook Menus, Keep Warm Function, Magic Grill',
    stockQuantity: 18,
    stockStatus: 'InStock',
    brand: 'Panasonic',
    isActive: true,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400&h=400&fit=crop',
        alt: 'Panasonic 27L Convection Microwave'
      }
    ],
    createdAt: '2024-01-08T12:45:00Z',
    updatedAt: '2024-01-08T12:45:00Z'
  },
  {
    _id: 'prod-009',
    name: 'MI 43" 4K Ultra HD Smart TV',
    slug: 'mi-43-4k-ultra-hd-smart-tv',
    description: 'Affordable 43-inch 4K Ultra HD Smart TV with PatchWall and built-in Chromecast.',
    category: 'cat-001',
    price: 32999,
    colour: 'Black',
    specification: '43" 4K Ultra HD, Smart TV, PatchWall, Built-in Chromecast, Dolby Audio, Voice Remote',
    stockQuantity: 25,
    stockStatus: 'InStock',
    brand: 'MI',
    isActive: true,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop',
        alt: 'MI 43 inch 4K Ultra HD Smart TV'
      }
    ],
    createdAt: '2024-01-07T10:30:00Z',
    updatedAt: '2024-01-07T10:30:00Z'
  },
  {
    _id: 'prod-010',
    name: 'Godrej 190L Single Door Refrigerator',
    slug: 'godrej-190l-single-door-refrigerator',
    description: 'Compact and efficient 190L single door refrigerator perfect for small families.',
    category: 'cat-004',
    price: 16999,
    colour: 'Wine Red',
    specification: '190L Capacity, Single Door, Direct Cool, 3 Star Energy Rating, Vegetable Crisper',
    stockQuantity: 30,
    stockStatus: 'InStock',
    brand: 'Godrej',
    isActive: true,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=400&fit=crop',
        alt: 'Godrej 190L Single Door Refrigerator'
      }
    ],
    createdAt: '2024-01-06T14:20:00Z',
    updatedAt: '2024-01-06T14:20:00Z'
  }
];

export default {
  mockServiceRequests,
  mockBlogs,
  mockBlogCategories,
  mockUsers,
  mockCategories,
  mockProducts
};
