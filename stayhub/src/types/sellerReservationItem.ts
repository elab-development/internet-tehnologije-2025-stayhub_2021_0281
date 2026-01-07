import { ReservationItem } from './reservationItem';
// Seller GET vraća i user-a, a ReservationItem ga nema -> proširimo postojećim tipom.
export type SellerReservationItem = ReservationItem & {
  user?: { id: number; name: string; email: string } | null;
};