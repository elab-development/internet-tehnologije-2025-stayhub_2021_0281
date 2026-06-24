import "reflect-metadata";
import "dotenv/config";

import { defineConfig } from "@mikro-orm/postgresql";
import { Migrator } from "@mikro-orm/migrations";
import { SeedManager } from "@mikro-orm/seeder";

import { User } from "./entities/User";
import { Property } from "./entities/Property";
import { PropertyImage } from "./entities/PropertyImage";
import { Reservation } from "./entities/Reservation";
import { Review } from "./entities/Review";

export default defineConfig({
  clientUrl: process.env.DATABASE_URL,

  entities: [User, Property, PropertyImage, Reservation, Review],

  extensions: [Migrator, SeedManager],

  debug: process.env.NODE_ENV !== "production",

  migrations: {
    path: "./migrations",
    pathTs: "./migrations",
  },

  seeder: {
    path: "./seeders",
    pathTs: "./seeders",
    defaultSeeder: "DatabaseSeeder",
  },
});