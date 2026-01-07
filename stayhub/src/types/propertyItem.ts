export type PropertyItem = {
  id: number;
  name: string;
  description: string;
  image: string;
  price: string | number;
  rooms: number;
  location: { city: string; address: string };
  category: { id: number; name: string };
  seller: { id: number; name: string };
};