import { ReservationStatus } from "./reservationStatus";

export type ReservationItem = {
  id: number;
  startDate: string;
  endDate: string;
  totalPrice: string | number;
  status: ReservationStatus;
  property?: {
    id: number;
    name: string;
    location?: { city: string; address: string };
    category?: { name: string };
    seller?: { name: string };
  } | null;
};