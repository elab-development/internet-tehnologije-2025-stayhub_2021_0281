import type { FeaturedItem } from "@/client/types/featuredItem";

export type PropertiesListResponse = {
  page: number;
  pageSize: number;
  total: number;
  items: FeaturedItem[];
};