# EazyProperties

**EazyProperties** je fullstack Next.js aplikacija za oglašavanje i iznajmljivanje nekretnina, sa jasno razdvojenim ulogama, ORM slojem nad PostgreSQL bazom i dva eksterna servisa (mesta u blizini i ugljenični intenzitet mreže).

Projekat je organizovan tako da su frontend i backend deo istog Next.js projekta (App Router), a pristup stranicama i rutama je uređen kroz proxy sloj i proveru uloge.

---

## Uloge korisnika i mogućnosti

Sistem razlikuje tri uloge, a navigacija i dozvoljene akcije zavise od trenutno prijavljenog korisnika.

### Admin

- Pregleda sve korisnike sistema
- Kreira nove korisnike
- Menja postojeće korisnike
- Briše korisnike
- Otvara analitički dashboard sa Chart.js grafikonima

### Agent

- Objavljuje nove nekretnine
- Menja i briše sopstvene nekretnine
- Dodaje i uklanja dodatne slike u galeriji
- Prati rezervacije za svoje nekretnine

### Client

- Pregleda ponudu i detalje nekretnine (galerija, 360° panorama, 3D model)
- Kreira, menja i otkazuje sopstvene rezervacije
- Ostavlja, menja i briše sopstvene recenzije

---

## Tehnologije

Arhitektura aplikacije i tehnološki stek — od klijentskog sloja, preko proxy zaštite i API ruta, do MikroORM-a, PostgreSQL baze i eksternih servisa — prikazani su na sledećem dijagramu:

![Arhitektura aplikacije EazyProperties](./architecture.png)

---

## Struktura projekta

```text
app/
  api/
    auth/
    users/
    properties/
    reservations/
    reviews/
    property-images/
    admin/
    external/
  admin/
  agent/
  client/
  auth/
  home/
  properties/

components/
  AppButton.tsx
  AppInput.tsx
  AppModal.tsx
  Navigation.tsx
  PropertyCard.tsx

entities/
  User.ts
  Property.ts
  PropertyImage.ts
  Reservation.ts
  Review.ts

helpers/
  auth.ts
  mikroOrm.ts
  externalApi.ts

migrations/
  Migration...create_tables_and_foreign_keys.ts
  Migration...add_default_constraints.ts
  Migration...add_unique_constraints.ts

seeders/
  DatabaseSeeder.ts

public/
  documents/
    openapi.yaml
    swagger.html

Dockerfile
docker-compose.yml
mikro-orm.config.ts
```

---

## Pokretanje lokalno (bez Docker-a)

### Preduslovi

Pre pokretanja je potrebno imati instaliran Node.js (verzija 20 ili novija) i pokrenut PostgreSQL server sa praznom bazom pod nazivom `eazy_properties`. Ako ne želiš da instaliraš PostgreSQL lokalno, dovoljno je podići samo bazu iz Docker-a komandom `docker compose up -d db`.

### Konfiguracija okruženja

U korenu projekta se kreira `.env` fajl sa konekcijom ka bazi, tajnim ključem za JWT i ključevima eksternih servisa:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/eazy_properties"
JWT_SECRET="eazy_properties_secret_key"
GEOAPIFY_API_KEY="your_geoapify_api_key_here"
ELECTRICITY_MAPS_API_KEY="your_electricity_maps_api_key_here"
ELECTRICITY_MAPS_DEFAULT_ZONE="RS"
```

### Instalacija i priprema baze

Zavisnosti se instaliraju jednom, a šema i početni podaci se dobijaju kroz jednu MikroORM skriptu koja objedinjuje migracije i seed:

```bash
npm install
npm run mikro:migration:fresh
```

Ova skripta iznova kreira tabele i ubacuje tri test naloga (lozinka za sve je `password123`):

```text
Admin    marta@example.com
Agent    stefan@example.com
Client   aleksa@example.com
```

### Pokretanje razvojnog servera

```bash
npm run dev
```

Aplikacija se otvara na `http://localhost:3000`. Ako Turbopack keš napravi problem, keširanje se čisti sa `npm run clean` (ili `npm run dev:clean` za čisto pokretanje).

---

## Pokretanje kroz Docker

Docker Compose podiže kompletno okruženje odjednom — Next.js aplikaciju i PostgreSQL bazu — i pri startu automatski izvršava MikroORM migracije i seed.

### 1. Podešavanje `.env.docker` fajla

U root folderu kreirati `.env.docker` fajl.

Primer:

