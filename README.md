# StayHub — opis aplikacije i tehnologije.

StayHub je full-stack veb aplikacija za izdavanje i rezervaciju nekretnina. Sistem je organizovan po ulogama (role-based UI i API dozvole) i omogućava pregled nekretnina, detalje sa mapom i 360° prikazom, kreiranje i upravljanje rezervacijama, kao i administrativne izveštaje i metrike.

![StayHub Logo](./stayhub/public/StayHub%20logo%20-%20big.png)

> Struktura repozitorijuma (jedan Next.js projekat).
> - `app/` — Next.js App Router (stranice + API rute).
> - `src/` — klijentski i serverski kod (servisi, validatori, tipovi, UI komponente).
> - `src/server/` — auth, db (Prisma), http response helperi, servisi, validatori.
> - `src/client/` — UI komponente, tipovi, layout.
> - `prisma/` — Prisma šema, migracije i seed.
> - `public/` — statički fajlovi (logo, slike, slider, favicon, Swagger UI ako postoji).

---

## Ciljna grupa i uloge korisnika.

Aplikacija podržava sledeće uloge:

- **Administrator (ADMIN)**: administracija sistema, pregled metrika i izveštaja, uvid u prodavce i rezervacije.
- **Seller (SELLER)**: kreira i upravlja svojim nekretninama, prati i menja statuse rezervacija nad svojim listing-om.
- **Buyer (BUYER)**: pregled nekretnina, detalji i map prikaz, kreira rezervacije i upravlja sopstvenim rezervacijama.

---

## Ključne funkcionalnosti.

### Nekretnine (Properties).
- Listanje i pretraga nekretnina.
- Pregled detalja nekretnine (slika, opis, cena, broj soba, kategorija, lokacija).
- Prikaz lokacije na mapi (OpenStreetMap) sa markerom i pop-up informacijama.
- 360° prikaz (Pannellum embed) kao dodatni vizuelni prikaz.

### Rezervacije (Reservations).
- **Buyer**: kreiranje rezervacije za izabranu nekretninu sa datumima (start/end).
- **Buyer**: pregled “My reservations” i otkazivanje rezervacije (pre početka).
- **Seller**: pregled rezervacija vezanih za svoje nekretnine i promene statusa rezervacije.

### Kategorije (Categories).
- Pregled dostupnih kategorija.
- Kategorije se koriste za filtriranje i prikaz u listing-u.

### Administracija (Admin).
- Pregled metrika i administrativnih pregleda (npr. prodavci, izveštaji rezervacija).
- Administrativni endpoint-i su zaštićeni ulogom.

---

## Tehnologije koje se koriste.

### Frontend + Backend.
- **Next.js (App Router)** — full-stack pristup (UI + API rute u istom projektu).
- **React** — Client Components za interaktivne ekrane.
- **TypeScript** — tipovi za UI i API komunikaciju.

### Baza podataka.
- **PostgreSQL** — relacijska baza.
- **Prisma ORM** — šema, migracije, seed, Prisma Client.

### Autentifikacija i autorizacija.
- Cookie/session bazirana autentifikacija (server-side auth helperi).
- Role-based autorizacija (requireRole / requireAuth).
- Scope provere (buyer vidi svoje rezervacije, seller svoje nekretnine i rezervacije nad njima, admin globalni pregled).

### Dodatne integracije.
- **OpenStreetMap** — prikaz mape.
- **Nominatim** (OSM geocoding) — dobijanje koordinata iz adrese (ako je implementirano u klijentu).
- **Pannellum** — 360° panorama embed.
- **Swagger UI + OpenAPI** — dokumentacija API-ja (ako je postavljena u `public/swagger/`).

---

## Podešavanje okruženja (.env).

U root-u projekta se nalazi `.env` (ne commit-uje se). Primer promenljivih koje se tipično koriste:

- `DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public`.
- `JWT_SECRET=...` (ako postoji u auth sloju).
- Ostale promenljive po potrebi (npr. cookie/session config).

---

## Pokretanje projekta (lokalno, bez Docker-a).

> Pretpostavke: Node.js 18+ i PostgreSQL lokalno ili preko drugog alata.

### 1) Instalacija zavisnosti.
- `npm install`.

### 2) Migracije + seed.
- `npx prisma migrate dev`.
- `npx prisma db seed` (ako je seed podešen).

### 3) Prisma Studio (pregled baze).
- `npx prisma studio`.

Prisma Studio tipično radi na:
- `http://localhost:5555`.

### 4) Pokretanje Next.js aplikacije.
- `npm run dev`.

Aplikacija:
- `http://localhost:3000`.

---

## Pokretanje projekta uz Docker (dockernizovana verzija).

> Pretpostavke: Docker Desktop instaliran.

### 1) Pokretanje.
U folderu gde je `docker-compose.yaml`:

- `docker compose down -v`.
- `docker compose up --build`.

Aplikacija:
- `http://localhost:3000`.

Baza:
- `localhost:5432` (PostgreSQL).

### 2) Prisma Studio uz Docker.
**Opcija A: Prisma Studio lokalno, baza u Dockeru.**
- Pokreneš `docker compose up`.
- U lokalnom terminalu pokreneš `npx prisma studio` (uz `DATABASE_URL` koji pokazuje na `localhost:5432`).

**Opcija B: Studio kao poseban servis.**
- Postoji `studio` servis koji mapira port `5555:5555`.

---

## Pokretanje Swagger UI (API dokumentacija).

Ako postoje fajlovi:
- `public/swagger/index.html`.
- `public/swagger/openapi.yaml`.

Otvori:
- Swagger UI: `http://localhost:3000/swagger/index.html`.
- OpenAPI: `http://localhost:3000/swagger/openapi.yaml`.

> Ako želiš da `http://localhost:3000/swagger` radi bez `/index.html`, napravi stranicu:
> - `app/swagger/page.tsx` koja radi redirect na `/swagger/index.html`.

---

## API (pregled glavnih ruta).

### Auth.
- `POST /api/auth/register`.
- `POST /api/auth/login`.
- `POST /api/auth/logout`.
- `GET /api/auth/me`.

### Categories.
- `GET /api/categories`.

### Properties.
- `GET /api/properties`.
- `GET /api/properties/{id}`.
- (Seller) `POST /api/properties`.
- (Seller) `PATCH /api/properties/{id}`.
- (Seller) `DELETE /api/properties/{id}`.

### Reservations.
- `POST /api/reservations`.
- (Buyer) `GET /api/reservations/my`.
- (Buyer) `PATCH /api/reservations/{id}/cancel`.
- (Seller) `GET /api/seller/reservations`.
- (Seller) `PATCH /api/seller/reservations/{id}/status`.

### Admin.
- `GET /api/admin/metrics`.
- `GET /api/admin/sellers`.
- `GET /api/admin/reports/reservations`.

---

## Bezbednosne napomene.

- Ne commituje se `.env` fajl.
- Cookie-based auth zahteva da klijent šalje `credentials: "include"` u fetch/axios pozivima.
- Role-based i scope provere su obavezne na serveru (ne oslanjati se samo na UI).

---

## Autori i repozitorijum.

- Repo: https://github.com/elab-development/internet-tehnologije-2025-stayhub_2021_0281.git
