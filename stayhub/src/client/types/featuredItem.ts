export type FeaturedItem = {
  id: number;
  name: string;
  image: string;
  price: string | number; // Prisma Decimal često dođe kao string u JSON-u.
  rooms: number;
  location: { city: string; address: string };
  category: { id: number; name: string };
  seller: { id: number; name: string };
};