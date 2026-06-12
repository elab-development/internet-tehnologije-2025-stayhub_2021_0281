import { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";
import bcrypt from "bcryptjs";

import { User, UserRole } from "../entities/User";
import { Property } from "../entities/Property";
import { PropertyImage } from "../entities/PropertyImage";
import { Reservation, ReservationStatus } from "../entities/Reservation";
import { Review } from "../entities/Review";

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // Pravimo hash lozinke jer login koristi bcrypt.compare().
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Kreiramo admin korisnika.
    const marta = em.create(User, {
      name: "Marta Mladenović",
      email: "marta@example.com",
      password: hashedPassword,
      role: UserRole.ADMIN,
      createdAt: new Date(),
    });

    // Kreiramo agenta.
    const stefan = em.create(User, {
      name: "Stefan Kostić",
      email: "stefan@example.com",
      password: hashedPassword,
      role: UserRole.AGENT,
      createdAt: new Date(),
    });

    // Kreiramo klijenta.
    const aleksa = em.create(User, {
      name: "Aleksa Obradović",
      email: "aleksa@example.com",
      password: hashedPassword,
      role: UserRole.CLIENT,
      createdAt: new Date(),
    });

    // Kreiramo prvu nekretninu.
    const belgradeApartment = em.create(Property, {
      title: "Modern Apartment in Belgrade",
      description: "Simple and bright apartment close to the city center.",
      city: "Belgrade",
      address: "Knez Mihailova 10",
      price: 80,
      imageUrl: "/home-images/homecard1.jpg",
      panoramaUrl: "https://pannellum.org/images/alma.jpg",
      model3dUrl:
        "https://sketchfab.com/models/7575f718657545edacee98f84e41c6a0/embed",
      createdAt: new Date(),
      agent: stefan,
    });

    // Kreiramo drugu nekretninu.
    const dubaiVilla = em.create(Property, {
      title: "Luxury Villa in Dubai",
      description: "Large villa with pool, modern rooms and beautiful view.",
      city: "Dubai",
      address: "Palm Jumeirah 25",
      price: 250,
      imageUrl: "/home-images/homecard2.jpg",
      panoramaUrl: "https://pannellum.org/images/tocopilla.jpg",
      model3dUrl:
        "https://sketchfab.com/3d-models/modern-villa-2021-blender-eevee-and-cycles-3-08e0bcb1f556419f8f386d2e15b115c1/embed",
      createdAt: new Date(),
      agent: stefan,
    });

    // Dodajemo dodatne slike za prvu nekretninu.
    em.create(PropertyImage, {
      imageUrl: "/cities/Belgrade.jpg",
      property: belgradeApartment,
    });

    em.create(PropertyImage, {
      imageUrl: "/cities/London.jpg",
      property: belgradeApartment,
    });

    // Dodajemo dodatne slike za drugu nekretninu.
    em.create(PropertyImage, {
      imageUrl: "/cities/Dubai.jpg",
      property: dubaiVilla,
    });

    em.create(PropertyImage, {
      imageUrl: "/cities/Tokyo.jpg",
      property: dubaiVilla,
    });

    // Kreiramo prvu rezervaciju.
    em.create(Reservation, {
      startDate: new Date("2026-06-10"),
      endDate: new Date("2026-06-15"),
      status: ReservationStatus.PENDING,
      createdAt: new Date(),
      client: aleksa,
      property: belgradeApartment,
    });

    // Kreiramo drugu rezervaciju.
    em.create(Reservation, {
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-07"),
      status: ReservationStatus.APPROVED,
      createdAt: new Date(),
      client: aleksa,
      property: dubaiVilla,
    });

    // Kreiramo prvu recenziju.
    em.create(Review, {
      rating: 5,
      comment: "Great apartment, very clean and comfortable.",
      createdAt: new Date(),
      client: aleksa,
      property: belgradeApartment,
    });

    // Kreiramo drugu recenziju.
    em.create(Review, {
      rating: 4,
      comment: "Beautiful villa with a lot of space.",
      createdAt: new Date(),
      client: aleksa,
      property: dubaiVilla,
    });

    // Čuvamo sve promene u bazu.
    await em.flush();
  }
}