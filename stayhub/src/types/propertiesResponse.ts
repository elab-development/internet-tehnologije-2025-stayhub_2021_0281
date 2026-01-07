import { PropertyItem } from './propertyItem';

export type PropertiesResponse = {
  page: number;
  pageSize: number;
  total: number;
  items: PropertyItem[];
};
