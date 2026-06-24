import type { Rel } from "@mikro-orm/core";

import {
  Entity,
  PrimaryKey,
  Property as MikroProperty,
  ManyToOne,
} from "@mikro-orm/decorators/legacy";

import { Property } from "./Property";

@Entity({ tableName: "property_images" })
export class PropertyImage {
  @PrimaryKey({ type: "number" })
  id!: number;

  @MikroProperty({
    type: "string",
    fieldName: "image_url",
  })
  imageUrl!: string;

  @ManyToOne({
    entity: () => Property,
    fieldName: "property_id",
    deleteRule: "cascade",
  })
  property!: Rel<Property>;
}