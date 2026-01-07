import type { FeaturedItem } from "@/types/featuredItem";

export type PropertiesListResponse = {
  page: number;
  pageSize: number;
  total: number;
  items: FeaturedItem[];
};