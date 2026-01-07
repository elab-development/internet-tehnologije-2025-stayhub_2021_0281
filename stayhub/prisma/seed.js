const { PrismaClient, Prisma } = require("@prisma/client");
const { faker } = require("@faker-js/faker");
const bcrypt = require("bcrypt");

// Kreira Prisma klijent koji omogućava komunikaciju sa bazom podataka preko Prisma ORM-a.
const prisma = new PrismaClient();

// Pomoćna funkcija koja generiše slučajan ceo broj u opsegu [min, max].
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Pomoćna funkcija koja nasumično bira jedan element iz prosleđenog niza.
function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

// Pomoćna funkcija koja vraća novi datum dobijen dodavanjem određenog broja dana na postojeći datum.
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// Funkcija koja hešira plain-text lozinku korišćenjem bcrypt algoritma.
// Time se obezbeđuje da se lozinke ne čuvaju u čistom tekstu u bazi.
async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

// Definiše listu stvarnih gradova i poznatih/javnih adresa koje će se upisivati u tabelu Location.
// Time se obezbeđuje da podaci o lokaciji budu realistični i prepoznatljivi.
const REAL_LOCATIONS = [
  { city: "Belgrade", address: "Knez Mihailova 1" },
  { city: "Belgrade", address: "Bulevar kralja Aleksandra 73" },
  { city: "Belgrade", address: "Nemanjina 4" },
  { city: "Novi Sad", address: "Trg slobode 1" },
  { city: "Novi Sad", address: "Bulevar Mihajla Pupina 1" },
  { city: "Niš", address: "Obrenovićeva 1" },
  { city: "Kragujevac", address: "Trg slobode 3" },
  { city: "Subotica", address: "Korzo 1" },
  { city: "Zagreb", address: "Trg bana Jelačića 1" },
  { city: "Sarajevo", address: "Baščaršija 1" },
];

