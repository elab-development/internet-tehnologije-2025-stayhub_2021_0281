import { Collection } from "@mikro-orm/core";

import {
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
  Enum,
} from "@mikro-orm/decorators/legacy";

import { Property as PropertyEntity } from "./Property";
import { Reservation } from "./Reservation";
import { Review } from "./Review";

export enum UserRole {
  ADMIN = "ADMIN",
  AGENT = "AGENT",
  CLIENT = "CLIENT",
}

@Entity({ tableName: "users" })
export class User {
  @PrimaryKey({ type: "number" })
  id!: number;

  @Property({ type: "string" })
  name!: string;

  @Property({ type: "string", unique: true })
  email!: string;

  @Property({ type: "string" })
  password!: string;

  @Enum({ items: () => UserRole })
  role: UserRole = UserRole.CLIENT;

  @Property({
    type: "Date",
    fieldName: "created_at",
  })
  createdAt: Date = new Date();

  @OneToMany({
    entity: () => PropertyEntity,
    mappedBy: "agent",
  })
  properties = new Collection<PropertyEntity>(this);

  @OneToMany({
    entity: () => Reservation,
    mappedBy: "client",
  })
  reservations = new Collection<Reservation>(this);

  @OneToMany({
    entity: () => Review,
    mappedBy: "client",
  })
  reviews = new Collection<Review>(this);
}