```env
DATABASE_URL="postgresql://postgres:postgres@db:5432/eazy_properties"
JWT_SECRET="eazy_properties_docker_secret_key"
GEOAPIFY_API_KEY="your_geoapify_api_key_here"
ELECTRICITY_MAPS_API_KEY="your_electricity_maps_api_key_here"
ELECTRICITY_MAPS_DEFAULT_ZONE="RS"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Važno: u Docker okruženju se za bazu koristi host `db`, a ne `localhost`.

### 2. Pokretanje Docker containera

```bash
docker compose up --build
```

Aplikacija će biti dostupna na `http://localhost:3000`.

### 3. Zaustavljanje i brisanje

```bash
docker compose down       # zaustavlja kontejnere
docker compose down -v    # zaustavlja i briše podatke iz baze
```

---

## Pregled baze

MikroORM nema poseban studio kao Prisma. Za pregled PostgreSQL baze mogu se koristiti pgAdmin, DBeaver, TablePlus ili DataGrip.

Podaci za lokalnu konekciju su najčešće:

```text
Host: localhost
Port: 5432
Database: eazy_properties
Username: postgres
Password: postgres
```

Ako se alat povezuje na bazu iz Docker containera, host baze je `db`.

---

## API dokumentacija

Swagger/OpenAPI dokumentacija se nalazi u folderu `public/documents/` i može se otvoriti na adresi `http://localhost:3000/documents/swagger.html`. Izvorni OpenAPI opis je u `public/documents/openapi.yaml`.

---

## Eksterni API servisi

Aplikacija koristi dva eksterna servisa, oba pozvana sa serverske strane (ključevi se ne izlažu u pregledaču).

### Geoapify Places API

Prikazuje mesta u blizini nekretnine (restorani, kafići, supermarketi, bolnice, parkovi, javni prevoz) na stranici detalja nekretnine.

### Electricity Maps API

Prikazuje ugljenični intenzitet (carbon intensity) električne mreže za zonu koja odgovara gradu nekretnine.

```text
Current grid intensity: 320 gCO₂e/kWh
Zone: RS
```

---

## Važne rute

### Auth rute

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### User rute

```text
GET    /api/users
POST   /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
```

### Property rute

```text
GET    /api/properties
POST   /api/properties
GET    /api/properties/:id
PUT    /api/properties/:id
DELETE /api/properties/:id
```

### Property Image rute

```text
GET    /api/property-images
POST   /api/property-images
GET    /api/property-images/:id
PUT    /api/property-images/:id
DELETE /api/property-images/:id
```

### Reservation rute

```text
GET    /api/reservations
POST   /api/reservations
GET    /api/reservations/:id
PUT    /api/reservations/:id
DELETE /api/reservations/:id
```

### Review rute

```text
GET    /api/reviews
POST   /api/reviews
GET    /api/reviews/:id
PUT    /api/reviews/:id
DELETE /api/reviews/:id
```

### External i analytics rute

```text
GET /api/external/nearby-places
GET /api/external/electricity-carbon
GET /api/admin/analytics
```

---

## Baza podataka

Aplikacija koristi PostgreSQL i MikroORM. Domen čini pet povezanih entiteta — User, Property, PropertyImage, Reservation i Review — sa sledećim relacijama:

```text
User 1:N Property        (agent objavljuje nekretnine)
User 1:N Reservation     (klijent rezerviše)
User 1:N Review          (klijent ocenjuje)
Property 1:N PropertyImage
Property 1:N Reservation
Property 1:N Review
```

---

## Migracije

Struktura baze se uvodi kroz tri migracije, svaka sa jasnom namenom:

### 1. Kreiranje tabela i spoljnih ključeva

Kreira tabele `users`, `properties`, `property_images`, `reservations`, `reviews` i strane ključeve između njih (npr. `properties.agent_id -> users.id`, `reservations.property_id -> properties.id`).

### 2. Podrazumevane vrednosti

Dodaje default vrednosti: `users.role = CLIENT`, `properties.price = 0`, `reservations.status = PENDING`, `created_at = now()`.

### 3. Jedinstvena ograničenja

Uvodi unique pravila: jedinstven `users.email`, jedinstvena kombinacija klijent + nekretnina + datumi za rezervaciju i klijent + nekretnina za recenziju.

---

## MikroORM

MikroORM je korišćen kao ORM alat nad PostgreSQL bazom. Modeli su definisani kao TypeScript entity klase sa dekoratorima, a rad sa bazom ide preko EntityManager-a — bez ručnog pisanja SQL upita u API rutama. Za razliku od Prisma ORM-a, gde se šema piše u posebnom `schema.prisma` fajlu, MikroORM koristi upravo entity klase kao izvor istine, uz podršku za migracije i seedere.

---

## Napomena

Kod koristi engleske nazive promenljivih i funkcija, dok su komentari u kodu pisani na srpskom jeziku.