async function main() {
  // Briše postojeće podatke iz baze kako bi se seed pokretao više puta bez konflikata.
  // Briše se tačno ovim redosledom zbog spoljnih ključeva (FK):
  // Reservation zavisi od User i Property, Property zavisi od User/Location/Category, itd.
  await prisma.reservation.deleteMany();
  await prisma.property.deleteMany();
  await prisma.category.deleteMany();
  await prisma.location.deleteMany();
  await prisma.user.deleteMany();

  // 1) Popunjava tabelu Category.
  // Kreira više kategorija nekretnina i za svaku generiše kratak opis pomoću Faker biblioteke.
  const categoryNames = ["Apartment", "House", "Studio", "Villa", "Cabin", "Loft"];
  const categories = [];
  for (const name of categoryNames) {
    categories.push(
      await prisma.category.create({
        data: {
          name,
          description: faker.lorem.sentence(),
        },
      })
    );
  }

  // 2) Popunjava tabelu Location.
  // Kreira lokacije koristeći realne gradove i adrese iz niza REAL_LOCATIONS.
  // Svaka lokacija se kasnije vezuje za Property preko locationId (spoljni ključ).
  const locations = [];
  for (const loc of REAL_LOCATIONS) {
    locations.push(
      await prisma.location.create({
        data: {
          city: loc.city,
          address: loc.address,
        },
      })
    );
  }

  // 3) Popunjava tabelu User.
  // Kreira korisnike u ulogama SELLER i BUYER i čuva ih u odvojenim nizovima radi kasnijeg povezivanja.
  // Lozinke se pre upisa heširaju bcrypt-om (ne čuvaju se kao plain text).
  // Email mora biti jedinstven, pa se koristi Set da se izbegne dupliranje.
  const sellers = [];
  const buyers = [];

  const usedEmails = new Set();

  // Kreira jednog korisnika za zadatu ulogu (role) i prosleđenu plain lozinku.
  // Ako Faker generiše email koji već postoji, generiše novi dok ne dobije jedinstven.
  async function createUser(role, plainPassword) {
    let email = faker.internet.email().toLowerCase();
    while (usedEmails.has(email)) email = faker.internet.email().toLowerCase();
    usedEmails.add(email);

    return prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email,
        password: await hashPassword(plainPassword),
        userRole: role,
      },
    });
  }

  // Kreira 5 SELLER korisnika i 8 BUYER korisnika.
  // SELLER korisnici će kasnije “prodavati” nekretnine (Property.sellerId).
  // BUYER korisnici će kasnije “praviti” rezervacije (Reservation.userId).
  for (let i = 0; i < 5; i++) sellers.push(await createUser("SELLER", "Password123!"));
  for (let i = 0; i < 8; i++) buyers.push(await createUser("BUYER", "Password123!"));

  // Kreira jednog ADMIN korisnika sa fiksnim email-om.
  // I ovde se lozinka hešira pre upisa.
  await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@stayhub.local",
      password: await hashPassword("Admin123!"),
      userRole: "ADMIN",
    },
  });

  // 4) Popunjava tabelu Property.
  // Kreira 20 nekretnina i svakoj dodeljuje:
  // - sellerId: nasumično iz liste SELLER korisnika (veza User -> Property).
  // - locationId: nasumično iz liste Location (veza Location -> Property).
  // - categoryId: nasumično iz liste Category (veza Category -> Property).
  // Time se eksplicitno demonstriraju sve relacije definisane u šemi.
  const properties = [];
  for (let i = 0; i < 20; i++) {
    const priceNumber = randInt(30, 250);

    properties.push(
      await prisma.property.create({
        data: {
          name: faker.commerce.productName(),
          description: faker.lorem.paragraph(),
          image: faker.image.url(),
          price: new Prisma.Decimal(priceNumber.toFixed(2)),
          rooms: randInt(1, 6),

          sellerId: pick(sellers).id,
          locationId: pick(locations).id,
          categoryId: pick(categories).id,
        },
      })
    );
  }

  // 5) Popunjava tabelu Reservation.
  // Kreira 30 rezervacija gde je svaka rezervacija povezana sa:
  // - userId: nasumično iz liste BUYER korisnika (veza User -> Reservation).
  // - propertyId: nasumično iz liste Property (veza Property -> Reservation).
  // Takođe poštuje jedinstveno ograničenje @@unique([propertyId, startDate, endDate]).
  // Da bi se izbeglo kršenje ovog ograničenja, koristi se Set (usedCombos) za praćenje kombinacija.
  const usedCombos = new Set();
  const statuses = ["PENDING", "CONFIRMED", "CANCELLED"];

  let created = 0;
  while (created < 30) {
    const buyer = pick(buyers);
    const property = pick(properties);

    // Faker generiše startDate u bliskoj budućnosti, a endDate se dobija dodavanjem broja noćenja.
    const DAYS_OPTIONS = [30, 60, 90, 120];
    const start = faker.date.soon({ days: pick(DAYS_OPTIONS) });
    const nights = randInt(1, 7);
    const end = addDays(start, nights);

    // Ključ predstavlja jedinstvenu kombinaciju (propertyId, startDate, endDate).
    // Ako kombinacija već postoji, iteracija se preskače i generišu se novi datumi.
    const key = `${property.id}-${start.toISOString()}-${end.toISOString()}`;
    if (usedCombos.has(key)) continue;
    usedCombos.add(key);

    // Ukupna cena se računa kao cena po noći * broj noćenja.
    const total = Number(property.price) * nights;

    await prisma.reservation.create({
      data: {
        startDate: start,
        endDate: end,
        totalPrice: new Prisma.Decimal(total.toFixed(2)),
        status: pick(statuses),

        userId: buyer.id,
        propertyId: property.id,
      },
    });

    created++;
  }

  // Ispisuje informativne poruke nakon uspešnog seed-ovanja.
  // Naglašava da su lozinke u bazi heširane, dok se ovde navodi njihov plain oblik radi testiranja.
  console.log("Seed finished.");
  console.log('SELLER/BUYER password (plain): "Password123!" (u bazi je bcrypt hash).');
  console.log('ADMIN password (plain): "Admin123!" (u bazi je bcrypt hash).');
}

// Pokreće seed logiku.
// U slučaju greške ispisuje grešku i završava proces sa exit code 1.
// Na kraju uvek zatvara Prisma konekciju ($disconnect) da ne ostane “otvoren” proces.
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
