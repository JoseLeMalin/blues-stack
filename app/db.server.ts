import invariant from "tiny-invariant";
import Pool from "pg";

import { singleton } from "./singleton.server";
// https://github.com/salsita/node-pg-migrate
// https://synvinkel.org/notes/node-postgres-migrations
// https://medium.com/@mateogalic112/how-to-build-a-node-js-api-with-postgresql-and-typescript-best-practices-and-tips-84fee3d1c46c
// Hard-code a unique key, so we can look up the client when this module gets re-imported
const prisma = singleton("prisma", getPrismaClient);

function getPrismaClient() {
  const { DATABASE_URL } = process.env;
  invariant(typeof DATABASE_URL === "string", "DATABASE_URL env var not set");

  const databaseUrl = new URL(DATABASE_URL);

  const isLocalHost = databaseUrl.hostname === "localhost";

  const PRIMARY_REGION = isLocalHost ? null : process.env.PRIMARY_REGION;
  const FLY_REGION = isLocalHost ? null : process.env.FLY_REGION;

  const isReadReplicaRegion = !PRIMARY_REGION || PRIMARY_REGION === FLY_REGION;

  if (!isLocalHost) {
    if (databaseUrl.host.endsWith(".internal")) {
      databaseUrl.host = `${FLY_REGION}.${databaseUrl.host}`;
    }

    if (!isReadReplicaRegion) {
      // 5433 is the read-replica port
      databaseUrl.port = "5433";
    }
  }

  console.log(`🔌 setting up prisma client to ${databaseUrl.host}`);
  // NOTE: during development if you change anything in this function, remember
  // that this only runs once per server restart and won't automatically be
  // re-run per request like everything else is. So if you need to change
  // something in this file, you'll need to manually restart the server.
  /* const client = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl.toString(),
      },
    },
  });
  // connect eagerly
  client.$connect();

  return client; */
}

export { prisma };

/* export const connectToPostgres = () => { */
// Database connection configuration

const dbConfig: Pool.PoolConfig = {
  user: "postgres",
  password: "postgres",
  host: "localhost",
  port: 5432,
  database: "postgres",
  // database: "postgresql://postgres:postgres@localhost:5432/postgres",
};
const pool = new Pool.Pool(dbConfig);
// Create a new PostgreSQL client
// export const client = new Client.Client(dbConfig);
/* client
    .connect()
    .then(() => {
      console.log("Connected to PostgreSQL database");
      client.end().then(() => {
        console.log("Connection to PostgreSQL closed");
      });
    })
    .catch((err) => {
      console.error("Error connecting to PostgreSQL database", err);
    }); */
/* }; */
export default pool;
