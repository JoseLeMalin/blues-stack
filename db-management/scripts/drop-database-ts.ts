import pool from "@/db.server";

async function dropDatabase() {
  // Connect to postgres default database instead of the target database
  const client = await pool.connect();
  const dbName = "postgres";
  try {
    // Terminate all connections to the target database
    await client.query(`
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = '${dbName}'
            AND pid <> pg_backend_pid();
        `);

    // Drop the database
    await client.query(`DROP DATABASE IF EXISTS ${dbName};`);

    console.log(`Database ${dbName} has been dropped successfully`);
  } catch (error) {
    console.error("Error dropping database:", error);
    throw error;
  } finally {
    // Close the connection
    client.release();
    await pool.end();
  }
}

export default dropDatabase;
