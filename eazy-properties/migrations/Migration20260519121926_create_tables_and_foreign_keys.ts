import { Migration } from "@mikro-orm/migrations";

export class Migration20260519120000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      create type "user_role" as enum ('ADMIN', 'AGENT', 'CLIENT');
    `);

    this.addSql(`
      create type "reservation_status" as enum ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
    `);

    this.addSql(`
      create table "users" (
        "id" serial primary key,
        "name" varchar(255) not null,
        "email" varchar(255) not null,
        "password" varchar(255) not null,
        "role" "user_role" not null,
        "created_at" timestamptz not null
      );
    `);

    this.addSql(`
      create table "properties" (
        "id" serial primary key,
        "title" varchar(255) not null,
        "description" text not null,
        "city" varchar(255) not null,
        "address" varchar(255) not null,
        "price" int not null,
        "image_url" varchar(255) not null,
        "panorama_url" varchar(255) null,
        "model3d_url" varchar(255) null,
        "created_at" timestamptz not null,
        "agent_id" int not null
      );
    `);

    this.addSql(`
      create table "property_images" (
        "id" serial primary key,
        "image_url" varchar(255) not null,
        "property_id" int not null
      );
    `);

    this.addSql(`
      create table "reservations" (
        "id" serial primary key,
        "start_date" timestamptz not null,
        "end_date" timestamptz not null,
        "status" "reservation_status" not null,
        "created_at" timestamptz not null,
        "client_id" int not null,
        "property_id" int not null
      );
    `);

    this.addSql(`
      create table "reviews" (
        "id" serial primary key,
        "rating" int not null,
        "comment" text not null,
        "created_at" timestamptz not null,
        "client_id" int not null,
        "property_id" int not null
      );
    `);

    this.addSql(`
      alter table "properties"
      add constraint "properties_agent_id_foreign"
      foreign key ("agent_id")
      references "users" ("id")
      on update cascade
      on delete restrict;
    `);

    this.addSql(`
      alter table "property_images"
      add constraint "property_images_property_id_foreign"
      foreign key ("property_id")
      references "properties" ("id")
      on update cascade
      on delete cascade;
    `);

    this.addSql(`
      alter table "reservations"
      add constraint "reservations_client_id_foreign"
      foreign key ("client_id")
      references "users" ("id")
      on update cascade
      on delete cascade;
    `);

    this.addSql(`
      alter table "reservations"
      add constraint "reservations_property_id_foreign"
      foreign key ("property_id")
      references "properties" ("id")
      on update cascade
      on delete cascade;
    `);

    this.addSql(`
      alter table "reviews"
      add constraint "reviews_client_id_foreign"
      foreign key ("client_id")
      references "users" ("id")
      on update cascade
      on delete cascade;
    `);

    this.addSql(`
      alter table "reviews"
      add constraint "reviews_property_id_foreign"
      foreign key ("property_id")
      references "properties" ("id")
      on update cascade
      on delete cascade;
    `);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "reviews" cascade;`);
    this.addSql(`drop table if exists "reservations" cascade;`);
    this.addSql(`drop table if exists "property_images" cascade;`);
    this.addSql(`drop table if exists "properties" cascade;`);
    this.addSql(`drop table if exists "users" cascade;`);

    this.addSql(`drop type if exists "reservation_status";`);
    this.addSql(`drop type if exists "user_role";`);
  }
}