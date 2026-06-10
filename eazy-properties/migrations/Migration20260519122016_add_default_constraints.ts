import { Migration } from "@mikro-orm/migrations";

export class Migration20260519120100 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      alter table "users"
      alter column "role" set default 'CLIENT';
    `);

    this.addSql(`
      alter table "users"
      alter column "created_at" set default now();
    `);

    this.addSql(`
      alter table "properties"
      alter column "price" set default 0;
    `);

    this.addSql(`
      alter table "properties"
      alter column "created_at" set default now();
    `);

    this.addSql(`
      alter table "reservations"
      alter column "status" set default 'PENDING';
    `);

    this.addSql(`
      alter table "reservations"
      alter column "created_at" set default now();
    `);

    this.addSql(`
      alter table "reviews"
      alter column "created_at" set default now();
    `);
  }

  override async down(): Promise<void> {
    this.addSql(`
      alter table "users"
      alter column "role" drop default;
    `);

    this.addSql(`
      alter table "users"
      alter column "created_at" drop default;
    `);

    this.addSql(`
      alter table "properties"
      alter column "price" drop default;
    `);

    this.addSql(`
      alter table "properties"
      alter column "created_at" drop default;
    `);

    this.addSql(`
      alter table "reservations"
      alter column "status" drop default;
    `);

    this.addSql(`
      alter table "reservations"
      alter column "created_at" drop default;
    `);

    this.addSql(`
      alter table "reviews"
      alter column "created_at" drop default;
    `);
  }
}