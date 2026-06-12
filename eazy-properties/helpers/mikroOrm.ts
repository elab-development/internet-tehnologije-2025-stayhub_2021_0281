import "reflect-metadata";
import { MikroORM } from "@mikro-orm/postgresql";
import config from "@/mikro-orm.config";

type GlobalMikroOrm = {
  orm?: MikroORM;
};

const globalForMikroOrm = global as unknown as GlobalMikroOrm;

export async function getOrm() {
  // U development modu čuvamo ORM globalno da se ne kreira nova konekcija stalno.
  if (!globalForMikroOrm.orm) {
    globalForMikroOrm.orm = await MikroORM.init(config);
  }

  return globalForMikroOrm.orm;
}

export async function getEntityManager() {
  const orm = await getOrm();

  // Fork pravi bezbedan EntityManager za svaki request.
  return orm.em.fork();
}