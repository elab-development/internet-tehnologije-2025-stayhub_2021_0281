export type AdminMetrics = {
  totalReservations: number;
  reservationsPerSeller: { sellerId: number; sellerName: string; count: number }[];
  revenueByMonth: { month: string; revenue: string }[];
};