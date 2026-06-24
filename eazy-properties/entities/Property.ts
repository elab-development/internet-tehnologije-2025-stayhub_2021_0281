import { Collection } from "@mikro-orm/core";
import type { Rel } from "@mikro-orm/core";

import {
  Entity,
  PrimaryKey,
  Property as MikroProperty,
  ManyToOne,
  OneToMany,
} from "@mikro-orm/decorators/legacy";

import { User } from "./User";
import { PropertyImage } from "./PropertyImage";
import { Reservation } from "./Reservation";
import { Review } from "./Review";

@Entity({ tableName: "properties" })
export class Property {
  @PrimaryKey({ type: "number" })
  id!: number;

  @MikroProperty({ type: "string" })
  title!: string;

  @MikroProperty({ type: "text" })
  description!: string;

  @MikroProperty({ type: "string" })
  city!: string;

  @MikroProperty({ type: "string" })
  address!: string;

  @MikroProperty({ type: "number" })
  price!: number;

  @MikroProperty({
    type: "string",
    fieldName: "image_url",
  })
  imageUrl!: string;

  @MikroProperty({
    type: "string",
    fieldName: "panorama_url",
    nullable: true,
  })
  panoramaUrl?: string;

  @MikroProperty({
    type: "string",
    fieldName: "model3d_url",
    nullable: true,
  })
  model3dUrl?: string;

  @MikroProperty({
    type: "Date",
    fieldName: "created_at",
  })
  createdAt: Date = new Date();

  @ManyToOne({
    entity: () => User,
    fieldName: "agent_id",
  })
  agent!: Rel<User>;

  @OneToMany({
    entity: () => PropertyImage,
    mappedBy: "property",
  })
  images = new Collection<PropertyImage>(this);

  @OneToMany({
    entity: () => Reservation,
    mappedBy: "property",
  })
  reservations = new Collection<Reservation>(this);

  @OneToMany({
    entity: () => Review,
    mappedBy: "property",
  })
  reviews = new Collection<Review>(this);
}