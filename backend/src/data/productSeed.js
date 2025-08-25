const products = [
  {
    name: "Elegant Red Lehenga",
    description: "A beautiful red lehenga with intricate embroidery, perfect for weddings and festive occasions.",
    shortDescription: "Red embroidered lehenga",
    price: 1200,
    discountPrice: 1000,
    images: [
      { url: "/images/products/lehenga1-1.jpg", alt: "Red Lehenga Front", isPrimary: true },
      { url: "/images/products/lehenga1-2.jpg", alt: "Red Lehenga Back" }
    ],
    category: "Lehengas",
    subcategory: "Bridal",
    sizes: [
      { size: "S", measurements: { bust: "34", waist: "28", hip: "36", length: "40" }, stockQuantity: 10 },
      { size: "M", measurements: { bust: "36", waist: "30", hip: "38", length: "41" }, stockQuantity: 15 }
    ],
    colors: [
      { color: "Red", colorCode: "#FF0000", images: ["/images/products/lehenga1-1.jpg", "/images/products/lehenga1-2.jpg"] }
    ],
    fabric: "Silk",
    care: "Dry clean only",
    inStock: true,
    sku: "LEH-RED-001",
    weight: 2.5,
    dimensions: { length: 40, width: 30, height: 10 },
    ratings: 4.5,
    numReviews: 12,
    tags: ["wedding", "bridal", "red", "lehenga"],
    sizeChart: "/size-charts/lehenga-size-chart.pdf",
    isActive: true,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    metaTitle: "Elegant Red Lehenga for Weddings",
    metaDescription: "Shop the elegant red lehenga with intricate embroidery, perfect for weddings and festive occasions.",
  },
  {
    name: "Blue Chaniya Choli",
    description: "Traditional blue chaniya choli with mirror work and beautiful patterns.",
    shortDescription: "Blue mirror work chaniya choli",
    price: 900,
    discountPrice: 850,
    images: [
      { url: "/images/products/chaniya1-1.jpg", alt: "Blue Chaniya Choli Front", isPrimary: true },
      { url: "/images/products/chaniya1-2.jpg", alt: "Blue Chaniya Choli Back" }
    ],
    category: "Chaniya Choli",
    subcategory: "Festive Wear",
    sizes: [
      { size: "S", measurements: { bust: "32", waist: "26", hip: "34", length: "38" }, stockQuantity: 8 },
      { size: "M", measurements: { bust: "34", waist: "28", hip: "36", length: "39" }, stockQuantity: 12 }
    ],
    colors: [
      { color: "Blue", colorCode: "#0000FF", images: ["/images/products/chaniya1-1.jpg", "/images/products/chaniya1-2.jpg"] }
    ],
    fabric: "Cotton",
    care: "Hand wash",
    inStock: true,
    sku: "CHL-BLU-001",
    weight: 1.8,
    dimensions: { length: 38, width: 28, height: 8 },
    ratings: 4.2,
    numReviews: 8,
    tags: ["festive", "blue", "chaniya choli"],
    sizeChart: "/size-charts/chaniya-size-chart.pdf",
    isActive: true,
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    metaTitle: "Blue Chaniya Choli with Mirror Work",
    metaDescription: "Traditional blue chaniya choli with mirror work and beautiful patterns.",
  },
  {
    name: "Elegant Saree with Golden Border",
    description: "A stunning saree with a golden border, perfect for formal occasions and celebrations.",
    shortDescription: "Golden border saree",
    price: 1100,
    discountPrice: 1050,
    images: [
      { url: "/images/products/saree1-1.jpg", alt: "Golden Border Saree Front", isPrimary: true },
      { url: "/images/products/saree1-2.jpg", alt: "Golden Border Saree Draped" }
    ],
    category: "Sarees",
    subcategory: "Party Wear",
    sizes: [],
    colors: [
      { color: "Gold", colorCode: "#FFD700", images: ["/images/products/saree1-1.jpg", "/images/products/saree1-2.jpg"] }
    ],
    fabric: "Silk",
    care: "Dry clean only",
    inStock: true,
    sku: "SAR-GOL-001",
    weight: 1.5,
    dimensions: { length: 72, width: 28, height: 0.5 },
    ratings: 4.7,
    numReviews: 20,
    tags: ["saree", "golden", "party wear"],
    sizeChart: "/size-charts/saree-size-chart.pdf",
    isActive: true,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    metaTitle: "Elegant Saree with Golden Border",
    metaDescription: "A stunning saree with a golden border, perfect for formal occasions and celebrations.",
  }
];

module.exports = products;
