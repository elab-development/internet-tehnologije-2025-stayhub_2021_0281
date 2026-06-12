import type { Rel } from "@mikro-orm/core";

import {
  Entity,
  PrimaryKey,
  Property as MikroProperty,
  ManyToOne,
  Enum,
} from "@mikro-orm/decorators/legacy";

import { User } from "./User";
import { Property } from "./Property";

export enum ReservationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

@Entity({ tableName: "reservations" })
export class Reservation {
  @PrimaryKey({ type: "number" })
  id!: number;

  @MikroProperty({
    type: "Date",
    fieldName: "start_date",
  })
  startDate!: Date;

  @MikroProperty({
    type: "Date",
    fieldName: "end_date",
  })
  endDate!: Date;

  @Enum({
    items: () => ReservationStatus,
  })
  status: ReservationStatus = ReservationStatus.PENDING;

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