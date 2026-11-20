export const categorySeed = [
  { id: "ready-to-wear", name: "Ready to Wear", image: "/img/rose.jpg" },
  { id: "unstitched", name: "Unstitched", image: "/img/sage.jpg" },
  { id: "formal-wear", name: "Formal & Festive", image: "/img/burgundy.jpg" },
  { id: "modest-wear", name: "Modest Wear", image: "/img/lilac.jpg" },
  {
    id: "accessories",
    name: "Accessories",
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=500&q=85",
  },
  {
    id: "bags",
    name: "Bags & More",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&q=85",
  },
];
export const productSeed = [
  {
    id: "noor-rose",
    name: "Noor — Embroidered Lawn",
    categoryId: "ready-to-wear",
    price: 425000,
    comparePrice: 520000,
    images: ["/img/rose.jpg"],
    badge: "THE ROSEVARA EDIT",
    featured: true,
  },
  {
    id: "sage-bloom",
    name: "Sage Bloom — 3 Piece Suit",
    categoryId: "unstitched",
    price: 365000,
    comparePrice: 440000,
    images: ["/img/sage.jpg"],
    badge: "NEW ARRIVAL",
    featured: true,
  },
  {
    id: "meher-chiffon",
    name: "Meher — Festive Chiffon",
    categoryId: "formal-wear",
    price: 785000,
    comparePrice: 890000,
    images: ["/img/burgundy.jpg"],
    badge: "OCCASION EDIT",
    featured: true,
  },
  {
    id: "ivory-grace",
    name: "Ivory Grace — Cotton Kurta",
    categoryId: "ready-to-wear",
    price: 285000,
    comparePrice: null,
    images: ["/img/ivory.jpg"],
    badge: "EVERYDAY ELEGANCE",
    featured: true,
  },
  {
    id: "lilac-muse",
    name: "Lilac Muse — Modest Set",
    categoryId: "modest-wear",
    price: 495000,
    comparePrice: 580000,
    images: ["/img/lilac.jpg"],
    badge: "NEW ARRIVAL",
    featured: false,
  },
  {
    id: "midnight-gold",
    name: "Midnight — Embroidered Formal",
    categoryId: "formal-wear",
    price: 865000,
    comparePrice: null,
    images: ["/img/navy.jpg"],
    badge: "OCCASION EDIT",
    featured: false,
  },
  {
    id: "pearl-story",
    name: "The Pearl Story — Gold Earrings",
    categoryId: "accessories",
    price: 145000,
    comparePrice: 180000,
    images: [
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=700&q=85",
    ],
    badge: "FINISHING TOUCHES",
    featured: false,
  },
  {
    id: "everyday-tote",
    name: "The Everyday — Classic Tote",
    categoryId: "bags",
    price: 325000,
    comparePrice: null,
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=700&q=85",
    ],
    badge: "THE ROSEVARA EDIT",
    featured: false,
  },
].map((p) => ({
  ...p,
  stock: 0,
  status: "approved",
  sellerId: null,
  sizes: ["S", "M", "L", "XL"],
  description:
    "Thoughtfully chosen for your everyday and everything after. Discover delicate details, an effortless silhouette, and a beautifully considered finish. This is a preview of the Rosevara launch collection; stock and final product details are confirmed before availability.",
}));
export const money = (amount: number) =>
  `Rs. ${new Intl.NumberFormat("en-PK", { minimumFractionDigits: Math.abs(amount) % 100 === 0 ? 0 : 2, maximumFractionDigits: 2 }).format(amount / 100)}`;
export const imageUrl = (src: string, w = 700) =>
  `/.netlify/images?url=${encodeURIComponent(src)}&w=${w}&fm=webp&q=85`;
export const statuses = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Returned",
];
