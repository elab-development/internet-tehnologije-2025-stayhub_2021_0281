import type { Rel } from "@mikro-orm/core";

import {
  Entity,
  PrimaryKey,
  Property as MikroProperty,
  ManyToOne,
} from "@mikro-orm/decorators/legacy";

import { User } from "./User";
import { Property } from "./Property";

@Entity({ tableName: "reviews" })
export class Review {
  @PrimaryKey({ type: "number" })
  id!: number;

  @MikroProperty({
    type: "number",
  })
  rating!: number;

  @MikroProperty({
    type: "text",
  })
  comment!: string;

  @MikroProperty({
    type: "Date",
    fieldName: "created_at",
  })
  createdAt: Date = new Date();

  @ManyToOne({
    entity: () => User,
    fieldName: "client_id",
  })
  client!: Rel<User>;

  @ManyToOne({
    entity: () => Property,
    fieldName: "property_id",
    deleteRule: "cascade",
  })
  property!: Rel<Property>;
}