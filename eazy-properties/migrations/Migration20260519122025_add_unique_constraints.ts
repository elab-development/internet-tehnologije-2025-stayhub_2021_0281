import { Migration } from "@mikro-orm/migrations";

export class Migration20260519120200 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      alter table "users"
      add constraint "users_email_unique"
      unique ("email");
    `);

    this.addSql(`
      alter table "reservations"
      add constraint "reservations_client_property_dates_unique"
      unique ("client_id", "property_id", "start_date", "end_date");
    `);

    this.addSql(`
      alter table "reviews"
      add constraint "reviews_client_property_unique"
      unique ("client_id", "property_id");
    `);
  }

  override async down(): Promise<void> {
    this.addSql(`
      alter table "reviews"
      drop constraint if exists "reviews_client_property_unique";
    `);

    this.addSql(`
      alter table "reservations"
      drop constraint if exists "reservations_client_property_dates_unique";
    `);

    this.addSql(`
      alter table "users"
      drop constraint if exists "users_email_unique";
    `);
  }
}