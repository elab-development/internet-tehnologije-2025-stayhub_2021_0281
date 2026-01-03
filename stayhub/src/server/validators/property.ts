import { z } from "zod";

export const createPropertySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Naziv mora imati najmanje 2 karaktera.")
    .max(120, "Naziv je predugačak."),
  description: z
    .string()
    .trim()
    .min(10, "Opis mora imati najmanje 10 karaktera.")
    .max(2000, "Opis je predugačak."),
  image: z
    .string()
    .trim()
    .min(5, "Slika (URL) je obavezna.")
    .max(500, "Slika (URL) mora imati najviše 500 karaktera.")
    .url("Slika mora biti validan URL."),
  price: z
    .number()
    .positive("Cena mora biti pozitivna.")
    .max(99999999, "Cena je prevelika."),
  rooms: z
    .number()
    .int("Broj soba mora biti ceo broj.")
    .positive("Broj soba mora biti pozitivan.")
    .max(100, "Broj soba je prevelik."),
  address: z
    .string()
    .trim()
    .min(3, "Adresa je obavezna.")
    .max(200, "Adresa je predugačka."),
  city: z
    .string()
    .trim()
    .min(2, "Grad je obavezan.")
    .max(80, "Grad je predugačak."),
  categoryId: z
    .number()
    .int("categoryId mora biti ceo broj.")
    .positive("categoryId mora biti pozitivan."),
});

export const updatePropertySchema = createPropertySchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "Mora se poslati bar jedno polje za izmenu."
  );
