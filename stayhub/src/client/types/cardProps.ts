export type CardProps = {
  title: string;
  subtitle?: string;
  imageUrl: string;
  priceText: string;
  metaLeft?: string; // npr. "3 rooms"
  metaRight?: string; // npr. "Belgrade"
  badge?: string; // npr. "Apartment"
  onDetailsClick?: () => void; // za sada noop
};