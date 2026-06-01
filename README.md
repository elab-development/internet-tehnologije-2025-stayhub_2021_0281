<p align="center">
  <img src="./public/logoSizeL.png" alt="EazyProperties Logo" width="300" />
</p>

# EazyProperties

**EazyProperties** je jednostavna fullstack Next.js aplikacija za upravljanje nekretninama.

Aplikacija omogućava različitim tipovima korisnika da koriste različite delove sistema. Projekat je napravljen tako da bude jednostavan za razumevanje, lak za objašnjavanje i pogodan za školski/projektni rad.

---

## Funkcionalnosti aplikacije

Aplikacija podržava tri tipa korisnika:

### Admin

Admin može da:

- Pregleda korisnike.
- Kreira nove korisnike.
- Menja postojeće korisnike.
- Briše korisnike.
- Pregleda analytics dashboard sa grafikonima.

### Agent

Agent može da:

- Pregleda nekretnine.
- Kreira nove nekretnine.
- Menja svoje nekretnine.
- Briše svoje nekretnine.
- Dodaje dodatne slike za nekretnine.
- Briše dodatne slike.
- Pregleda rezervacije za svoje nekretnine.

### Client

Client može da:

- Pregleda nekretnine.
- Vidi detalje nekretnine.
- Napravi rezervaciju.
- Menja svoje rezervacije.
- Briše svoje rezervacije.
- Kreira recenziju.
- Menja svoju recenziju.
- Briše svoju recenziju.

---

## Glavne funkcionalnosti

Aplikacija sadrži:

- Autentifikaciju korisnika.
- Role-based pristup stranicama.
- CRUD operacije.
- Reusable komponente.
- Reusable modal prozor za create i edit forme.
- 360 prikaz nekretnina.
- 3D model prikaz nekretnina.
- Admin analytics dashboard sa Chart.js grafikonima.
- Swagger/OpenAPI dokumentaciju.
- Docker podršku.
- MikroORM i PostgreSQL bazu.
- Eksterne API integracije.

---

## Tehnologije

Projekat koristi:

- Next.js.
- React.
- TypeScript.
- MikroORM.
- PostgreSQL.
- Chart.js.
- Docker.
- Swagger UI.
- Geoapify API.
- Electricity Maps API.

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
  logoSizeL.png
  logoSizeS.png
  home-images/
  cities/
  about-us/
  animations/
  documents/
    openapi.yaml
    swagger.html

Dockerfile
docker-compose.yml
mikro-orm.config.ts
```

---

## Pokretanje aplikacije lokalno

### 1. Kloniranje projekta

```bash
git clone <repository-url>
cd eazy-properties
```

### 2. Instalacija paketa

```bash
npm install
```

### 3. Podešavanje `.env` fajla

U root folderu kreirati `.env` fajl.

Primer:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/eazy_properties"

JWT_SECRET="eazy_properties_secret_key"

GEOAPIFY_API_KEY="your_geoapify_api_key_here"

ELECTRICITY_MAPS_API_KEY="your_electricity_maps_api_key_here"
ELECTRICITY_MAPS_DEFAULT_ZONE="RS"
```

### 4. Pokretanje PostgreSQL baze

Potrebno je da PostgreSQL baza bude pokrenuta lokalno.

Ako koristiš lokalni PostgreSQL, baza treba da se zove:

```text
eazy_properties
```

Ako koristiš Docker samo za bazu, možeš pokrenuti:

```bash
docker compose up -d db
```

### 5. MikroORM migracije

Pokrenuti migracije:

```bash
npx mikro-orm migration:up
```

Ili preko npm skripte, ako je dodata u `package.json`:

```bash
npm run mikro:migration:up
```

### 6. Seed podaci

Pokrenuti seed:

```bash
npx mikro-orm seeder:run
```

Ili preko npm skripte:

```bash
npm run mikro:seed
```

Seed kreira tri test korisnika:

```text
Admin:
marta@example.com
password123

Agent:
stefan@example.com
password123

Client:
aleksa@example.com
password123
```

### 7. Reset baze, migracije i seed zajedno

Ako želiš čist početak baze:

```bash
npx mikro-orm migration:fresh --drop-db --seed
```

Ili ako koristiš npm skriptu:

```bash
npm run mikro:migration:fresh -- --drop-db
```

### 8. Pokretanje aplikacije

```bash
npm run dev
```

Aplikacija će biti dostupna na:

```text
http://localhost:3000
```

---

## Pokretanje aplikacije kroz Docker

Aplikacija može da se pokrene i pomoću Dockera.

Docker pokreće:

- Next.js aplikaciju.
- PostgreSQL bazu.
- MikroORM migracije.
- Seed podatke.

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

Aplikacija će biti dostupna na:

