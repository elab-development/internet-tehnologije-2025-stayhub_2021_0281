import { z } from "zod";

const isoDateTime = z
  .string()
  .datetime("Datum mora biti u ISO datetime formatu, npr. 2026-01-03T10:00:00.000Z.");

export const createReservationSchema = z
  .object({
    propertyId: z.number().int().positive("propertyId mora biti pozitivan ceo broj."),
    startDate: isoDateTime,
    endDate: isoDateTime,
  })
  .refine(
    (data) => new Date(data.startDate).getTime() < new Date(data.endDate).getTime(),
    {
      message: "Početni datum mora biti pre krajnjeg datuma.",
      path: ["endDate"],
    }
  );

export const reservationIdParamSchema = z.object({
  id: z.coerce.number().int().positive("Nevalidan id."),
});

// Seller može da menja status (prema zahtevima).
export const updateReservationStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"], {
    message: "Status nije validan.",
  }),
});
