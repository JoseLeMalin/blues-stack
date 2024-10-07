import Pool from "pg";

const dropTables = async () => {
  console.log("Start dropping tables");
  const dbConfig = {
    user: "postgres",
    password: "postgres",
    host: "localhost",
    port: 5432,
    database: "postgres",
    // database: "postgresql://postgres:postgres@localhost:5432/postgres",
  };

  const pool = new Pool.Pool(dbConfig);
  const dropTableNote = `DROP TABLE "Note" CASCADE;`;
  const dropTablePassword = `DROP TABLE "Password" CASCADE;`;
  const dropTableUser = `DROP TABLE "User" CASCADE;`;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(dropTableUser);
    await client.query(dropTableNote);
    await client.query(dropTablePassword);
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
  console.log("End dropping tables");
};

await dropTables().catch((e) => {
  console.error(e);
  process.exit(1);
});