```text
http://localhost:3000
```

### 3. Zaustavljanje containera

```bash
docker compose down
```

### 4. Brisanje containera i baze

Ako želiš da obrišeš i podatke iz baze:

```bash
docker compose down -v
```

Nakon toga možeš ponovo pokrenuti:

```bash
docker compose up --build
```

---

## Pregled baze

MikroORM nema svoj poseban studio kao Prisma Studio.

Za pregled PostgreSQL baze može se koristiti:

- pgAdmin.
- DBeaver.
- TablePlus.
- DataGrip.

Podaci za lokalnu konekciju su najčešće:

```text
Host: localhost
Port: 5432
Database: eazy_properties
Username: postgres
Password: postgres
```

Ako se pgAdmin pokreće iz Docker containera, host baze je:

```text
db
```

---

## API dokumentacija

Swagger dokumentacija se nalazi u folderu:

```text
public/documents/
```

Može se otvoriti na adresi:

```text
http://localhost:3000/documents/swagger.html
```

OpenAPI fajl se nalazi na:

```text
public/documents/openapi.yaml
```

---

## Eksterni API servisi

Aplikacija koristi dva eksterna API servisa.

### Geoapify Places API

Koristi se za prikaz mesta u blizini nekretnine.

Primeri mesta:

- Restorani.
- Kafići.
- Supermarketi.
- Bolnice.
- Parkovi.
- Javni prevoz.

Ova funkcionalnost se koristi na stranici detalja nekretnine.

### Electricity Maps API

Koristi se za prikaz carbon intensity podataka za električnu energiju u određenoj zoni.

Primer:

```text
Current grid intensity: 320 gCO₂e/kWh
Zone: RS
```

Ova funkcionalnost pomaže korisniku da vidi koliko je lokalna električna mreža ekološki čista ili opterećena emisijama.

---

## Role-based pristup

Aplikacija prikazuje stranice u navigaciji na osnovu trenutno ulogovanog korisnika.

### Admin vidi:

- Home.
- Properties.
- Users CRUD.
- Analytics.

### Agent vidi:

- Home.
- Properties.
- Properties CRUD.
- Property Images CRUD.

### Client vidi:

- Home.
- Properties.
- Reservations CRUD.
- Reviews CRUD.

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

### External API rute

```text
GET /api/external/nearby-places
GET /api/external/electricity-carbon
```

### Admin analytics ruta

```text
GET /api/admin/analytics
```

---

## Baza podataka

Aplikacija koristi PostgreSQL bazu i MikroORM.

Glavni modeli su:

- User.
- Property.
- PropertyImage.
- Reservation.
- Review.

Ovi modeli su međusobno povezani relacijama.

Primeri relacija:

```text
User 1:N Property
User 1:N Reservation
User 1:N Review
Property 1:N PropertyImage
Property 1:N Reservation
Property 1:N Review
```

---

## Migracije

U projektu postoje tri različita tipa migracija:

### 1. Kreiranje tabela i spoljnih ključeva

Ova migracija kreira osnovne tabele i relacije između njih.

Primeri:

```text
users
properties
property_images
reservations
reviews
```

Takođe dodaje spoljne ključeve kao što su:

```text
properties.agent_id -> users.id
reservations.client_id -> users.id
reservations.property_id -> properties.id
reviews.client_id -> users.id
reviews.property_id -> properties.id
property_images.property_id -> properties.id
```

### 2. Default ograničenja

Ova migracija dodaje podrazumevane vrednosti.

Primeri:

```text
users.role default CLIENT
properties.price default 0
reservations.status default PENDING
created_at default now()
```

### 3. Unique ograničenja

Ova migracija dodaje jedinstvena ograničenja.

Primeri:

```text
users.email unique
reservations.client_id + property_id + start_date + end_date unique
reviews.client_id + property_id unique
```

---

## MikroORM objašnjenje

U aplikaciji je korišćen **MikroORM** kao ORM alat za rad sa PostgreSQL bazom podataka.

MikroORM omogućava:

- Definisanje modela kroz TypeScript entity klase.
- Definisanje relacija između modela.
- Rad sa bazom preko EntityManager-a.
- Kreiranje i izvršavanje migracija.
- Popunjavanje baze početnim podacima kroz seedere.
- Jednostavnije izvršavanje CRUD operacija bez pisanja SQL upita u API rutama.

Za razliku od Prisma ORM-a, gde se modeli definišu u `schema.prisma` fajlu, MikroORM koristi TypeScript klase kao entity modele.

---

## Napomena

Ova aplikacija je napravljena sa ciljem da bude jednostavna, čitljiva i laka za objašnjavanje.

Kod koristi engleske nazive promenljivih i funkcija, dok su komentari u kodu pisani na srpskom jeziku.
